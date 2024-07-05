import { GET, POST, PUT, DELETE } from '@/web/common/api/request';

export const getExternalData = (text: string) => POST('/data/getData', { text });
