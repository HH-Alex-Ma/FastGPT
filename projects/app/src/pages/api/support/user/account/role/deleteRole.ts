import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectToDatabase } from '@/service/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { id } = req.query as { id: string };

    if (!id) {
      throw new Error('缺少参数');
    }

    const info = await MongoRole.findOne({ _id: id });
    if (info) {
      if (info.default != 1) {
        await MongoRole.findOneAndRemove({ _id: id });
      } else {
        throw new Error('系统默认角色禁止删除');
      }
    } else {
      throw new Error('该角色不存在，请稍后再试');
    }

    jsonRes(res, { message: '删除成功' });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
