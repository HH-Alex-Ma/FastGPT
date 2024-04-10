import {
  delFileByFileIdList,
  getGFSCollection
} from '@fastgpt/service/common/file/gridfs/controller';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { addLog } from '@fastgpt/service/common/system/log';
import {
  deleteDatasetDataVector,
  getVectorDataByTime
} from '@fastgpt/service/common/vectorStore/controller';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { MongoDatasetTraining } from '@fastgpt/service/core/dataset/training/schema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { hashStr } from '@fastgpt/global/common/string/tools';
import {
  TeamMemberRoleEnum,
  TeamMemberStatusEnum
} from '@fastgpt/global/support/user/team/constant';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';

import Util, * as $Util from '@alicloud/tea-util';
import dingtalkoauth2_1_0, * as $dingtalkoauth2_1_0 from '@alicloud/dingtalk/oauth2_1_0';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';

/* 
  check dataset.files data. If there is no match in dataset.collections, delete it
  可能异常情况
  1. 上传了文件，未成功创建集合
*/
export async function checkInvalidDatasetFiles(start: Date, end: Date) {
  let deleteFileAmount = 0;
  const collection = getGFSCollection('dataset');
  const where = {
    uploadDate: { $gte: start, $lte: end }
  };

  // 1. get all file _id
  const files = await collection
    .find(where, {
      projection: {
        metadata: 1,
        _id: 1
      }
    })
    .toArray();
  addLog.info(`Clear invalid dataset files, total files: ${files.length}`);

  let index = 0;
  for await (const file of files) {
    try {
      // 2. find fileId in dataset.collections
      const hasCollection = await MongoDatasetCollection.countDocuments({
        teamId: file.metadata.teamId,
        fileId: file._id
      });

      // 3. if not found, delete file
      if (hasCollection === 0) {
        await delFileByFileIdList({ bucketName: 'dataset', fileIdList: [String(file._id)] });
        console.log('delete file', file._id);
        deleteFileAmount++;
      }
      index++;
      index % 100 === 0 && console.log(index);
    } catch (error) {
      console.log(error);
    }
  }
  addLog.info(`Clear invalid dataset files finish, remove ${deleteFileAmount} files`);
}

/* 
  检测无效的 Mongo 数据
  异常情况：
  1. 训练过程删除知识库，可能导致还会有新的数据继续插入，导致无效。
*/
export async function checkInvalidDatasetData(start: Date, end: Date) {
  // 1. 获取时间范围的所有data
  const rows = await MongoDatasetData.find(
    {
      updateTime: {
        $gte: start,
        $lte: end
      }
    },
    '_id teamId datasetId collectionId'
  ).lean();

  // 2. 合并所有的collectionId
  const map = new Map<string, { teamId: string; datasetId: string; collectionId: string }>();
  for (const item of rows) {
    const collectionId = String(item.collectionId);
    if (!map.has(collectionId)) {
      map.set(collectionId, {
        teamId: item.teamId,
        datasetId: item.datasetId,
        collectionId
      });
    }
  }
  const list = Array.from(map.values());
  addLog.info(`Clear invalid dataset data, total collections: ${list.length}`);
  let index = 0;

  for await (const item of list) {
    try {
      // 3. 查看该collection是否存在，不存在，则删除对应的数据
      const collection = await MongoDatasetCollection.findOne({ _id: item.collectionId });
      if (!collection) {
        await mongoSessionRun(async (session) => {
          await MongoDatasetTraining.deleteMany(
            {
              teamId: item.teamId,
              collectionId: item.collectionId
            },
            { session }
          );
          await MongoDatasetData.deleteMany(
            {
              teamId: item.teamId,
              collectionId: item.collectionId
            },
            { session }
          );
          await deleteDatasetDataVector({
            teamId: item.teamId,
            datasetIds: [item.datasetId],
            collectionIds: [item.collectionId]
          });
        });

        console.log('collection is not found', item);
        continue;
      }
    } catch (error) {}
    console.log(++index);
  }
}

