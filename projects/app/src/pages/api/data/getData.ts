import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const EXTERNEL_URL = process.env.EXTERNEL_URL ? process.env.EXTERNEL_URL : '';

  // 从请求体中获取 text 参数
  const { text } = req.body;

  try {
    // await authCert({ req, authToken: true });

    let header: any = {
      'Content-Type': 'application/json'
    };
    let fetchOptions: RequestInit = {
      headers: header,
      method: 'POST',
      body: JSON.stringify({ text: text })
    };
    const response = await fetch(EXTERNEL_URL, fetchOptions);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('getData data', data);
    jsonRes(res, data);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
