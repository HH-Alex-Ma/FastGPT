import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoCollaborator } from '@fastgpt/service/support/user/collaborator/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddCollaboratorType } from '@fastgpt/global/support/user/userType';
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

    const { appId, delTmbId } = req.query as { appId: string; delTmbId: string };

    if (!appId || !delTmbId) {
      throw new Error('缺少参数');
    }
    //记录
    const result = await MongoCollaborator.findOne({ appId: appId });
    console.log(result, appId);
    if (result) {
      const updateTmbIds = result.tmbIds.filter((v) => v !== delTmbId);
      await MongoCollaborator.updateOne(
        { _id: result._id, appId: appId },
        { tmbIds: updateTmbIds }
      );
    } else {
      throw new Error('删除失败');
    }
    jsonRes(res, {
      message: '删除成功'
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
