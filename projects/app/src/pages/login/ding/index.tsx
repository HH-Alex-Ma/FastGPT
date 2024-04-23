import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { getDingLoginQR } from '@/web/support/user/api';
import { useRouter } from 'next/router';
import { useToast } from '@fastgpt/web/hooks/useToast';

const Ding = (props: any) => {
  const { Loading } = useLoading();
  const { toast } = useToast();
  const router = useRouter();

  const { isLoading: isGetting } = useQuery(['getDingLoginQR'], () =>
    getDingLoginQR()
      .then((res: any) => {
        // init store
        if ((res as any)?.code == 200) {
          router.push((res as any).url);
        }
      })
      .catch((res: any) => {
        if (res.code == 400) {
          toast({
            title: res.message || '登录异常',
            status: 'error'
          });
          router.push('/login');
        }
      })
  );
  return (
    <>
      <Loading loading={isGetting} fixed={false} />
    </>
  );
};

export default Ding;
