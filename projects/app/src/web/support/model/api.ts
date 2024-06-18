import { GET, PUT, DELETE, POST } from '@/web/common/api/request';
/**
 * create or update channel info
 */
export const createOrUpdateChannel = (flag: boolean, data: any) => {
  if (flag) {
    return PUT('/one/api/channel', data);
  } else {
    return POST('/one/api/channel', data);
  }
};

/**
 * get group
 */
export const getGroups = () => GET<any>('/one/api/group');

/**
 * get models
 */
export const getModels = () => GET<any>('/one/api/channel/models');

/**
 * get channels
 */
export const getChannels = (data: any) => {
  if (data.keyword) {
    return GET(`/one/api/channel/search?keyword=${data.keyword}`);
  } else {
    return GET<any[]>(`/one/api/channel?p=${data.pageNum}`);
  }
};

/**
 * update a channel status
 */
export const putChannelStatus = (data: any) => PUT<string>('/one/api/channel', data);

/**
 * update a channel Priority
 */
export const putChannelPriority = (data: any) => PUT<string>('/one/api/channel', data);

/**
 * test response time
 * /api/channel/test/${id}/
 */
export const getTestChannel = (data: any) => GET(`/one/api/channel/test/${data}`);
/**
 * update balance
 * /api/channel/update_balance/${id}/
 */
export const getUpdateBalance = (data: any) => GET(`/one/api/channel/update_balance/${data}`);

/**
 * delete channel by id
 */
export const delChannelById = (id: string) => DELETE(`/one/api/channel/${id}`);

/**
 * get log list
 */
export const getLogsList = (data: any) => GET('/one/api/log' + data);

/**
 * get tokens
 */
export const getTokenList = (data: any) => {
  if (data.keyword) {
    return GET(`/one/api/token/search?keyword=${data.keyword}`);
  } else {
    return GET(`/one/api/token?p=${data.pageNum}`);
  }
};

/**
 * create or update token info
 */
export const createOrUpdateToken = (flag: boolean, data: any) => {
  if (flag) {
    return PUT('/one/api/token', data);
  } else {
    return POST('/one/api/token', data);
  }
};
/**
 * delete tokens
 */
export const delTokenById = (id: string) => DELETE(`/one/api/token/${id}`);

/**
 * update tokens status
 */
export const updateTokenStatus = (data: any) =>
  PUT<string>('/one/api/token?status_only=true', data);
