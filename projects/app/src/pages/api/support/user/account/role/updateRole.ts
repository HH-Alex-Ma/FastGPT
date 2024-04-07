import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddRoleType } from '@fastgpt/global/support/user/userType.d.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { id, name, desc, apps } = req.body as AddRoleType;

    if (!id || !name) {
      throw new Error('缺少参数');
    }
    //记录
    const info = await MongoRole.findOne({
      _id: id
    });

    if (info) {
      await MongoRole.updateOne(
        {
          _id: info._id
        },
        {
          name: name,
          desc: desc,
          apps: apps
        }
      );
    } else {
      throw new Error('角色不存在');
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
