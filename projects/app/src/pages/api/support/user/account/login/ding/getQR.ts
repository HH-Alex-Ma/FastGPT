import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { nanoid } from 'nanoid';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const DING_APP_KEY = process.env.DING_APP_KEY ? process.env.DING_APP_KEY : '';
  const DING_TALK = process.env.DING_TALK ? process.env.DING_TALK : '';
  const REDIRECT_URI = process.env.REDIRECT_URI ? process.env.REDIRECT_URI : '';
  // const REDIRECT_URI = `http://${req.headers.host}/login/auth`;

  try {
    //记录
    const authorizeUrl = `${DING_TALK}?client_id=${DING_APP_KEY}&response_type=code&scope=openid&prompt=consent&state=${nanoid()}&redirect_uri=${REDIRECT_URI}`;
    jsonRes(res, {
      data: {
        code: 200,
        url: authorizeUrl
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
