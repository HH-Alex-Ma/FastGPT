export type AddUserType = {
  id?: string;
  username: string;
  nickname: string;
  roleId: string;
  manager: number;
};

export type AddRoleType = {
  id?: string;
  name: string;
  desc: string;
  apps: string[];
};

export type AddCollectType = {
  id?: string;
  tmbId: string;
  apps: string;
  type: Number;
};

export type RegisterUserType = {
  companyName: string;
  nickname: string;
  department: string;
  email: string;
  username: string;
  code: string;
  password: string;
  inviterId: string;
};

export type AuthCode = {
  username: string;
  msgToken: string;
};
