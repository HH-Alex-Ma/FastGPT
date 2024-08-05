import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { authUserRole } from '@fastgpt/service/support/permission/auth/user';
import { AppSortType } from '@fastgpt/global/support/permission/constant';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    // 凭证校验
    const { tmbId, teamOwner } = await authUserRole({ req, authToken: true });

    const apps = await MongoApp.find({ tmbId: tmbId }).sort({
      updateTime: -1
    });

    jsonRes<AppListItemType[]>(res, {
      data: apps
        .filter((item) => item.appType === AppSortType.COMPANY)
        .map((app) => ({
          _id: app._id,
          avatar: app.avatar,
          name: app.name,
          intro: app.intro,
          isOwner: teamOwner || String(app.tmbId) === tmbId,
          permission: app.permission,
          isShow: app.isShow,
          appShowType: app.appShowType,
          appType: app.appType
        }))
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
