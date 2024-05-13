import React, { useCallback } from 'react';
import { Flex, Menu, MenuButton, MenuList, MenuItem, useDisclosure } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useTranslation } from 'next-i18next';
import Avatar from '@/components/Avatar';
import { useUserStore } from '@/web/support/user/useUserStore';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import { useToast } from '@fastgpt/web/hooks/useToast';
import type { UserType } from '@fastgpt/global/support/user/type.d';
import { useForm } from 'react-hook-form';
import { UserUpdateParams } from '@/types/user';

import dynamic from 'next/dynamic';
const UpdatePswModal = dynamic(() => import('../../../pages/account/components/UpdatePswModal'));

const HeaderPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { userInfo, setUserInfo, updateUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserType
  });

  const { openConfirm, ConfirmModal } = useConfirm({
    content: '确认退出登录？'
  });

  const {
    isOpen: isOpenUpdatePsw,
    onClose: onCloseUpdatePsw,
    onOpen: onOpenUpdatePsw
  } = useDisclosure();

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onclickSave = useCallback(
    async (data: UserType) => {
      await updateUserInfo({
        avatar: data.avatar,
        timezone: data.timezone,
        openaiAccount: data.openaiAccount
      });
      reset(data);
      toast({
        title: t('dataset.data.Update Success Tip'),
        status: 'success'
      });
    },
    [reset, t, toast, updateUserInfo]
  );

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file || !userInfo) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.userAvatar,
          file,
          maxW: 300,
          maxH: 300
        });

        onclickSave({
          ...userInfo,
          avatar: src
        });
      } catch (err: any) {
        toast({
          title: typeof err === 'string' ? err : t('common.error.Select avatar failed'),
          status: 'warning'
        });
      }
    },
    [onclickSave, t, toast, userInfo]
  );

  return (
    <>
      <Flex
        bgColor={'#fff'}
        alignItems={'center'}
        flexDirection={'row'}
        h={'60px'}
        userSelect={'none'}
        position={'fixed'}
        left={260}
        right={0}
        zIndex={999999}
        borderBottom={'1px'}
        borderColor={'#e1e1e1'}
      >
        {/* logo */}
        {/* <Box
          flex={'0 0 auto'}
          mb={5}
          border={'2px solid #fff'}
          // borderRadius={'50%'}
          overflow={'hidden'}
          // onClick={() => router.push('/account')}
          textAlign={'center'}
          >
          <Image boxSize="50px" objectFit="cover" src="https://bit.ly/dan-abramov" />
          </Box> */}
        {/* 导航列表 */}
        <Flex position={'fixed'} right={'50px'} alignItems={'center'}>
          <Menu>
            <MenuButton>
              <Flex alignItems={'center'}>
                <Avatar
                  w={'37px'}
                  h={'36px'}
                  mr={'10px'}
                  src={userInfo?.avatar}
                  fallbackSrc={HUMAN_ICON}
                />
                {userInfo?.nickname}
                <ChevronDownIcon />
              </Flex>
            </MenuButton>
            <MenuList minW={'150px'}>
              <MenuItem onClick={onOpenSelectFile}>变更头像</MenuItem>
              <MenuItem onClick={onOpenUpdatePsw}>修改密码</MenuItem>
              <MenuItem
                onClick={() => {
                  openConfirm(() => {
                    setUserInfo(null);
                    router.replace('/login');
                  })();
                }}
              >
                退出
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <ConfirmModal />
        {isOpenUpdatePsw && <UpdatePswModal onClose={onCloseUpdatePsw} />}
        <File onSelect={onSelectFile} />
      </Flex>
    </>
  );
};

export default HeaderPage;
