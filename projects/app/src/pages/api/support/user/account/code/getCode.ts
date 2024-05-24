import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { hashStr } from '@fastgpt/global/common/string/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
  const API_TOKEN = process.env.API_TOKEN ? process.env.API_TOKEN : '';

  try {
    //记录
    const result = await fetch(AD_CLIENT_URL + '/api/code', {
      headers: {
        'Content-Type': 'application/json',
        'Token-Key': hashStr(API_TOKEN)
      },
      method: 'POST'
    });
    const resultDate = await result.json();
    console.log(resultDate);
    jsonRes(res, {
      data: {
        code: 200,
        key: resultDate.uuid,
        value: resultDate.data
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
