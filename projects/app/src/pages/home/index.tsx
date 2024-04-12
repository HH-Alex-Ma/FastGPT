import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Text,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { delModelById } from '@/web/core/app/api';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import CreateModal from './component/CreateModal';
import { useAppStore } from '@/web/core/app/store/useAppStore';
import { useUserStore } from '@/web/support/user/useUserStore';
import { getOwnerApps } from '@/web/support/user/api';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import MyAvatar from '@/components/Avatar';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { AppListItemType } from '@fastgpt/global/core/app/type.d';
import { AppSortType } from '@fastgpt/global/support/permission/constant';

import dynamic from 'next/dynamic';
const UpdatePswModal = dynamic(() => import('../../pages/account/components/UpdatePswModal'));

const Home = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();
  const { Loading } = useLoading();
  const { userInfo } = useUserStore();
  const { myApps, loadMyApps } = useAppStore();
  const { isPc } = useSystemStore();
  const authCode = router.query.appId as string;
  const [activeAppId, setActiveAppId] = useState('' || authCode);

  /* 加载模型 */
  const { isFetching } = useQuery(['loadApps'], () => loadMyApps(true), {
    refetchOnMount: true
  });
  const { data: ownerApps = [] as any, isLoading: isGetting } = useQuery(['getOwnerApps'], () =>
    getOwnerApps(userInfo?._id, userInfo?.team.tmbId)
  );

  const appList = myApps.filter((app: AppListItemType) => ownerApps.includes(app._id));

  const routerJump = (id: string) => {
    setActiveAppId(id);
    if (id === 'default' || !id) {
      router.push('/home');
    } else {
      if (router.pathname != '/home/detail') {
        router.push(`/home/chat?appId=${id}`);
      }
    }
  };
  useEffect(() => {
    loadMyApps(true);
    setActiveAppId('' || authCode);
  }, [router.pathname]);
  return (
    <>
      {isPc === true && (
        <>
          <Box position={'fixed'} h={'100%'} top={0} left={0} w={'260px'}>
            <AsidePage ownerApps={appList} data={activeAppId} onEdit={(id) => routerJump(id)} />
          </Box>
          <Box h={'100%'} left={'260px'} position={'fixed'}>
            <HeaderPage />
            <Box
              h={'100%'}
              left={'260px'}
              top={'60px'}
              right={0}
              position={'fixed'}
              overflow={'overlay'}
              paddingBottom={'60px'}
            >
              {router.pathname == '/home' ? (
                <MyAppListPc
                  ownerApps={appList}
                  data={activeAppId}
                  onRefresh={() => loadMyApps(true)}
                  onEdit={(id) => routerJump(id)}
                />
              ) : (
                children
              )}
            </Box>
          </Box>
        </>
      )}
      {isPc === false && (
        <>
          <Box h={'100%'}>
            {router.pathname == '/home' ? (
              <MyAppList
                ownerApps={appList}
                data={activeAppId}
                onRefresh={() => loadMyApps(true)}
                onEdit={(id) => routerJump(id)}
              />
            ) : (
              children
            )}
          </Box>
        </>
      )}
      <Loading loading={isGetting || isFetching} fixed={false} />
    </>
  );
};
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}
export default Home;

const HeaderPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo, setUserInfo } = useUserStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    content: '确认退出登录？'
  });
  const {
    isOpen: isOpenUpdatePsw,
    onClose: onCloseUpdatePsw,
    onOpen: onOpenUpdatePsw
  } = useDisclosure();
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
                <Avatar w={'36px'} h={'36px'} src={userInfo?.avatar} fallbackSrc={HUMAN_ICON} />
                {userInfo?.nickname}
                <ChevronDownIcon />
              </Flex>
            </MenuButton>
            <MenuList minW={'150px'}>
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
      </Flex>
    </>
  );
};

