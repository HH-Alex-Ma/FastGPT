import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import type { AuthCode } from '@fastgpt/global/support/user/userType';
import { hashStr } from '@fastgpt/global/common/string/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
    const API_TOKEN = process.env.API_TOKEN ? process.env.API_TOKEN : '';

    const { username, msgToken } = req.body as AuthCode;
    if (!username || !msgToken) {
      throw new Error('参数不能为空');
    }

    let fetchOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Token-Key': hashStr(API_TOKEN)
      },
      method: 'POST',
      body: JSON.stringify({
        token: msgToken
      })
    };
    const result = await fetch(`${AD_CLIENT_URL}/api/msg/${username}/code`, fetchOptions);
    const data = await result.json();
    if (data.code != 200) {
      jsonRes(res, {
        code: 500,
        error: data.message
      });
    }
    jsonRes(res);
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
