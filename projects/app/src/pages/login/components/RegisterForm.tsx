import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Box, Input, Button, FormErrorMessage } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { LoginPageTypeEnum } from '@/constants/user';
import { postRegister } from '@/web/support/user/api';
import { useSendCode } from '@/web/support/user/hooks/useSendCode';
import type { ResLogin } from '@/global/support/api/userRes';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
interface Props {
  loginSuccess: (e: ResLogin) => void;
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
}

interface RegisterType {
  companyName: string;
  nickname: string;
  department: string;
  email: string;
  username: string;
  password: string;
  password2: string;
  code: string;
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<RegisterType>({
    mode: 'onBlur'
  });

  const { sendCodeText, sendCode, codeCountDown } = useSendCode();

  const onclickSendCode = useCallback(async () => {
    const check = await trigger('username');
    if (!check) return;
    sendCode({
      username: getValues('username'),
      type: 'register'
    });
  }, [getValues, sendCode, trigger]);

  const [requesting, setRequesting] = useState(false);

  const onclickRegister = useCallback(
    async ({
      companyName,
      nickname,
      department,
      email,
      username,
      password,
      code
    }: RegisterType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postRegister({
            companyName,
            nickname,
            department,
            email,
            username,
            code,
            password,
            inviterId: localStorage.getItem('inviterId') || undefined
          })
        );
        toast({
          title: `注册成功`,
          status: 'success'
        });
        // auto register template app
        // setTimeout(() => {
        //   appTemplates.forEach((template) => {
        //     postCreateApp({
        //       avatar: template.avatar,
        //       name: t(template.name),
        //       modules: template.modules,
        //       type: template.type
        //     });
        //   });
        // }, 100);
      } catch (error: any) {
        toast({
          title: error.message || '注册异常',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, t, toast]
  );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'left'}>
        注册 {feConfigs?.systemTitle} 账号
      </Box>
      <Box
        mt={'22px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onclickRegister)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.companyName}>
          <Input
            bg={'myGray.50'}
            placeholder="请输入企业名称（必填）"
            {...register('companyName', {
              required: '请输入企业名称'
            })}
          ></Input>
          <FormErrorMessage>企业名称不能为空</FormErrorMessage>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.department}>
          <Input
            bg={'myGray.50'}
            placeholder="请输入所在部门（必填）"
            {...register('department', {
              required: '部门不能为空'
            })}
          ></Input>
          <FormErrorMessage>部门不能为空</FormErrorMessage>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.nickname}>
          <Input
            bg={'myGray.50'}
            placeholder="请输入姓名（必填）"
            {...register('nickname', {
              required: '姓名不能为空'
            })}
          ></Input>
          <FormErrorMessage>姓名不能为空</FormErrorMessage>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.email}>
          <Input
            bg={'myGray.50'}
            placeholder="请输入邮箱"
            {...register('email', {
              // required: '邮箱不能为空',
              // pattern: {
              //   value: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/,
              //   message: '邮箱格式错误'
              // }
            })}
          ></Input>
          <FormErrorMessage>邮箱错误，请重新输入</FormErrorMessage>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder="请输入手机号"
            {...register('username', {
              required: '手机号不能为空',
              pattern: {
                value: /^1[3456789]\d{9}$/,
                message: '手机号格式错误'
              }
            })}
          ></Input>
          <FormErrorMessage>手机号错误，请重新输入</FormErrorMessage>
        </FormControl>
        <FormControl
          mt={6}
          isInvalid={!!errors.code}
          display={'flex'}
          alignItems={'center'}
          position={'relative'}
        >
          <Input
            bg={'myGray.50'}
            flex={1}
            maxLength={8}
            placeholder="请输入验证码"
            {...register('code', {
              required: '验证码不能为空'
            })}
          ></Input>
          <Box
            position={'absolute'}
            right={3}
            zIndex={1}
            fontSize={'sm'}
            {...(codeCountDown > 0
              ? {
                  color: 'myGray.500'
                }
              : {
                  color: 'primary.700',
                  cursor: 'pointer',
                  onClick: onclickSendCode
                })}
          >
            {sendCodeText}
          </Box>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="请输入密码(8~20位)"
            {...register('password', {
              required: '密码不能为空',
              pattern: {
                value:
                  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*,\._])[0-9a-zA-Z!@#$%^&*,\\._]{8,20}$/,
                message: '密码必须包含大小写字母,特殊字符和数字，且长度不低于8位'
              },
              minLength: {
                value: 8,
                message: '密码最少 8 位最多 20 位'
              },
              maxLength: {
                value: 20,
                message: '密码最少 8 位最多 20 位'
              }
            })}
          ></Input>
          <FormErrorMessage>
            密码必须包含大小写字母,特殊字符和数字，且长度不低于8位最多 20 位
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password2}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="确认密码"
            {...register('password2', {
              validate: (val) => (getValues('password') === val ? true : '两次密码不一致')
            })}
          ></Input>
        </FormControl>
        <Button
          type="submit"
          mt={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickRegister)}
        >
          确认注册
        </Button>
        <Box
          float={'right'}
          fontSize="sm"
          mt={2}
          mb={'50px'}
          color={'primary.700'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => setPageType(LoginPageTypeEnum.passwordLogin)}
        >
          已有账号，去登录
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;
