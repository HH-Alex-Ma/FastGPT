import { connectionMongo, type Model } from '../../../common/mongo';
const { Schema, model, models } = connectionMongo;
import type { CollaboratorModelSchema } from '@fastgpt/global/support/user/type';

export const collaboratorCollectionName = 'collaborators';

const CollaboratorSchema = new Schema({
  appId: {
    type: String
  },
  tmbIds: {
    type: Array,
    default: []
  },
  createTime: {
    type: Date,
    default: () => new Date()
  }
});

export const MongoCollaborator: Model<CollaboratorModelSchema> =
  models[collaboratorCollectionName] || model(collaboratorCollectionName, CollaboratorSchema);
MongoCollaborator.syncIndexes();
