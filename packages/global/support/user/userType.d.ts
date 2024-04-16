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
