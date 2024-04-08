import { UserStatusEnum } from './constant';
import { TeamItemType } from './team/type';

export type UserModelSchema = {
  _id: string;
  username: string;
  nickname: string;
  roleId: string;
  manager: number;
  DindDing?: string;
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
  createTime: number;
};
