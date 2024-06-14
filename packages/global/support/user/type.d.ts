import { UserStatusEnum } from './constant';
import { TeamItemType } from './team/type';

export type UserModelSchema = {
  _id: string;
  username: string;
  nickname: string;
  roleId: string;
  manager: number;
  DindDing?: string;
  companyName?: string;
  department?: string;
  validity?: string;
  email?: string;
  phonePrefix?: number;
  phone?: string;
  password: string;
  avatar: string;
  promotionRate: number;
  inviterId?: string;
  openaiKey: string;
  createTime: number;
  timezone: string;
  status: `${UserStatusEnum}`;
  lastLoginTmbId?: string;
  openaiAccount?: {
    key: string;
    baseUrl: string;
  };
};

export type UserType = {
  _id: string;
  username: string;
  nickname: string;
  avatar: string;
  manager: number;
  DindDing?: string;
  companyName?: string;
  department?: string;
  validity?: string;
  nickname: string;
  timezone: string;
  promotionRate: UserModelSchema['promotionRate'];
  openaiAccount: UserModelSchema['openaiAccount'];
  team: TeamItemType;
  standardInfo?: standardInfoType;
};

export type RoleModelSchema = {
  _id: string;
  name: string;
  desc: string;
  apps: Array;
  default: number;
  createTime: number;
};

export type AppCollectSchema = {
  _id: string;
  tmbId: string;
  apps: string[];
  createTime: number;
};

export type TypeCollectSchema = {
  _id: string;
  name: string;
  desc: string;
  createTime: number;
};
