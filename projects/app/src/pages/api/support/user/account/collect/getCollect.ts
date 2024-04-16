import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoCollect } from '@fastgpt/service/support/user/collect/schema';
import { connectToDatabase } from '@/service/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { tmbId } = req.query as { tmbId: string };
    if (!tmbId) {
      throw new Error('缺少参数');
    }
    //记录
    const result = await MongoCollect.findOne({ tmbId: tmbId });
    jsonRes(res, {
      data: result?.apps
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
