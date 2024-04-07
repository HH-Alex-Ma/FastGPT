import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import { UserStatusEnum } from '@fastgpt/global/support/user/constant';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { id, status } = req.body as { id: string; status: string };

    if (!id || !status) {
      throw new Error('缺少参数');
    }
    //记录
    const userInfo = await MongoUser.findOne({
      _id: id
    });
    if (userInfo?.username == 'root') {
      throw new Error('root 账户禁止注销');
    }
    if (userInfo) {
      await MongoUser.updateOne(
        {
          _id: id
        },
        {
          status: status == UserStatusEnum.active ? UserStatusEnum.forbidden : UserStatusEnum.active
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
