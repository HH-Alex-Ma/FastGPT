import React, { useCallback, useState } from 'react';
import { Box, Grid, Flex, IconButton, useDisclosure, Text, Icon, Input } from '@chakra-ui/react';
import { AddIcon, StarIcon } from '@chakra-ui/icons';
import { delModelById } from '@/web/core/app/api';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import { useUserStore } from '@/web/support/user/useUserStore';
import { setAppCollect } from '@/web/support/user/api';
import { AppSortType } from '@fastgpt/global/support/permission/constant';
import CreateModal from './CreateModal';
import { useRouter } from 'next/router';

const MyAppListPc = ({
  ownerApps,
  data,
  collects,
  onEdit,
  onRefresh
}: {
  ownerApps: any;
  data: any;
  collects: any;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const [searchText, setSearchText] = useState('');

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
  /* 点击收藏，取消收藏*/
  const onclickCollectApp = useCallback(
    async (appId: string, type: number) => {
      try {
        await setAppCollect(userInfo?.team.tmbId, appId, type);
        toast({
          title: '操作成功',
          status: 'success'
        });
        onRefresh();
      } catch (err: any) {
        toast({
          title: err?.message || '操作失败',
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
      name: '由我创建'
    },
    {
      id: 4,
      name: '我收藏的'
    }
  ];
  const myApps = () => {
    if (activeAppType == 1) {
      return ownerApps.filter((item: any) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    } else if (activeAppType == 2) {
      return ownerApps.filter(
        (item: any) =>
          item.appType == AppSortType.COMPANY &&
          item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    } else if (activeAppType == 3) {
      return ownerApps.filter(
        (item: any) =>
          item.appType == AppSortType.PERSON &&
          item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    } else {
      return ownerApps.filter(
        (item: any) =>
          collects &&
          collects.includes(item._id) &&
          item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  };

  return (
    <>
      <Flex px={[5, '48px']} py={['10px']} alignItems={'center'} justifyContent={'space-between'}>
        <Flex bgColor={'#fff'} borderRadius={'md'} boxShadow="md" alignItems={'center'} p={'5px'}>
          {appTypes.map((item: any) => (
            <Text
              key={item.id}
              fontSize="18px"
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
        <Box>
          <Input
            placeholder="搜索"
            value={searchText}
            bg={'#fff'}
            onChange={(e) => setSearchText(e.currentTarget.value)}
          />
        </Box>
      </Flex>
      <PageContainer
        insertProps={{
          px: [5, '48px'],
          borderRadius: [0, '0px'],
          borderWidth: [0],
          bg: '#F0F2F5',
          overflow: 'scroll',
          paddingBottom: '67px'
        }}
        py={[0, '0px']}
        pr={[0, '0px']}
      >
        <Grid
          py={[4, 6]}
          gridTemplateColumns={['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']}
          gridGap={5}
        >
          {myApps().map((app: any) => (
            <MyTooltip key={app._id}>
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
                <Box position={'absolute'} h={'70px'} w={'70px'} mt={'5px'} ml={'-5px'}>
                  <Avatar src={app.avatar} borderRadius={'35px'} w={'70px'} />
                </Box>
                <Box ml={'80px'}>
                  <Flex alignItems={'center'}>
                    <Box
                      className="textEllipsis"
                      width={'200px'}
                      h={'24px'}
                      lineHeight={'24px'}
                      fontSize={'16px'}
                      fontWeight={700}
                    >
                      {app.name}
                    </Box>
                    <IconButton
                      position={'absolute'}
                      top={3}
                      right={4}
                      size={'xsSquare'}
                      variant={'whitePrimary'}
                      icon={
                        <StarIcon
                          boxSize={5}
                          color={collects && collects.includes(app._id) ? 'gold' : '#CBD5E0'}
                        />
                      }
                      aria-label={'collect'}
                      border={'0'}
                      _hover={{ bg: '#F7FAF7' }}
                      boxShadow="none"
                      onClick={(e) => {
                        e.stopPropagation();
                        onclickCollectApp(
                          app._id,
                          collects ? (collects.includes(app._id) ? 0 : 1) : 1
                        );
                      }}
                    />
                    {app.isOwner &&
                      userInfo?.team.canWrite &&
                      app.appType === AppSortType.PERSON && (
                        <IconButton
                          position={'absolute'}
                          top={3}
                          right={12}
                          size={'xsSquare'}
                          variant={'whiteDanger'}
                          icon={
                            <MyIcon name={'common/settingLight'} color={'#718096'} w={'18px'} />
                          }
                          aria-label={'setting'}
                          border={'0'}
                          _hover={{ bg: '#F7FAF7' }}
                          boxShadow="none"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/home/detail?appId=${app._id}`);
                          }}
                        />
                      )}
                  </Flex>
                  <Box
                    flex={1}
                    style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                      marginBottom: '2px',
                      height: '45px'
                    }}
                    wordBreak={'break-all'}
                    fontSize={'14px'}
                    color={'myGray.600'}
                  >
                    {app.intro || '这个应用还没写介绍~'}
                  </Box>
                  <Flex justifyContent="space-between" h={'15px'} mt={'20px'} alignItems={'center'}>
                    <Text color={'myGray.600'} fontSize={'12px'}>
                      {app.appType === AppSortType.PERSON ? '个人应用' : '企业应用'}
                    </Text>
                    {app.isOwner &&
                      userInfo?.team.canWrite &&
                      app.appType === AppSortType.PERSON && (
                        <>
                          <IconButton
                            className="delete"
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
                        </>
                      )}
                  </Flex>
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
          <CreateModal onClose={onCloseCreateModal} onSuccess={() => onRefresh()} />
        )}
      </PageContainer>
    </>
  );
};

export default MyAppListPc;
