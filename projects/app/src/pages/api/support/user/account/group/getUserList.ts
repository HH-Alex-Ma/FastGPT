import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
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
    //记录
    const data = await MongoUser.find();
    dataMasking(data);
    jsonRes(res, {
      data: dataMasking(data)
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

const dataMasking = (data: any[]) => {
  data.forEach((item, index) => {
    item.username =
      item.username.length == 11
        ? item.username.slice(0, 3) + '****' + item.username.slice(-4)
        : item.username.slice(0, 1) + '***' + item.username.slice(-1);
    // item.nickname = item.nickname.slice(0, 1) + '*' + item.nickname.slice(-1);
  });
  return data;
};
