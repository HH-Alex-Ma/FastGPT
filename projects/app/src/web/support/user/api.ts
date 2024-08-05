import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import { hashStr } from '@fastgpt/global/common/string/tools';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { UserAuthTypeEnum } from '@fastgpt/global/support/user/auth/constants';
import { UserUpdateParams } from '@/types/user';
import { UserType } from '@fastgpt/global/support/user/type.d';
import type {
  FastLoginProps,
  OauthLoginProps,
  PostLoginProps
} from '@fastgpt/global/support/user/api.d';
import { GetWXLoginQRResponse } from '@fastgpt/global/support/user/login/api.d';

export const sendAuthCode = (data: {
  username: string;
  type: `${UserAuthTypeEnum}`;
  googleToken: string;
}) => POST(`/proApi/support/user/inform/sendAuthCode`, data);

export const getTokenLogin = () =>
  GET<UserType>('/support/user/account/tokenLogin', {}, { maxQuantity: 1 });
export const oauthLogin = (params: OauthLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/oauth', params);
export const postFastLogin = (params: FastLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/fastLogin', params);

export const postRegister = ({
  companyName,
  nickname,
  department,
  email,
  username,
  password,
  code,
  inviterId
}: {
  companyName: string;
  nickname: string;
  department: string;
  email: string;
  username: string;
  code: string;
  password: string;
  inviterId?: string;
}) =>
  POST<ResLogin>(`/support/user/account/register/emailAndPhone`, {
    companyName,
    nickname,
    department,
    email,
    username,
    code,
    inviterId,
    password: hashStr(password)
  });

export const postFindPassword = ({
  username,
  code,
  password
}: {
  username: string;
  code: string;
  password: string;
}) =>
  POST<ResLogin>(`/proApi/support/user/account/password/updateByCode`, {
    username,
    code,
    password: hashStr(password)
  });

export const updatePasswordByOld = ({ oldPsw, newPsw }: { oldPsw: string; newPsw: string }) =>
  POST('/support/user/account/updatePasswordByOld', {
    oldPsw: hashStr(oldPsw),
    newPsw: hashStr(newPsw)
  });

export const postLogin = ({ password, ...props }: PostLoginProps) =>
  POST<ResLogin>('/support/user/account/loginByPassword', {
    ...props,
    password: hashStr(password)
  });

export const loginOut = () => GET('/support/user/account/loginout');

export const putUserInfo = (data: UserUpdateParams) => PUT('/support/user/account/update', data);

export const getWXLoginQR = () =>
  GET<GetWXLoginQRResponse>('/proApi/support/user/account/login/wx/getQR');

export const getWXLoginResult = (code: string) =>
  GET<ResLogin>(`/proApi/support/user/account/login/wx/getResult`, { code });

export const getDingLoginQR = () => GET('/support/user/account/login/ding/getQR');

export const getADLoginQR = () => GET('/support/user/account/login/ad/getQR');

export const getDingLoginResult = (authCode: string) =>
  GET(`/support/user/account/login/ding/getResult`, { authCode });

export const getADLoginResult = (authCode: string) =>
  GET(`/support/user/account/login/ad/getResult`, { authCode });

export const getUserInfo = () => GET('/support/user/account/group/getUserList');

export const addUserInfo = ({
  username,
  nickname,
  roleId,
  manager,
  validity
}: {
  username: string;
  nickname: string;
  roleId: string;
  manager: number;
  validity: string;
}) =>
  POST('/support/user/account/group/addUser', { username, nickname, roleId, manager, validity });

export const updateUserInfo = ({
  id,
  username,
  nickname,
  roleId,
  manager,
  validity
}: {
  id: string;
  username: string;
  nickname: string;
  roleId: string;
  manager: number;
  validity: string;
}) =>
  PUT('/support/user/account/group/updateUser', {
    id,
    username,
    nickname,
    roleId,
    manager,
    validity
  });

export const delUserByID = (id: string) => DELETE(`/support/user/account/group/deleteUser`, { id });
export const changeUserStatusById = (id: string, status: string) =>
  PUT(`/support/user/account/group/changeStatus`, { id, status });

export const getRoles = () => GET('/support/user/account/role/getRoles');
export const addRole = ({ name, desc, apps }: { name: string; desc: string; apps: string[] }) =>
  POST('/support/user/account/role/addRoles', { name, desc, apps });
export const updateRole = ({
  id,
  name,
  desc,
  apps
}: {
  id: string;
  name: string;
  desc: string;
  apps: string[];
}) => PUT('/support/user/account/role/updateRole', { id, name, desc, apps });
export const delRoleById = (id: string) => DELETE(`/support/user/account/role/deleteRole`, { id });

export const getTypes = () => GET('/support/type/get');
export const addType = ({ name, desc }: { name: string; desc: string }) =>
  POST('/support/type/add', { name, desc });
export const updateType = ({ id, name, desc }: { id: string; name: string; desc: string }) =>
  PUT('/support/type/update', { id, name, desc });
export const delTypeById = (id: string) => DELETE(`/support/type/delete`, { id });

// export const getOwnerApps = (id: any, tmbId: any) =>
//   GET(`/support/user/account/ownerApps/getApps`, { id, tmbId });

export const setAppCollect = (tmbId: any, apps: string, type: number) =>
  POST(`/support/user/account/collect/addCollect`, { tmbId, apps, type });
export const getCollectById = (tmbId: any) =>
  GET(`/support/user/account/collect/getCollect`, { tmbId });

export const getCode = () => GET(`/support/user/account/code/getCode`);

export const getMessageCode = (phone: string) =>
  POST(`/support/user/account/code/getAliCode`, { phone });

export const sendAliToken = (username: string, msgToken: any) =>
  POST(`/support/user/account/code/sendAuthCode`, { username, msgToken });
