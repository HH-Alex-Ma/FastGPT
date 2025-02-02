import { PRICE_SCALE } from '@fastgpt/global/support/wallet/constants';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoRole } from '@fastgpt/service/support/user/role/schema';
import { connectMongo } from '@fastgpt/service/common/mongo/init';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { createDefaultTeam } from '@fastgpt/service/support/user/team/controller';
import { exit } from 'process';
import { initVectorStore } from '@fastgpt/service/common/vectorStore/controller';
import { getInitConfig } from '@/pages/api/common/system/getInitData';
import { startCron } from './common/system/cron';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { initGlobal } from './common/system';
import { startMongoWatch } from './common/system/volumnMongoWatch';
import { startTrainingQueue } from './core/dataset/training/utils';

/**
 * connect MongoDB and init data
 */
export function connectToDatabase(): Promise<void> {
  return connectMongo({
    beforeHook: () => {
      initGlobal();
    },
    afterHook: async () => {
      // init system config
      getInitConfig();
      //init vector database, init root user
      await Promise.all([initVectorStore(), initRootUser()]);

      startMongoWatch();
      // cron
      startCron();

      // start queue
      startTrainingQueue(true);
    }
  });
}

async function initRootUser(retry = 3): Promise<any> {
  try {
    const rootUser = await MongoUser.findOne({
      username: 'root'
    });
    const psw = process.env.DEFAULT_ROOT_PSW || '123456';

    let rootId = rootUser?._id || '';

    await mongoSessionRun(async (session) => {
      // init root user
      // 账户不存在首次初始化
      if (!rootUser) {
        await MongoRole.create([
          {
            name: '普通用户',
            desc: '系统初始化默认角色',
            default: 1
          }
        ]);
        const [{ _id }] = await MongoUser.create(
          [
            {
              username: 'root',
              nickname: '系统管理员',
              password: hashStr(psw),
              manager: 1
            }
          ],
          { session }
        );
        rootId = _id;
        // init root team
        await createDefaultTeam({ userId: rootId, balance: 9999 * PRICE_SCALE, session });
        console.log(`root user init:`, {
          username: 'root',
          password: psw
        });
      }
    });
  } catch (error) {
    if (retry > 0) {
      console.log('retry init root user');
      return initRootUser(retry - 1);
    } else {
      console.error('init root user error', error);
      exit(1);
    }
  }
}
