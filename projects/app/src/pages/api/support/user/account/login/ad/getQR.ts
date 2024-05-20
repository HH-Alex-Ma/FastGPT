import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
  try {
    //记录
    const result = await fetch(AD_CLIENT_URL + '/api/ad/authorize');
    const resultDate = await result.text();
    console.log(resultDate);
    jsonRes(res, {
      data: {
        code: 200,
        url: resultDate
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
