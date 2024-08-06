import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { authUserRole } from '@fastgpt/service/support/permission/auth/user';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { MongoCollaborator } from '@fastgpt/service/support/user/collaborator/schema';
import type { CollaboratorModelSchema } from '@fastgpt/global/support/user/type';
import { AppSortType } from '@fastgpt/global/support/permission/constant';
import { mongoRPermission } from '@fastgpt/global/support/permission/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    // 凭证校验
    const { teamId, tmbId, teamOwner, role } = await authUserRole({ req, authToken: true });

    let myApps: string[] = [];
    let apps: any;
    let myCollaborators: string[] = [];
    const mebResult = await MongoTeamMember.findOne({ _id: tmbId });

    const userInfo = await MongoUser.findOne({ _id: mebResult?.userId });
    if (userInfo && userInfo.username !== 'root') {
      if (userInfo.roleId && userInfo.roleId != '') {
        const roleInfo = await MongoRole.findOne({ _id: userInfo.roleId });
        roleInfo?.apps.map((app: any) => myApps.push(app.value));
      }

      const collaborators = await MongoCollaborator.find();
      myCollaborators = getCollaboratorList(collaborators, tmbId);
      apps = await MongoApp.find({
        $or: [{ tmbId: tmbId }, { _id: { $in: mergeUnique(myApps, myCollaborators) } }]
      });
    } else {
      apps = await MongoApp.find(
        { ...mongoRPermission({ teamId, tmbId, role }) },
        '_id avatar name intro tmbId permission isShow appShowType appType userId teamId updateTime modules'
      ).sort({
        updateTime: -1
      });
    }

    jsonRes<AppListItemType[]>(res, {
      data: apps.map((app: any) => ({
        _id: app._id,
        avatar: app.avatar,
        name: app.name,
        intro: app.intro,
        isOwner: teamOwner || String(app.tmbId) === tmbId,
        permission: app.permission,
        isShow: app.isShow,
        appShowType: app.appShowType,
        appType: myCollaborators.includes(String(app._id)) ? AppSortType.SHARE : app.appType
      }))
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

function getCollaboratorList(collaborators: CollaboratorModelSchema[], tmbId: string) {
  let myCollaborators: string[] = [];
  for (let element of collaborators) {
    if (element.tmbIds.includes(tmbId)) {
      myCollaborators.push(element.appId);
    }
  }
  return myCollaborators;
}

function mergeUnique<T>(arr1: T[], arr2: T[]): T[] {
  return [...arr1, ...arr2].filter((item, index, self) => self.indexOf(item) === index);
}
