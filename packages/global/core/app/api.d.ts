import type { LLMModelItemType } from '../ai/model.d';
import { AppTypeEnum } from './constants';
import { AppSchema } from './type';

export type CreateAppParams = {
  name?: string;
  intro?: string;
  isShow?: string;
  appType?: string;
  avatar?: string;
  type?: `${AppTypeEnum}`;
  modules: AppSchema['modules'];
};

export interface AppUpdateParams {
  name?: string;
  type?: `${AppTypeEnum}`;
  avatar?: string;
  intro?: string;
  modules?: AppSchema['modules'];
  permission?: AppSchema['permission'];
  teamTags?: AppSchema['teamTags'];
  permission?: AppSchema['permission'];
  isShow?: AppSchema['isShow'];
  appType?: AppSchema['appType'];
}
