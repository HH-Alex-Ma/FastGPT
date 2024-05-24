import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { hashStr } from '@fastgpt/global/common/string/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
  const API_TOKEN = process.env.API_TOKEN ? process.env.API_TOKEN : '';

  try {
    await connectToDatabase();
    const { phone } = req.body as { phone: string };
    const userInfo = await MongoUser.findOne({
      username: phone
    });
    if (!userInfo) {
      const result = await fetch(`${AD_CLIENT_URL}/api/code/${phone}`, {
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Token-Key': hashStr(API_TOKEN)
        },
        method: 'POST'
      });
      const resultDate = await result.json();
      if (resultDate.code != 200) {
        jsonRes(res, {
          code: 500,
          error: resultDate.message || '请求错误，参数不合法'
        });
      }
      jsonRes(res, {
        data: resultDate.data
      });
    } else {
      throw new Error('账户已存在');
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
