import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { getADLoginResult } from '@/web/support/user/api';
import { useRouter } from 'next/router';
import { setToken } from '@/web/support/user/auth';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/storeChat';

const Oauth = (props: any) => {
  const { Loading } = useLoading();
  const { toast } = useToast();
  const router = useRouter();
  const authCode = router.query.code as string;
  const { setUserInfo } = useUserStore();
  const { setLastChatId, setLastChatAppId } = useChatStore();

  const { isLoading: isGetting } = useQuery(['getADLoginResult', authCode], () => {
    getADLoginResult(authCode)
      .then((res: any) => {
        if (res.user && res.token) {
          // init store
          setLastChatId('');
          setLastChatAppId('');

          setUserInfo(res.user);
          setToken(res.token);
          setTimeout(() => {
            toast({
              title: '登录成功',
              status: 'success'
            });
            router.push('/home');
          }, 300);
        } else {
          setUserInfo(null);
          setToken('');
          toast({
            title: res.message || '登录异常',
            status: 'error'
          });
          router.push('/login');
        }
      })
      .catch((res: any) => {
        if (res.code == 400) {
          setUserInfo(null);
          setToken('');
          toast({
            title: res.message || '登录异常',
            status: 'error'
          });
          router.push('/login');
        }
      });
  });
  return (
    <>
      <Loading loading={isGetting} fixed={false} />
    </>
  );
};

export default Oauth;
