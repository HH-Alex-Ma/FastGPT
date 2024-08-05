import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();

    // 凭证校验
    const { teamId, userId } = await authCert({ req, authToken: true });
    if (!teamId) {
      throw new Error('can not find it');
    }
    const result = await MongoTeamMember.find({ teamId: teamId });

    let dataResult: any[] = [];

    for (let element of result) {
      const userResult = await MongoUser.findById(element.userId);
      if (userResult?.username !== 'root' && userResult?.username !== userId) {
        dataResult.push({
          userId: element?.userId,
          memberName: userResult?.nickname,
          tmbId: element._id,
          teamId: element.teamId,
          avatar: userResult?.avatar,
          role: element?.role,
          status: element?.status
        });
      }
    }
    //记录
    jsonRes(res, {
      data: dataResult
    });
  } catch (err) {
    res.status(500);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
