import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoTypes } from '@fastgpt/service/support/type/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddTypesType } from '@fastgpt/global/support/user/userType';
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
    const { id, name, desc } = req.body as AddTypesType;

    if (!id || !name) {
      throw new Error('缺少参数');
    }
    //记录
    const info = await MongoTypes.findOne({
      _id: id
    });

    if (info) {
      await MongoTypes.updateOne(
        {
          _id: info._id
        },
        {
          name: name,
          desc: desc
        }
      );
    } else {
      throw new Error('参数不存在');
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
