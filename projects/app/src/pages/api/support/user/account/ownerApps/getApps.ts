import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectToDatabase } from '@/service/mongo';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoApp } from '@fastgpt/service/core/app/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    let data: string[] = [];
    const { id, tmbId } = req.query as { id: string; tmbId: string };
    //记录
    const userInfo = await MongoUser.findOne({ _id: id });
    if (userInfo && userInfo.roleId && userInfo.roleId != '') {
      const roleInfo = await MongoRole.findOne({ _id: userInfo.roleId });
      roleInfo?.apps.map((app: any) => data.push(app.value));
    }

    const apps = await MongoApp.find({ tmbId: tmbId });
    apps.map((item: any) => data.push(item._id));
    jsonRes(res, {
      data
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
