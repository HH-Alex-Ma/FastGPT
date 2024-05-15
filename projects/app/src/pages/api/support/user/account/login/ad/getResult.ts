import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { connectToDatabase } from '@/service/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();

    const { authCode } = req.query as { authCode: string };
    if (!authCode) {
      jsonRes(res, {
        code: 401,
        error: '认证登录失败'
      });
    } else {
      const result = await fetch(`http://127.0.0.1:8000/api/ad/oauth?code=${authCode}`);
      const resultDate = await result.text();
      const user = await MongoUser.findOne({ username: resultDate });
      if (!user) {
        jsonRes(res, {
          code: 400,
          error: '用户不存在'
        });
      } else {
        const userDetail = await getUserDetail({
          tmbId: user?.lastLoginTmbId,
          userId: user._id
        });
        MongoUser.findByIdAndUpdate(user._id, {
          lastLoginTmbId: userDetail.team.tmbId
        });

        const token = createJWT(userDetail);
        setCookie(res, token);

        jsonRes(res, {
          data: {
            user: userDetail,
            token
          }
        });
      }
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
