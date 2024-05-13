import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddRoleType } from '@fastgpt/global/support/user/userType';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { tmbId } = await authCert({ req, authToken: true });
    const tmb = await MongoTeamMember.findById(tmbId);
    if (!tmb) {
      throw new Error('can not find it');
    }
    const { name, desc, apps } = req.body as AddRoleType;

    if (!name) {
      throw new Error('缺少参数');
    }

    await MongoRole.create([
      {
        name: name,
        desc: desc,
        apps: apps
      }
    ]);

    jsonRes(res, {
      message: '创建成功'
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
