import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoCollaborator } from '@fastgpt/service/support/user/collaborator/schema';
import { connectToDatabase } from '@/service/mongo';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { tmbId } = await authCert({ req, authToken: true });
    const tmb = await MongoTeamMember.findById(tmbId);
    if (!tmb) {
      throw new Error('can not find it');
    }

    const { appId } = req.query as { appId: string };

    if (!appId) {
      throw new Error('缺少参数');
    }
    //记录
    let dataResult: any[] = [];
    const result = await MongoCollaborator.findOne({ appId: appId });
    if (result) {
      const resultMember = await MongoTeamMember.find({ _id: { $in: result?.tmbIds } });
      for (let element of resultMember) {
        const userResult = await MongoUser.findById(element.userId);
        dataResult.push({
          name: element?.userId,
          memberName: userResult?.nickname,
          tmbId: element._id,
          teamId: element.teamId,
          avatar: userResult?.avatar,
          permission: 0
        });
      }
    }
    jsonRes(res, {
      data: dataResult
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
