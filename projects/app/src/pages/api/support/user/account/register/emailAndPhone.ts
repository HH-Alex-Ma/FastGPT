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
import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

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
        if (process.env.EMAIL_ENABLE?.toLocaleLowerCase() == 'true') {
          sendEmail(companyName, nickname, department, email, username);
        }
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
  now.setDate(now.getDate() + Number(process.env.QUALIFYING_PERIOD)); // 增加天数
  return now;
};

const sendEmail = (
  companyName: string,
  nickname: string,
  department: string,
  email: string,
  username: string
) => {
  // 创建邮件发送器
  const smtpConfig: SMTPTransport.Options = {
    host: process.env.EMAIL_SERVER,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PWD
    }
  };
  const transporter = createTransport(smtpConfig);

  // 邮件信息
  const mailOptions = {
    from: process.env.EMAIL_AUTH_USER, // 发件人
    to: process.env.EMAIL_TO_USER?.split(','), // 收件人
    cc: process.env.EMAIL_TO_CC?.split(','),
    subject: `来自： ${companyName}${nickname}的Run GenAI试用注册`, // 邮件标题
    html: `<style>
    Table { font-family: Arial, Helvetica, sans-serif; background-color: #EEEEEE;
    border-collapse: collapse; width: 100%; } Table td, Table th { border:
    1px solid #ddd; padding: 3px 3px; } Table th { font-size: 15px; font-weight:
    bold; padding-top: 12px; padding-bottom: 12px; text-align: left; background-color:
    #1C6EA4; color: white; }
  </style>
  <div style="width:100%;background-color: f4f4f4;padding:40px 0 40px 0;">
    <div style="width:100%;max-width:750px;margin:auto;border:1px solid #dddddd;background-color: #ffffff;-webkit-box-shadow:4px 2px 6px #c9c9c9; -moz-box-shadow:4px 2px 6px #c9c9c9;box-shadow:4px 2px 6px #c9c9c9;">
      <div id="header-template" style="width:100%;height:4px;background-color: #1e9dee;"></div>
      <div id="content-template" style="margin:25px 22px;line-height: 20px;">
        <div style="font-size: 14px;color: #000000;margin:0 0 15px 0;">
          您好
        </div>
        <div style="font-size: 14px;color:#000000;">
          <p>
            以下是新注册的用户信息：
          </p>
        </div>
        <div style="font-size: 14px;color:#000000;">
          <table>
            <thead>
              <tr>
                <th>
                  #
                </th>
                <th>
                  公司
                </th>
                <th>
                  部门
                </th>
                <th>
                  姓名
                </th>
                <th>
                  邮箱
                </th>
                <th>
                  电话
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  1
                </td>
                <td>
                ${companyName}
                </td>
                <td>
                ${department}
                </td>
                <td>
                ${nickname}
                </td>
                <td>
                ${email}
                </td>
                <td>
                ${username}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding: 20px 0 0 0;color: #000000;font-size: 13px;">
          <div>
            <p>
              本邮件属系统邮件，请勿回复。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>`
  };

  // 发送邮件
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
};
