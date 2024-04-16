import React, { useState, useCallback, useEffect } from 'react';
import { Box, Center, Flex, useDisclosure, Icon, Link, ModalBody } from '@chakra-ui/react';
import { LoginPageTypeEnum } from '@/constants/user';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/storeChat';
import LoginForm from './components/LoginForm/LoginForm';
import dynamic from 'next/dynamic';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { clearToken, setToken } from '@/web/support/user/auth';
import CommunityModal from '@/components/CommunityModal';
import Script from 'next/script';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { getDingLoginQR } from '@/web/support/user/api';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyIcon from '@fastgpt/web/components/common/Icon';
import type { IconNameType } from '@fastgpt/web/components/common/Icon/type.d';
import { getDocPath } from '@/web/common/system/doc';
import { useTranslation } from 'next-i18next';
import MyModal from '@fastgpt/web/components/common/MyModal';
import Markdown from '@/components/Markdown';
import { useMarkdown } from '@/web/common/hooks/useMarkdown';

const RegisterForm = dynamic(() => import('./components/RegisterForm'));
const ForgetPasswordForm = dynamic(() => import('./components/ForgetPasswordForm'));
const WechatForm = dynamic(() => import('./components/LoginForm/WechatForm'));

const Login = () => {
  const { data: disclaimerIntro } = useMarkdown({ url: '/disclaimer.md' });
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { lastRoute = '' } = router.query as { lastRoute: string };
  const { feConfigs } = useSystemStore();
  const [pageType, setPageType] = useState<`${LoginPageTypeEnum}`>();
  const { setUserInfo } = useUserStore();
  const { setLastChatId, setLastChatAppId } = useChatStore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const loginSuccess = useCallback(
    (res: ResLogin) => {
      // init store
      setLastChatId('');
      setLastChatAppId('');

      setUserInfo(res.user);
      setToken(res.token);
      setTimeout(() => {
        router.push('/home');
      }, 300);
    },
    [lastRoute, router, setLastChatId, setLastChatAppId, setUserInfo]
  );

  function DynamicComponent({ type }: { type: `${LoginPageTypeEnum}` }) {
    const TypeMap = {
      [LoginPageTypeEnum.passwordLogin]: LoginForm,
      [LoginPageTypeEnum.register]: RegisterForm,
      [LoginPageTypeEnum.forgetPassword]: ForgetPasswordForm,
      [LoginPageTypeEnum.wechat]: WechatForm
    };

    const Component = TypeMap[type];

    return <Component setPageType={setPageType} loginSuccess={loginSuccess} />;
  }

  /* default login type */
  useEffect(() => {
    setPageType(
      feConfigs?.oauth?.wechat ? LoginPageTypeEnum.wechat : LoginPageTypeEnum.passwordLogin
    );
  }, [feConfigs.oauth]);
  useEffect(() => {
    clearToken();
    router.prefetch('/home');
  }, []);

  return (
    <>
      {feConfigs.googleClientVerKey && (
        <Script
          src={`https://www.recaptcha.net/recaptcha/api.js?render=${feConfigs.googleClientVerKey}`}
        ></Script>
      )}
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        bg={`url('/icon/login-bg.svg') no-repeat`}
        backgroundSize={'cover'}
        userSelect={'none'}
        h={'100%'}
        px={[0, '10vw']}
      >
        <Flex
          flexDirection={'column'}
          w={['100%', 'auto']}
          h={['100%', '450px']}
          maxH={['100%', '90vh']}
          bg={'white'}
          px={['5vw', '50px']}
          py={'5vh'}
          borderRadius={[0, '24px']}
          boxShadow={[
            '',
            '0px 0px 1px 0px rgba(19, 51, 107, 0.20), 0px 32px 64px -12px rgba(19, 51, 107, 0.20)'
          ]}
        >
          <Box w={['100%', '380px']} flex={'1 0 0'}>
            {pageType ? (
              <DynamicComponent type={pageType} />
            ) : (
              <Center w={'full'} h={'full'} position={'relative'}>
                <Loading fixed={false} />
              </Center>
            )}
          </Box>
          <Box
            mt={4}
            color={'black.700'}
            textAlign={'left'}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            其他登录方式：
            <MyIcon
              mr={2}
              name={'DingDing' as IconNameType}
              w={'30px'}
              cursor={'pointer'}
              onClick={async () => {
                const res = await getDingLoginQR();
                if ((res as any)?.code == 200) {
                  router.push((res as any).url);
                }
              }}
            />
          </Box>
          <Flex alignItems={'center'} fontSize={'12px'} mb={'12px'}>
            {t('support.user.login.Policy tip')}
            <Link
              ml={1}
              onClick={onOpen}
              color={'primary.500'}
            >
              {t('support.user.login.Terms')}
            </Link>
          </Flex>

          <MyModal isOpen={isOpen} onClose={onClose} iconSrc="modal/concat" title={t('home.Community')}>
            <ModalBody textAlign={'left'}>
              <Markdown source={disclaimerIntro} />
            </ModalBody>
          </MyModal>
          {feConfigs?.concatMd && (
            <Box
              mt={8}
              color={'primary.700'}
              cursor={'pointer'}
              textAlign={'center'}
              onClick={onOpen}
            >
              无法登录，点击联系
            </Box>
          )}
        </Flex>

        {/* {isOpen && <CommunityModal onClose={onClose} />} */}
      </Flex>
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Login;
