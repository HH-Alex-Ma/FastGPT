import React, { useMemo } from 'react';
import { Box, BoxProps, Flex, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/storeChat';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import NextLink from 'next/link';
import Badge from '../Badge';
import Avatar from '../Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyTooltip from '../MyTooltip';
import { getDocPath } from '@/web/common/system/doc';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';

export enum NavbarTypeEnum {
  normal = 'normal',
  small = 'small'
}

const NavbarHome = ({ unread }: { unread: number }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo, setUserInfo } = useUserStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    content: '确认退出登录？'
  });

  return (
    <Flex
      alignItems={'center'}
      flexDirection={'row'}
      h={'60px'}
      userSelect={'none'}
      position={'fixed'}
      left={300}
      right={0}
      zIndex={999999}
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
              <Avatar w={'36px'} h={'36px'} src={userInfo?.avatar} fallbackSrc={HUMAN_ICON} />
              {userInfo?.nickname}
              <ChevronDownIcon />
            </Flex>
          </MenuButton>
          <MenuList minW={'150px'}>
            <MenuItem>修改密码</MenuItem>
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
    </Flex>
  );
};

export default NavbarHome;
