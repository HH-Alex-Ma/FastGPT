import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const EXTERNEL_URL = process.env.EXTERNEL_URL ? process.env.EXTERNEL_URL : '';

  try {
    const reponse = EXTERNEL_URL;
    jsonRes(res, { data: { code: 200, url: reponse } });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
