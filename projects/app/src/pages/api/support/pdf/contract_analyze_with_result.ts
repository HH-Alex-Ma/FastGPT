// projects\app\src\pages\api\support\pdf\contract_analyze_with_result.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

async function getAccessToken(): Promise<string> {
  const BAIDU_API_URL = process.env.BAIDU_API_URL || '';
  const BAIDU_CLIENT_ID = process.env.BAIDU_CLIENT_ID || '';
  const BAIDU_CLIENT_SECRET = process.env.BAIDU_CLIENT_SECRET || '';

  const response = await fetch(
    `${BAIDU_API_URL}/oauth/2.0/token?client_id=${BAIDU_CLIENT_ID}&client_secret=${BAIDU_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  const data = await response.json();
  if (response.ok) {
    return data.access_token;
  } else {
    throw new Error('Failed to get access token');
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== 'POST') {
    return jsonRes(res, {
      code: 405,
      error: 'Method not allowed'
    });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return jsonRes(res, {
        code: 500,
        error: 'Error parsing form data'
      });
    }

    const { templateName, commentRiskLevel } = fields;
    const file = files.file as formidable.File | undefined;
    const fileURLList = fields.fileURLList ? JSON.parse(fields.fileURLList as string) : [];

    if (!templateName || typeof templateName !== 'string') {
      return jsonRes(res, {
        code: 400,
        error: 'Missing or invalid required parameter: templateName'
      });
    }

    try {
      const accessToken = await getAccessToken();

      const formData = new FormData();
      formData.append('templateName', templateName);
      if (commentRiskLevel && typeof commentRiskLevel === 'string') {
        formData.append('commentRiskLevel', commentRiskLevel);
      }

      if (file) {
        formData.append('file', fs.createReadStream(file.filepath), { filename: file.originalFilename });
      } else if (fileURLList.length > 0) {
        formData.append('fileURLList', JSON.stringify(fileURLList));
      } else {
        return jsonRes(res, {
          code: 400,
          error: 'Missing required parameter: file or fileURLList'
        });
      }

      const taskResponse = await fetch(
        `https://aip.baidubce.com/file/2.0/brain/online/v1/textreview/task?access_token=${accessToken}`,
        {
          method: 'POST',
          body: formData as any,
          headers: formData.getHeaders() // Ensure headers are set correctly
        }
      );

      const taskData = await taskResponse.json();

      if (taskResponse.ok && taskData.result && taskData.result.taskId) {
        // Get task result
        const resultResponse = await fetch(
          `https://aip.baidubce.com/file/2.0/brain/online/v1/textreview/task/query?access_token=${accessToken}`,
          {
            method: 'POST',
            body: JSON.stringify({ taskId: taskData.result.taskId }),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          }
        );

        const resultData = await resultResponse.json();

        if (resultResponse.ok) {
          jsonRes(res, {
            code: 200,
            data: {
              taskId: taskData.result.taskId,
              result: resultData
            }
          });
        } else {
          jsonRes(res, {
            code: 500,
            error: resultData.error_msg || 'Failed to get task result'
          });
        }
      } else {
        jsonRes(res, {
          code: 500,
          error: taskData.error_msg || 'Failed to submit task'
        });
      }
    } catch (err: any) {
      jsonRes(res, {
        code: 500,
        error: err.message
      });
    }
  });
}