const AsidePage = ({
  ownerApps,
  data,
  onEdit
}: {
  ownerApps: any;
  data: any;
  onEdit: (id: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      flexDirection={'column'}
      h={'100%'}
      py={[0, '0px']}
      pr={[0, '0px']}
      backgroundColor={'#efefef'}
      borderRight={'1px'}
      borderColor={'#e1e1e1'}
    >
      <Box mx={1} px={3} h={'60px'} pt={'12.5px'}>
        <Flex alignItems={'center'} borderRadius={'md'}>
          <Image boxSize="35px" objectFit="cover" src="https://bit.ly/dan-abramov" />
          <Text fontSize="18px" fontWeight={'700'} pl={'5px'}>
            e-GPT企业智能助手
          </Text>
        </Flex>
      </Box>
      <Box h={'60px'} mx={1} borderTop={'1px'} borderColor={'#e1e1e1'} pt={'5px'}>
        <Flex
          key={'default'}
          py={3}
          px={3}
          mb={3}
          cursor={'pointer'}
          borderRadius={'md'}
          alignItems={'center'}
          {...('default' === data
            ? {
                bg: 'white',
                boxShadow: 'md',
                fontWeight: '700',
                color: '#447EF2'
              }
            : {
                _hover: {
                  bg: '#fff'
                },
                onClick: () => {
                  onEdit('default');
                }
              })}
        >
          <Image boxSize="28px" objectFit="cover" src="https://bit.ly/dan-abramov" />
          <Box ml={2} className={'textEllipsis'} fontSize={'16px'}>
            {'应用列表'}
          </Box>
        </Flex>
      </Box>
      <Box
        height={'100%'}
        flex={'1 0 0'}
        mx={1}
        overflow={'overlay'}
        borderTop={'1px'}
        borderColor={'#e1e1e1'}
        pt={'5px'}
      >
        {ownerApps.map((item: any) => (
          <Flex
            key={item._id}
            py={3}
            px={3}
            mb={3}
            cursor={'pointer'}
            borderRadius={'md'}
            alignItems={'center'}
            {...(item._id === data
              ? {
                  bg: 'white',
                  boxShadow: 'md',
                  fontWeight: '700',
                  color: '#447EF2'
                }
              : {
                  _hover: {
                    bg: '#fff'
                  },
                  onClick: () => {
                    onEdit(item._id);
                  }
                })}
          >
            <MyAvatar src={item.avatar} w={'28px'} />
            <Box ml={2} className={'textEllipsis'} fontSize={'16px'}>
              {item.name}
            </Box>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};

const MyAppList = ({
  ownerApps,
  data,
  onEdit,
  onRefresh
}: {
  ownerApps: any;
  data: any;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: '删除提示',
    content: '确认删除该应用所有信息？'
  });
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  /* 点击删除 */
  const onclickDelApp = useCallback(
    async (id: string) => {
      try {
        await delModelById(id);
        toast({
          title: '删除成功',
          status: 'success'
        });
        onRefresh();
      } catch (err: any) {
        toast({
          title: err?.message || '删除失败',
          status: 'error'
        });
      }
    },
    [toast]
  );

  return (
    <PageContainer
      insertProps={{ px: [5, '48px'], borderRadius: [0, '0px'], borderWidth: [0] }}
      py={[0, '0px']}
      pr={[0, '0px']}
    >
      <Flex pt={[4, '15px']} alignItems={'center'} justifyContent={'space-between'}>
        <Box letterSpacing={1} fontSize={['20px', '24px']} color={'myGray.900'}>
          {t('app.My Apps') + 'New'}
        </Box>
        {/* <Button leftIcon={<AddIcon />} variant={'primaryOutline'} onClick={onOpenCreateModal}> */}
        <Button leftIcon={<AddIcon />} variant={'primaryOutline'}>
          {t('common.New Create')}
        </Button>
      </Flex>
      <Grid
        py={[4, 6]}
        gridTemplateColumns={[
          '1fr',
          'repeat(2,1fr)',
          'repeat(3,1fr)',
          'repeat(4,1fr)',
          'repeat(5,1fr)',
          'repeat(6,1fr)'
        ]}
        gridGap={5}
      >
        {ownerApps.map((app: any) => (
          <MyTooltip
            key={app._id}
            // label={userInfo?.team.canWrite ? t('app.To Settings') : t('app.To Chat')}
          >
            <Box
              lineHeight={1.5}
              h={'100%'}
              py={3}
              px={5}
              cursor={'pointer'}
              borderWidth={'1.5px'}
              borderColor={'borderColor.low'}
              bg={'white'}
              borderRadius={'md'}
              userSelect={'none'}
              position={'relative'}
              display={'flex'}
              flexDirection={'column'}
              _hover={{
                borderColor: 'primary.300',
                boxShadow: '1.5',
                '& .delete': {
                  display: 'flex'
                },
                '& .chat': {
                  display: 'flex'
                }
              }}
              onClick={() => {
                onEdit(app._id);
              }}
            >
              <Flex alignItems={'center'} h={'38px'}>
                <Avatar src={app.avatar} borderRadius={'md'} w={'28px'} />
                <Box ml={3}>{app.name}</Box>
                {app.isOwner && userInfo?.team.canWrite && (
                  <IconButton
                    className="delete"
                    position={'absolute'}
                    top={4}
                    right={4}
                    size={'xsSquare'}
                    variant={'whiteDanger'}
                    icon={<MyIcon name={'delete'} w={'14px'} />}
                    aria-label={'delete'}
                    display={['', 'none']}
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm(() => onclickDelApp(app._id))();
                    }}
                  />
                )}
              </Flex>
              <Box
                flex={1}
                className={'textEllipsis3'}
                py={2}
                wordBreak={'break-all'}
                fontSize={'sm'}
                color={'myGray.600'}
              >
                {app.intro || '这个应用还没写介绍~'}
              </Box>
            </Box>
          </MyTooltip>
        ))}
      </Grid>

      {ownerApps.length === 0 && (
        <Flex mt={'35vh'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            还没有应用，快去创建一个吧！
          </Box>
        </Flex>
      )}
      <ConfirmModal />
      {isOpenCreateModal && (
        <CreateModal onClose={onCloseCreateModal} onSuccess={() => onRefresh()} />
      )}
    </PageContainer>
  );
};

const MyAppListPc = ({
  ownerApps,
  data,
  onEdit,
  onRefresh
}: {
  ownerApps: any;
  data: any;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: '删除提示',
    content: '确认删除该应用所有信息？'
  });
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  /* 点击删除 */
  const onclickDelApp = useCallback(
    async (id: string) => {
      try {
        await delModelById(id);
        toast({
          title: '删除成功',
          status: 'success'
        });
        onRefresh();
      } catch (err: any) {
        toast({
          title: err?.message || '删除失败',
          status: 'error'
        });
      }
    },
    [toast]
  );
  const [activeAppType, setActiveAppType] = useState(1);
  const appTypes = [
    {
      id: 1,
      name: '全部'
    },
    {
      id: 2,
      name: '企业应用'
    },
    {
      id: 3,
      name: '个人应用'
    },
    {
      id: 4,
      name: '收藏'
    }
  ];
  const myApps = () => {
    if (activeAppType == 1) {
      return ownerApps;
    } else if (activeAppType == 2) {
      console.log(ownerApps);
      return ownerApps.filter((item: any) => item.appType == AppSortType.COMPANY);
    } else if (activeAppType == 3) {
      return ownerApps.filter((item: any) => item.appType == AppSortType.PERSON);
    } else {
      return [];
    }
  };

  return (
    <PageContainer
      insertProps={{ px: [5, '48px'], borderRadius: [0, '0px'], borderWidth: [0] }}
      py={[0, '0px']}
      pr={[0, '0px']}
    >
      <Flex pt={['10px']} alignItems={'center'}>
        <Flex bgColor={'#fff'} borderRadius={'md'} boxShadow="md" alignItems={'center'} p={'5px'}>
          {appTypes.map((item: any) => (
            <Text
              key={item.id}
              fontSize="3xl"
              minW={'100px'}
              textAlign={'center'}
              m={['5px']}
              {...(item.id === activeAppType
                ? {
                    fontWeight: '600',
                    color: '#447EF2'
                  }
                : {
                    _hover: {
                      boxShadow: 'lg',
                      fontWeight: '600',
                      color: '#447EF2'
                    },
                    onClick: () => {
                      setActiveAppType(item.id);
                    }
                  })}
            >
              {item.name}
            </Text>
          ))}
        </Flex>
      </Flex>
      <Grid
        py={[4, 6]}
        gridTemplateColumns={[
          '1fr',
          'repeat(2,1fr)',
          'repeat(3,1fr)',
          'repeat(4,1fr)',
          'repeat(5,1fr)',
          'repeat(6,1fr)'
        ]}
        gridGap={5}
      >
        {activeAppType == 1 && (
          <MyTooltip>
            <Box
              lineHeight={1.5}
              h={'100%'}
              py={5}
              px={5}
              cursor={'pointer'}
              borderWidth={'1.5px'}
              borderColor={'borderColor.low'}
              bg={'white'}
              borderRadius={'md'}
              userSelect={'none'}
              position={'relative'}
              display={'flex'}
              flexDirection={'column'}
              onClick={onOpenCreateModal}
            >
              <Text fontSize="lg" minW={'100px'} textAlign={'center'}>
                <AddIcon boxSize={5} />
              </Text>
              <Text fontSize="lg" minW={'100px'} textAlign={'center'} py={2}>
                创建属于你的AI应用
              </Text>
            </Box>
          </MyTooltip>
        )}
        {myApps().map((app: any) => (
          <MyTooltip
            key={app._id}
            // label={userInfo?.team.canWrite ? t('app.To Settings') : t('app.To Chat')}
          >
            <Box
              lineHeight={1.5}
              h={'100%'}
              py={3}
              px={5}
              cursor={'pointer'}
              borderWidth={'1.5px'}
              borderColor={'borderColor.low'}
              bg={'white'}
              borderRadius={'md'}
              userSelect={'none'}
              position={'relative'}
              display={'flex'}
              flexDirection={'column'}
              _hover={{
                borderColor: 'primary.300',
                boxShadow: '1.5',
                '& .delete': {
                  display: 'flex'
                },
                '& .chat': {
                  display: 'flex'
                }
              }}
              onClick={() => {
                onEdit(app._id);
              }}
            >
              <Flex alignItems={'center'} h={'38px'}>
                <Avatar src={app.avatar} borderRadius={'md'} w={'28px'} />
                <Box ml={3}>{app.name}</Box>
                {app.isOwner && userInfo?.team.canWrite && app.appType === AppSortType.PERSON && (
                  <IconButton
                    className="delete"
                    position={'absolute'}
                    top={4}
                    right={4}
                    size={'xsSquare'}
                    variant={'whiteDanger'}
                    icon={<MyIcon name={'delete'} w={'14px'} />}
                    aria-label={'delete'}
                    display={['', 'none']}
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm(() => onclickDelApp(app._id))();
                    }}
                  />
                )}
              </Flex>
              <Box
                flex={1}
                className={'textEllipsis3'}
                py={2}
                wordBreak={'break-all'}
                fontSize={'sm'}
                color={'myGray.600'}
              >
                {app.intro || '这个应用还没写介绍~'}
              </Box>
            </Box>
          </MyTooltip>
        ))}
      </Grid>

      {myApps().length === 0 && (
        <Flex mt={'35vh'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            还没有应用，快去创建一个吧！
          </Box>
        </Flex>
      )}
      <ConfirmModal />
      {isOpenCreateModal && (
        <CreateModal
          onClose={onCloseCreateModal}
          onSuccess={() => {
            onRefresh();
          }}
        />
      )}
    </PageContainer>
  );
};
