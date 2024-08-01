import { AuthUserTypeEnum } from './constant';

export type AuthResponseType = {
  teamId: string;
  tmbId: string;
  isOwner: boolean;
  canWrite: boolean;
  authType?: `${AuthUserTypeEnum}`;
  appId?: string;
  apikey?: string;
};

export type PermissionValueType = number;
export type ResourceType = `${PerResourceTypeEnum}`;

export type PermissionListType<T = {}> = Record<
  T | PermissionKeyEnum,
  {
    name: string;
    description: string;
    value: PermissionValueType;
    checkBoxType: 'single' | 'multiple';
  }
>;

export type ResourcePermissionType = {
  teamId: string;
  tmbId: string;
  resourceType: ResourceType;
  permission: PermissionValueType;
  resourceId: string;
};

export type ResourcePerWithTmbWithUser = Omit<ResourcePermissionType, 'tmbId'> & {
  tmbId: TeamMemberWithUserSchema;
};

export type PermissionSchemaType = {
  defaultPermission: PermissionValueType;
  inheritPermission: boolean;
};
