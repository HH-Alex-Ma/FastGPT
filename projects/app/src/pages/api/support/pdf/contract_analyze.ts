// pages/api/support/pdf/contract_analyze.ts

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

// 函数: 获取 Access Token
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

// 处理 API 请求
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

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return res.status(500).json({ error: 'Failed to get access token' });
      }

      console.log('Access Token:', accessToken);

      const formData = new FormData();
      formData.append('templateName', templateName as string);
      formData.append('commentRiskLevel', commentRiskLevel as string);

      // 读取文件并添加到 formData
      const fileStream = fs.createReadStream(file.filepath);
      formData.append('file', fileStream, { filename: path.basename(file.filepath) });

      const analyzeResponse = await fetch(
        `${process.env.BAIDU_API_URL}/file/2.0/brain/online/v1/textreview/task?access_token=${accessToken}`,
        {
          method: 'POST',
          body: formData as any,
          headers: formData.getHeaders()
        }
      );

      const analyzeData = (await analyzeResponse.json()) as any;
      console.log('Analyze Response:', analyzeData);

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        return res
          .status(500)
          .json({ error: `Failed to submit contract for analysis. Response: ${errorText}` });
      }

      const taskId = analyzeData.result?.taskId;
      if (!taskId) {
        return res.status(500).json({ error: 'Task ID not found in response' });
      }

      return res.status(200).json({ taskId });
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}
