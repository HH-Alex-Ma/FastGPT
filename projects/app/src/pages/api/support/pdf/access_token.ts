// projects\app\src\pages\api\support\pdf\access_token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const BAIDU_API_URL = process.env.BAIDU_API_URL ? process.env.BAIDU_API_URL : '';
  const BAIDU_CLIENT_ID = process.env.BAIDU_CLIENT_ID ? process.env.BAIDU_CLIENT_ID : '';
  const BAIDU_CLIENT_SECRET = process.env.BAIDU_CLIENT_SECRET
    ? process.env.BAIDU_CLIENT_SECRET
    : '';

  try {
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
    console.log(data);

    if (response.ok) {
      // 使用 response.ok 判断请求是否成功
      console.log('access_token', data.access_token);
      jsonRes(res, {
        data: {
          code: 200,
          access_token: data.access_token
        }
      });
    } else {
      // 处理错误情况，不尝试从错误响应中读取 access_token
      jsonRes(res, {
        data: {
          code: 500,
          data: '请求错误，请联系管理员'
        }
      });
    }
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err.message // 更改为 err.message 以提供错误详情
    });
  }
}
