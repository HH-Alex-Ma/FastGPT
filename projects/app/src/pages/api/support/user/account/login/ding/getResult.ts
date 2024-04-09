import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { connectToDatabase } from '@/service/mongo';
import Util, * as $Util from '@alicloud/tea-util';
import dingtalkoauth2_1_0, * as $dingtalkoauth2_1_0 from '@alicloud/dingtalk/oauth2_1_0';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import * as $tea from '@alicloud/tea-typescript';
import dingtalkcontact_1_0, * as $dingtalkcontact_1_0 from '@alicloud/dingtalk/contact_1_0';

const DING_APP_KEY = process.env.DING_APP_KEY ? process.env.DING_APP_KEY : '';
const DING_APP_SECRET = process.env.DING_APP_SECRET ? process.env.DING_APP_SECRET : '';
const DING_GET_BY_UNIONID = process.env.DING_GET_BY_UNIONID ? process.env.DING_GET_BY_UNIONID : '';

const createClient = (): dingtalkoauth2_1_0 => {
  let config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';
  return new dingtalkoauth2_1_0(config);
};

const createContactClient = (): dingtalkcontact_1_0 => {
  let config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';
  return new dingtalkcontact_1_0(config);
};

// 获取企业内部应用的accessToken
const getAccessToken = () => {
  let client = createClient();
  let getAccessTokenRequest = new $dingtalkoauth2_1_0.GetAccessTokenRequest({
    appKey: DING_APP_KEY,
    appSecret: DING_APP_SECRET
  });
  try {
    return client.getAccessToken(getAccessTokenRequest);
    // return result.body.access_token;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

const getUnionId = (access_token: string) => {
  let client = createContactClient();
  let getUserHeaders = new $dingtalkcontact_1_0.GetUserHeaders({});
  getUserHeaders.xAcsDingtalkAccessToken = access_token;
  try {
    const result = client.getUserWithOptions('me', getUserHeaders, new $Util.RuntimeOptions({}));
    return result;
  } catch (err: any) {
    if (!Util.empty(err.code) && !Util.empty(err.message)) {
      // err 中含有 code 和 message 属性，可帮助开发定位问题
      throw new Error(err.message);
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { authCode } = req.query as { authCode: string };
    if (!authCode) {
      throw new Error('参数不存在');
    }
    let client = createClient();
    let getUserTokenRequest = new $dingtalkoauth2_1_0.GetUserTokenRequest({
      clientSecret: DING_APP_SECRET,
      clientId: DING_APP_KEY,
      code: authCode as string,
      grantType: 'authorization_code'
    });
    try {
      const userRes = await client.getUserToken(getUserTokenRequest);
      const access_token = userRes.body.accessToken;
      const unionIdRes = await getUnionId(access_token);
      const unionId = unionIdRes.body.unionId;
      const accessToken = await getAccessToken();
      const publicAccessToken = accessToken.body.accessToken;

      let fetchOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
        method: 'POST',
        body: JSON.stringify({ unionid: unionId })
      };

      const userData = await fetch(
        `${DING_GET_BY_UNIONID}?access_token=${publicAccessToken}`,
        fetchOptions
      );
      const jsonData = await userData.json();
      // 用户登录
      const username = jsonData.result.userid;
      const user = await MongoUser.findOne({ username: username });

      if (!user) {
        throw new Error('用户不存在');
      }

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
    } catch (err: any) {
      if (!Util.empty(err.code) && !Util.empty(err.message)) {
        // err 中含有 code 和 message 属性，可帮助开发定位问题
        throw new Error(err.message);
      }
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
