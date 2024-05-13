import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddUserType } from '@fastgpt/global/support/user/userType';
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
    const { id, username, nickname, roleId, manager } = req.body as AddUserType;

    if (!id || !username || !nickname) {
      throw new Error('缺少参数');
    }
    //记录
    const userInfo = await MongoUser.findOne({
      _id: id
    });

    if (userInfo) {
      await MongoUser.updateOne(
        {
          _id: id
        },
        {
          nickname: nickname,
          roleId: roleId,
          manager: manager
        }
      );
    } else {
      throw new Error('账户不存在');
    }

    jsonRes(res, {
      message: '更新成功'
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
