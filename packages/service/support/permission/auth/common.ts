import { parseHeaderCert } from '../controller';
import { AuthModeType } from '../type';
import { SERVICE_LOCAL_HOST } from '../../../common/system/tools';

export const authCert = async (props: AuthModeType) => {
  const result = await parseHeaderCert(props);

  return {
    ...result,
    isOwner: true,
    canWrite: true
  };
};

/* auth the request from local service */
export const authRequestFromLocal = ({ req }: AuthModeType) => {
  console.log(`Service Local Host: ${SERVICE_LOCAL_HOST}`);
  // SERVICE_LOCAL_HOST 包含大写字母，转小写以后再比较
  if (req.headers.host !== SERVICE_LOCAL_HOST.toLocaleLowerCase()) {
    return Promise.reject('Invalid request');
  }
};
