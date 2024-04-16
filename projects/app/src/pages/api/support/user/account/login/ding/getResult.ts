import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { connectToDatabase } from '@/service/mongo';
import Util, * as $Util from '@alicloud/tea-util';
import dingtalkoauth2_1_0, * as $dingtalkoauth2_1_0 from '@alicloud/dingtalk/oauth2_1_0';
import Client, * as $OpenApi from '@alicloud/openapi-client';
import * as $tea from '@alicloud/tea-typescript';
import dingtalkcontact_1_0, * as $dingtalkcontact_1_0 from '@alicloud/dingtalk/contact_1_0';

const DING_APP_KEY = process.env.DING_APP_KEY ? process.env.DING_APP_KEY : '';
const DING_APP_SECRET = process.env.DING_APP_SECRET ? process.env.DING_APP_SECRET : '';

const createClient = (): Client => {
  let config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';
  return new dingtalkoauth2_1_0(config);
};

const createContactClient = (): Client => {
  let config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';
  return new dingtalkcontact_1_0(config);
};

const getUnionId = (access_token: string) => {
  let client = createContactClient();
  let getUserHeaders = new $dingtalkcontact_1_0.GetUserHeaders({});
  getUserHeaders.xAcsDingtalkAccessToken = access_token;
  const result = client.getUserWithOptions('me', getUserHeaders, new $Util.RuntimeOptions({}));
  return result;
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
        let client = createClient();
        let getUserTokenRequest = new $dingtalkoauth2_1_0.GetUserTokenRequest({
          clientSecret: DING_APP_SECRET,
          clientId: DING_APP_KEY,
          code: authCode as string,
          grantType: 'authorization_code'
        });
        const userRes = await client.getUserToken(getUserTokenRequest);
        if (userRes.statusCode != 200) {
          jsonRes(res, {
            code: 400,
            error: '参数错误:不合法的参数'
          });
        }
        const access_token = userRes.body.accessToken;
        const unionIdRes = await getUnionId(access_token);
        const unionId = unionIdRes.body.unionId;
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
        if (!Util.empty(err.code) && !Util.empty(err.message)) {
          // err 中含有 code 和 message 属性，可帮助开发定位问题
          console.log(err);
          jsonRes(res, {
            code: 400,
            error: err.message
          });
        }
      }
    }
  } catch (err) {
    jsonRes(res, {
      code: 400,
      error: err
    });
  }
}
