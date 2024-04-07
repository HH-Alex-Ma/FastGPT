import request from '@/web/common/api/request';
import { GET, PUT, DELETE, POST } from '@/web/common/api/request';

export const getUserDashboard = () => GET<any>('/one/api/user/dashboard');

export const getSelf = () => GET<any>('/one/api/user/self');

/**
 * get log list
 */
export const getLogsList = () => GET<any>('/one/api/log/all');

/**
 * get token list
 */
export const getTokenList = () => GET<any>('/one/api/token');
