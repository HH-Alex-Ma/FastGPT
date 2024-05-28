import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectToDatabase } from '@/service/mongo';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { hashStr } from '@fastgpt/global/common/string/tools';
import type { AddUserType } from '@fastgpt/global/support/user/userType';
import {
  TeamMemberRoleEnum,
  TeamMemberStatusEnum
} from '@fastgpt/global/support/user/team/constant';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { authCert } from '@fastgpt/service/support/permission/auth/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { tmbId } = await authCert({ req, authToken: true });
    const tmb = await MongoTeamMember.findById(tmbId);
    if (!tmb) {
      throw new Error('can not find it');
    }
    const { username, nickname, roleId, manager, validity } = req.body as AddUserType;

    if (!username || !nickname) {
      throw new Error('缺少参数');
    }
    //
    const userInfo = await MongoUser.findOne({
      username: username
    });

    const psw = process.env.DEFAULT_ROOT_PSW || '123456';
    let userId = userInfo?._id || '';

    if (!userInfo) {
      const roleInfo = await MongoRole.findOne({ default: 1 });
      const [{ _id }] = await MongoUser.create([
        {
          username: username,
          nickname: nickname,
          roleId: roleId && roleId != '' ? roleId : roleInfo ? roleInfo?._id : '',
          manager: manager,
          password: hashStr(psw),
          validity: validity
        }
      ]);
      userId = _id;
      createTeamMember({ userId: userId });
    } else {
      throw new Error('账户已存在');
    }

    jsonRes(res, {
      message: '创建成功'
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

const createTeamMember = async ({ userId }: { userId: string }) => {
  // auth default team
  const userInfo = await MongoUser.findOne({
    username: 'root'
  });

  const teamInfo = await MongoTeam.findOne({ ownerId: userInfo?._id });

  if (teamInfo) {
    await MongoTeamMember.create({
      teamId: teamInfo._id,
      userId,
      name: 'Owner',
      role: TeamMemberRoleEnum.owner,
      status: TeamMemberStatusEnum.active,
      createTime: new Date(),
      defaultTeam: true
    });
    console.log('create default team', userId);
  }
};
