import React from 'react';
import { useRouter } from 'next/router';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { getADLoginQR } from '@/web/support/user/api';

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { Loading } = useLoading();

  const { isLoading: isGetting } = useQuery(['getADLoginQR'], () =>
    getADLoginQR()
      .then((res: any) => {
        // init store
        if ((res as any)?.code == 200) {
          router.push((res as any).data);
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

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Login;
