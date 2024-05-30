import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { hashStr } from '@fastgpt/global/common/string/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
  const API_TOKEN = process.env.API_TOKEN ? process.env.API_TOKEN : '';

  try {
    //记录
    const result = await fetch(AD_CLIENT_URL + '/api/ad/authorize', {
      headers: {
        'Content-Type': 'application/json',
        'Token-Key': hashStr(API_TOKEN)
      }
    });
    const resultDate = await result.json();
    console.log(resultDate);
    if (resultDate.code == 200) {
      jsonRes(res, {
        data: {
          code: 200,
          data: resultDate.data
        }
      });
    } else {
      jsonRes(res, {
        data: {
          code: 500,
          data: resultDate.code == 20001 ? resultDate.message : '请求错误，请联系管理员'
        }
      });
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
