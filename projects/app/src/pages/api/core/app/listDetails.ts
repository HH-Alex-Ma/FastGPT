
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { mongoRPermission } from '@fastgpt/global/support/permission/utils';
import { AppListDetailType } from '@fastgpt/global/core/app/type';
import { authUserRole } from '@fastgpt/service/support/permission/auth/user';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';

/* 根据 ID 获取App详细信息的列表 */ 



export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    // 凭证校验
    const { teamId, tmbId, teamOwner, role } = await authUserRole({ req, authToken: true });

    // 根据 userId 获取模型信息
    const detailedApps = await MongoApp.find(
      { ...mongoRPermission({ teamId, tmbId, role }) },
      '_id avatar name intro tmbId permission isShow appType userId teamId updateTime modules'
    ).sort({
      updateTime: -1
    });
    
    const getName = async (tmbId : string) => {
        if (!tmbId) {
            throw new Error('参数错误');
        }
    
        //根据 tmbId 获取 userId
        const tmbFinder = await MongoTeamMember.findById(tmbId);
    
        if (!tmbFinder) {
           return '团队成员不存在';
        }
    
        // 根据 userId 获取用户昵称
        const appCreator = await MongoUser.findById(tmbFinder.userId)
    
        if (!appCreator) {
            return '此用户不存在';
        }
        return appCreator.nickname;
    }
    const promises = detailedApps.map(async (app) => {
        const result = await (getName(app.tmbId));
        return { id: app._id, name: result };
      });
    const results = await Promise.all(promises);
    const idNamePairs = results.reduce((acc: { [id: string]: any }, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {});
    
    jsonRes<AppListDetailType[]>(res, {
      data: detailedApps.map((app) => (
        {
        _id: app._id,
        name: app.name,
        avatar: app.avatar,
        intro: app.intro,
        isOwner: teamOwner || String(app.tmbId) === tmbId,
        permission: app.permission,
        isShow: app.isShow,
        appType: app.appType,
        
        userId: idNamePairs[app._id],
        teamId: app.teamId,
        tmbId: app.tmbId,
        type: app.type,
        updateTime: app.updateTime,
        modules: app.modules
      }))
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}