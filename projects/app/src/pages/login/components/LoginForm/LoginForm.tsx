import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Flex, Input, Button, Box, Link } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { LoginPageTypeEnum } from '@/constants/user';
import { postLogin } from '@/web/support/user/api';
import type { ResLogin } from '@/global/support/api/userRes';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getDocPath } from '@/web/common/system/doc';
import { useTranslation } from 'next-i18next';
import FormLayout from './components/FormLayout';
import MyIcon from '@fastgpt/web/components/common/Icon';
import type { IconNameType } from '@fastgpt/web/components/common/Icon/type.d';
import { getDingLoginQR, getADLoginQR } from '@/web/support/user/api';
import { useRouter } from 'next/router';
interface Props {
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { feConfigs } = useSystemStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  const onclickLogin = useCallback(
    async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postLogin({
            username,
            password
          })
        );
        toast({
          title: '登录成功',
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || '登录异常',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );

  const isCommunityVersion = feConfigs?.show_register === false && !feConfigs?.isPlus;

  // const loginOptions = [
  //   feConfigs?.show_phoneLogin ? t('support.user.login.Phone number') : '',
  //   feConfigs?.show_emailLogin ? t('support.user.login.Email') : '',
  //   t('support.user.login.Username')
  // ].filter(Boolean);

  // const placeholder = isCommunityVersion
  //   ? t('support.user.login.Root login')
  //   : loginOptions.join('/');

  return (
    <FormLayout setPageType={setPageType} pageType={LoginPageTypeEnum.passwordLogin}>
      <Box
        mt={'42px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onclickLogin)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder={'用户名'}
            {...register('username', {
              required: true
            })}
          ></Input>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder={t('support.user.login.Password')}
            {...register('password', {
              required: true,
              maxLength: {
                value: 60,
                message: '密码最多 60 位'
              }
            })}
          ></Input>
        </FormControl>
        {feConfigs?.docUrl && (
          <Flex alignItems={'center'} mt={7} fontSize={'sm'}>
            {t('support.user.login.Policy tip')}
            <Link
              ml={1}
              href={getDocPath('/docs/agreement/terms/')}
              target={'_blank'}
              color={'primary.500'}
            >
              {t('support.user.login.Terms')}
            </Link>
            <Box mx={1}>{t('support.user.login.And')}</Box>
            <Link
              href={getDocPath('/docs/agreement/privacy/')}
              target={'_blank'}
              color={'primary.500'}
            >
              {t('support.user.login.Privacy')}
            </Link>
          </Flex>
        )}

        <Button
          type="submit"
          my={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickLogin)}
        >
          {t('home.Login')}
        </Button>

        {feConfigs?.show_register && (
          <>
            <Flex align={'center'} justifyContent={'flex-end'} color={'primary.700'}>
              <Box
                cursor={'pointer'}
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setPageType('forgetPassword')}
                fontSize="sm"
              >
                {t('support.user.login.Forget Password')}
              </Box>
              <Box mx={3} h={'16px'} w={'1.5px'} bg={'myGray.250'}></Box>
              <Box
                cursor={'pointer'}
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setPageType('register')}
                fontSize="sm"
              >
                {t('support.user.login.Register')}
              </Box>
            </Flex>
          </>
        )}
      </Box>
      {/* <Box color={'black.700'} textAlign={'left'} style={{ display: 'flex', alignItems: 'center' }}>
        没有账户？
        <Link onClick={() => setPageType(LoginPageTypeEnum.register)} color={'blue.500'}>
          立即注册
        </Link>
      </Box>
      <Box
        mt={1}
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
        <MyIcon
          mr={2}
          name={'Azure' as IconNameType}
          w={'30px'}
          cursor={'pointer'}
          onClick={async () => {
            const res = await getADLoginQR();
            if ((res as any)?.code == 200) {
              router.push((res as any).data);
            } else {
              toast({
                title: (res as any).data || '登录异常',
                status: 'error'
              });
            }
          }}
        />
      </Box> */}
    </FormLayout>
  );
};

export default LoginForm;
