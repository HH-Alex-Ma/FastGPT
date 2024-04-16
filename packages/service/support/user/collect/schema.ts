import { connectionMongo, type Model } from '../../../common/mongo';
const { Schema, model, models } = connectionMongo;
import type { AppCollectSchema } from '@fastgpt/global/support/user/type';

export const conllectCollectionName = 'collect';

const CollectSchema = new Schema({
  tmbId: {
    type: String
  },
  apps: {
    type: [String],
    default: []
  },
  createTime: {
    type: Date,
    default: () => new Date()
  }
});

export const MongoCollect: Model<AppCollectSchema> =
  models[conllectCollectionName] || model(conllectCollectionName, CollectSchema);
MongoCollect.syncIndexes();
