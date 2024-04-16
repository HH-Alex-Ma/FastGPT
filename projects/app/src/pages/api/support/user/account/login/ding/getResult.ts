import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { connectToDatabase } from '@/service/mongo';

const DING_APP_KEY = process.env.DING_APP_KEY ? process.env.DING_APP_KEY : '';
const DING_APP_SECRET = process.env.DING_APP_SECRET ? process.env.DING_APP_SECRET : '';

const getUnionId = async (access_token: string) => {
  let fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'x-acs-dingtalk-access-token': access_token
    },
    method: 'GET'
  };
  return await fetch('https://api.dingtalk.com/v1.0/contact/users/me', fetchOptions);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (DING_APP_KEY == '' || DING_APP_SECRET == '') {
      throw new Error('钉钉认证信息未配置，请优先填写配置信息');
    }
    await connectToDatabase();
    const { authCode } = req.query as { authCode: string };
    if (!authCode) {
      jsonRes(res, {
        code: 401,
        error: '认证登录失败'
      });
    } else {
      try {
        let fetchOptions: RequestInit = {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            clientSecret: DING_APP_SECRET,
            clientId: DING_APP_KEY,
            code: authCode as string,
            grantType: 'authorization_code'
          })
        };
        const userAccessTokenResult = await fetch(
          'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
          fetchOptions
        );
        const userAccessTokenData = await userAccessTokenResult.json();
        if (userAccessTokenResult.status != 200) {
          console.log(userAccessTokenData);
          jsonRes(res, {
            code: 400,
            error: '参数错误:不合法的参数'
          });
        }
        const access_token = userAccessTokenData.accessToken;
        const unionResult = await getUnionId(access_token);
        const unionData = await unionResult.json();
        const unionId = unionData.unionId;
        const user = await MongoUser.findOne({ DindDing: unionId });
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
      } catch (err: any) {
        // err 中含有 code 和 message 属性，可帮助开发定位问题
        console.log(err);
        jsonRes(res, {
          code: 400,
          error: err.message
        });
      }
    }
  } catch (err) {
    jsonRes(res, {
      code: 400,
      error: err
    });
  }
}
