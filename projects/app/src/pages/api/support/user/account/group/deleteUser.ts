import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { id } = req.query as { id: string };

    if (!id) {
      throw new Error('缺少参数');
    }

    const userInfo = await MongoUser.findOne({ _id: id });
    if (userInfo?.username && userInfo?.username != 'root') {
      await MongoUser.findOneAndRemove({ _id: id });
      await MongoTeamMember.findOneAndRemove({ userId: id });
    } else {
      throw new Error('Root 账户禁止删除');
    }

    jsonRes(res, { message: '删除成功' });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
