import { connectionMongo, type Model } from '../../common/mongo';
const { Schema, model, models } = connectionMongo;
import type { TypeCollectSchema } from '@fastgpt/global/support/user/type';

export const typeCollectionName = 'types';

const TypeSchema = new Schema({
  name: {
    type: String
  },
  desc: {
    type: String
  },
  createTime: {
    type: Date,
    default: () => new Date()
  }
});

export const MongoTypes: Model<TypeCollectSchema> =
  models[typeCollectionName] || model(typeCollectionName, TypeSchema);
MongoTypes.syncIndexes();
