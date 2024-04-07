import { connectionMongo, type Model } from '../../../common/mongo';
const { Schema, model, models } = connectionMongo;
import type { RoleModelSchema } from '@fastgpt/global/support/user/type';

export const roleCollectionName = 'roles';

const RoleSchema = new Schema({
  name: {
    type: String
  },
  desc: {
    type: String
  },
  apps: {
    type: Array,
    default: []
  },
  createTime: {
    type: Date,
    default: () => new Date()
  }
});

export const MongoRole: Model<RoleModelSchema> =
  models[roleCollectionName] || model(roleCollectionName, RoleSchema);
MongoRole.syncIndexes();
