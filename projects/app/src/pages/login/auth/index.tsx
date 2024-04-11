import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { getDingLoginResult } from '@/web/support/user/api';
import { useRouter } from 'next/router';
import { setToken } from '@/web/support/user/auth';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/storeChat';

const Auth = (props: any) => {
  const { Loading } = useLoading();
  const router = useRouter();
  const authCode = router.query.code as string;
  const { setUserInfo } = useUserStore();
  const { setLastChatId, setLastChatAppId } = useChatStore();

  const { isLoading: isGetting } = useQuery(['getDingLoginResult', authCode], () =>
    getDingLoginResult(authCode)
      .then((res: any) => {
        // init store
        setLastChatId('');
        setLastChatAppId('');

        setUserInfo(res.user);
        setToken(res.token);
        setTimeout(() => {
          router.push('/home');
        }, 300);
      })
      .catch((res: any) => {
        if (res.code == 400) router.push('/login');
      })
  );
  return (
    <>
      <Loading loading={isGetting} fixed={false} />
    </>
  );
};

export default Auth;
