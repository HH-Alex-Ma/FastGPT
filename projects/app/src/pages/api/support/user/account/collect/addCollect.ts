import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoCollect } from '@fastgpt/service/support/user/collect/schema';
import { connectToDatabase } from '@/service/mongo';
import type { AddCollectType } from '@fastgpt/global/support/user/userType';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { tmbId, apps, type } = req.body as AddCollectType;

    if (!tmbId || !apps) {
      throw new Error('缺少参数');
    }
    if (!(type == 1 || type == 0)) {
      throw new Error('参数错误');
    }
    const result = await MongoCollect.findOne({ tmbId: tmbId });
    if (!result) {
      let arr: string[] = [];
      //新增
      await MongoCollect.create([
        {
          tmbId: tmbId,
          apps: arr.push(apps)
        }
      ]);
    } else {
      //更新
      //type  1 新增，0 删除
      let appArr: string[] = result.apps;
      if (type == 1) {
        appArr.push(apps);
      } else {
        appArr = appArr.filter((item: String) => item != apps);
      }
      await MongoCollect.updateOne(
        { _id: result._id },
        {
          apps: appArr
        }
      );
    }

    jsonRes(res, {
      code: 200
    });
  } catch (err) {
    jsonRes(res, {
      code: 400,
      error: err
    });
  }
}