export async function checkInvalidVector(start: Date, end: Date) {
  let deletedVectorAmount = 0;
  // 1. get all vector data
  const rows = await getVectorDataByTime(start, end);
  addLog.info(`Clear invalid vector, total vector data: ${rows.length}`);

  let index = 0;

  for await (const item of rows) {
    if (!item.teamId || !item.datasetId || !item.id) {
      addLog.error('error data', item);
      continue;
    }
    try {
      // 2. find dataset.data
      const hasData = await MongoDatasetData.countDocuments({
        teamId: item.teamId,
        datasetId: item.datasetId,
        'indexes.dataId': item.id
      });

      // 3. if not found, delete vector
      if (hasData === 0) {
        await deleteDatasetDataVector({
          teamId: item.teamId,
          id: item.id
        });
        console.log('delete vector data', item.id);
        deletedVectorAmount++;
      }

      index++;
      index % 100 === 0 && console.log(index);
    } catch (error) {
      console.log(error);
    }
  }

  addLog.info(`Clear invalid vector finish, remove ${deletedVectorAmount} data`);
}

/* 
同步钉钉用户信息
*/
const DING_APP_KEY = process.env.DING_APP_KEY ? process.env.DING_APP_KEY : '';
const DING_APP_SECRET = process.env.DING_APP_SECRET ? process.env.DING_APP_SECRET : '';

const createClient = (): dingtalkoauth2_1_0 => {
  let config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';
  return new dingtalkoauth2_1_0(config);
};

const getAccessToken = () => {
  let client = createClient();
  let getAccessTokenRequest = new $dingtalkoauth2_1_0.GetAccessTokenRequest({
    appKey: DING_APP_KEY,
    appSecret: DING_APP_SECRET
  });
  try {
    return client.getAccessToken(getAccessTokenRequest);
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// 查询部门下的用户
const getUserList = async (accessToken: string, departId: number, cursor: any) => {
  let userInfoList: any[] = [];
  let fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    method: 'POST',
    body: JSON.stringify({ dept_id: departId, cursor: cursor, size: 100 })
  };

  const result = await fetch(
    `https://oapi.dingtalk.com/topapi/user/listsimple?access_token=${accessToken}`,
    fetchOptions
  );
  const data = await result.json();
  if (data.result?.next_cursor && data.result?.has_more == true) {
    const arr = await getUserList(accessToken, departId, data.result?.next_cursor);
    userInfoList = userInfoList.concat(arr);
  }
  return data.result?.list != undefined ? userInfoList.concat(data.result?.list) : userInfoList;
};

// 查询部门
const getDepartInfoList = async (accessToken: string, deptId: number) => {
  let uAllList: any[] = [];
  let fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    method: 'POST',
    body: JSON.stringify({ dept_id: deptId })
  };

  const result = await fetch(
    `https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=${accessToken}`,
    fetchOptions
  );
  const data = await result.json();
  if (data.result?.dept_id_list && data.result.dept_id_list.length > 0) {
    const deptList = data.result.dept_id_list;
    for (let i in deptList) {
      const uInfo = await getDepartInfoList(accessToken, deptList[i]);
      if (uInfo && uInfo.length > 0) {
        uAllList = uAllList.concat(uInfo);
      }
    }
  }
  const arr = await getUserList(accessToken, deptId, 0);
  return uAllList.concat(arr);
};

//insert member team
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

// insert user info
const insertUserInfo = async (uid: string, nickname: string, unionId: string) => {
  await connectToDatabase();
  const userInfo = await MongoUser.findOne({
    DindDing: unionId
  });

  const psw = process.env.DEFAULT_ROOT_PSW || '123456';
  let userId = userInfo?._id || '';

  if (!userInfo) {
    const [{ _id }] = await MongoUser.create([
      {
        username: uid,
        nickname: nickname,
        roleId: '',
        DindDing: unionId,
        password: hashStr(psw)
      }
    ]);
    console.log('create user info', uid, nickname);
    userId = _id;
    createTeamMember({ userId: userId });
  } else {
    await MongoUser.updateOne(
      {
        _id: userInfo._id
      },
      {
        nickname: nickname
      }
    );
    console.log('update user info', uid, nickname);
  }
};

const getUserInfoByUserId = async (accessToken: string, nickname: string, userid: string) => {
  let fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    method: 'POST',
    body: JSON.stringify({ userid: userid })
  };

  const result = await fetch(
    `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}`,
    fetchOptions
  );
  const data = await result.json();
  let unionId = data.result.unionid;
  await insertUserInfo(userid, nickname, unionId);
};

export async function syncDingDingUserInfo() {
  if (DING_APP_KEY != '' && DING_APP_SECRET != '') {
    const accessToken = await getAccessToken();
    const publicAccessToken = accessToken.body.accessToken;
    const data = await getDepartInfoList(publicAccessToken, 1);
    console.log(data);
    for (let i in data) {
      await getUserInfoByUserId(publicAccessToken, data[i].name, data[i].userid);
    }
  }
}
