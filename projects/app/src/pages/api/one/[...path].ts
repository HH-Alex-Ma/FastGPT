import type { NextApiRequest, NextApiResponse } from 'next';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { jsonRes } from '@fastgpt/service/common/response';

type ResponseData = {
  data: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const baseUrl = process.env.ONEAPI_SERVER_URL || '';
    const ApiKey = process.env.ONEAPI_SERVER_TOKEN || '';

    const { tmbId } = await authCert({ req, authToken: true });
    const tmb = await MongoTeamMember.findById(tmbId);
    if (!tmb) {
      throw new Error('can not find it');
    }
    const requestPath = req.url?.replace('/api/one', ''); // 获取完整的请求路径
    const method = req.method; // 获取请求方法
    let header: any = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Authorization: 'Bearer ' + ApiKey
    };
    let fetchOptions: RequestInit = {};
    if (req.body != null && JSON.stringify(req.body) != '{}') {
      fetchOptions = {
        headers: header,
        method: method,
        body: JSON.stringify(req.body)
      };
    } else {
      fetchOptions = {
        headers: header,
        method: method
      };
    }

    const data = await fetch(baseUrl + requestPath, fetchOptions);
    const jsonData = await data.json();
    if (jsonData.data) {
      return res.status(200).json(jsonData);
    } else {
      return res.status(200).json({ data: jsonData });
    }
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
