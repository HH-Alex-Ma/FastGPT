// pages/api/contractAnalyzeWithResult.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false
  }
};

const uploadDir = path.join(process.cwd(), '/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.BAIDU_CLIENT_ID;
  const clientSecret = process.env.BAIDU_CLIENT_SECRET;
  const tokenUrl = `${process.env.BAIDU_API_URL}/oauth/2.0/token`;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId!,
    client_secret: clientSecret!
  });

  try {
    console.log(`Requesting access token from: ${tokenUrl}`);
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: params.toString()
    });
    const data = (await response.json()) as any;
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

async function getContractReviewResult(
  accessToken: string,
  taskId: string,
  retryCount: number = 0
): Promise<any> {
  const queryUrl = `${process.env.BAIDU_API_URL}/file/2.0/brain/online/v1/textreview/task/query?access_token=${accessToken}`;
  const formData = new FormData();
  formData.append('taskId', taskId);

  const controller = new AbortController();

  try {
    console.log(`Querying contract review result for taskId: ${taskId}`);
    const response = await fetch(queryUrl, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get contract review result. Response: ${errorText}`);
    }

    const result = (await response.json()) as any;
    console.log('Query Result:', JSON.stringify(result, null)); // Log the detailed result here

    if (result.result.status === 'success') {
      return result;
    } else if (result.result.status === 'pending' || result.result.status === 'running') {
      console.log('Contract review still running. Retrying in 1 minute...');
      if (retryCount >= 30) {
        throw new Error('Exceeded maximum retry attempts');
      }
      await new Promise((resolve) => setTimeout(resolve, 30000)); // 等待 30 秒后重试
      return getContractReviewResult(accessToken, taskId, retryCount + 1); // 递归调用，直到获取到结果
    } else {
      throw new Error(`Unexpected status: ${result.result.status}`);
    }
  } catch (error) {
    console.error('Error fetching contract review result:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    uploadDir: uploadDir
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Failed to parse form data', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    const { templateName, commentRiskLevel } = fields;
    const file = files.file ? (files.file as formidable.File) : null;

    if (!templateName || !commentRiskLevel) {
      return res.status(400).json({ error: 'templateName and commentRiskLevel are required' });
    }

    if (!file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const filePath = file.filepath;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return res.status(500).json({ error: 'Failed to get access token' });
      }

      console.log('Access Token:', accessToken);

      const analyzeFormData = new FormData();
      analyzeFormData.append('templateName', templateName as string);
      analyzeFormData.append('commentRiskLevel', commentRiskLevel as string);
      const fileStream = fs.createReadStream(filePath);
      analyzeFormData.append('file', fileStream, { filename: path.basename(filePath) });

      const analyzeResponse = await fetch(
        `${process.env.BAIDU_API_URL}/file/2.0/brain/online/v1/textreview/task?access_token=${accessToken}`,
        {
          method: 'POST',
          body: analyzeFormData,
          headers: analyzeFormData.getHeaders()
        }
      );

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        return res
          .status(500)
          .json({ error: `Failed to submit contract for analysis. Response: ${errorText}` });
      }

      const analyzeData = (await analyzeResponse.json()) as any;
      const taskId = analyzeData.result?.taskId;
      if (!taskId) {
        return res.status(500).json({ error: 'Task ID not found in response' });
      }

      // 获取结果并记录到控制台
      const result = await getContractReviewResult(accessToken, taskId);
      console.log('Final Review Result:', JSON.stringify(result, null)); // Log the final result here

      // 清理上传的临时文件
      try {
        await fs.promises.unlink(filePath);
        console.log(`Deleted temporary file: ${filePath}`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Unexpected error:', error);

      // 发生错误时清理文件
      try {
        await fs.promises.unlink(filePath);
        console.log(`Deleted temporary file after error: ${filePath}`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file after error:', cleanupError);
      }

      return res.status(500).json({ error: error.message });
    }
  });
}
