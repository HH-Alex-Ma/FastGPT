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

    const { appId, tmbIds, permission } = req.body as AddCollaboratorType;

    if (!appId || !tmbIds) {
      throw new Error('缺少参数');
    }
    //记录
    const result = await MongoCollaborator.findOne({ appId: appId });
    console.log(result, appId, tmbIds);
    if (result) {
      const mergedArray = mergeUnique(tmbIds, result.tmbIds);
      await MongoCollaborator.updateOne({ _id: result._id, appId: appId }, { tmbIds: mergedArray });
    } else {
      await MongoCollaborator.create({
        appId: appId,
        tmbIds: tmbIds
      });
    }
    jsonRes(res, {
      message: '添加成功'
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

function mergeUnique<T>(arr1: T[], arr2: T[]): T[] {
  return [...arr1, ...arr2].filter((item, index, self) => self.indexOf(item) === index);
}
