import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import type { RegisterUserType } from '@fastgpt/global/support/user/userType';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import {
  TeamMemberRoleEnum,
  TeamMemberStatusEnum
} from '@fastgpt/global/support/user/team/constant';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { hashStr } from '@fastgpt/global/common/string/tools';

const AD_CLIENT_URL = process.env.AD_CLIENT_URL ? process.env.AD_CLIENT_URL : '';
const API_TOKEN = process.env.API_TOKEN ? process.env.API_TOKEN : '';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { companyName, nickname, department, email, username, password, code, inviterId } =
      req.body as RegisterUserType;

    console.log(companyName, nickname, department, email, username, password, code, inviterId);

    const result = await checkCode(username, code);
    if (result.code != 200) {
      jsonRes(res, {
        code: 500,
        error: result.message || '注册失败，验证码验证错误'
      });
    } else {
      const userInfo = await MongoUser.findOne({
        username: username
      });

      const psw = process.env.DEFAULT_ROOT_PSW || '123456';
      let userId = userInfo?._id || '';

      if (!userInfo) {
        const roleInfo = await MongoRole.findOne({ default: 1 });
        const [{ _id }] = await MongoUser.create([
          {
            companyName: companyName,
            department: department,
            username: username,
            nickname: nickname,
            email: email,
            roleId: roleInfo ? roleInfo?._id : '',
            password: password,
            validity: getValidityDate()
          }
        ]);
        userId = _id;
        await createTeamMember({ userId: userId });

        const userDetail = await getUserDetail({
          tmbId: '',
          userId: userId
        });

        MongoUser.findByIdAndUpdate(userId, {
          lastLoginTmbId: userDetail.team.tmbId
        });

        const token = createJWT(userDetail);
        setCookie(res, token);

        jsonRes(res, {
          data: {
            user: userDetail,
            token
          }
        });
      } else {
        throw new Error('账户已存在');
      }
    }
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

const checkCode = async (id: string, code: string) => {
  let fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Token-Key': hashStr(API_TOKEN)
    },
    method: 'POST'
  };
  const result = await fetch(`${AD_CLIENT_URL}/api/msg/${id}/check/${code}`, fetchOptions);
  return await result.json();
};

const getValidityDate = () => {
  let now = new Date();
  now.setDate(now.getDate() + 5); // 增加5天
  return now;
};
