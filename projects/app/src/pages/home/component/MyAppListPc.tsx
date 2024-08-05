import React, { useCallback, useMemo, useState } from 'react';
import { Box, Grid, Flex, IconButton, useDisclosure, Text, Input } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
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
import { useRouter } from 'next/router';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useQuery } from '@tanstack/react-query';
import { getTypes } from '@/web/support/user/api';
import CreateModal from '@/pages/app/list/component/CreateModal';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import dynamic from 'next/dynamic';
import { AppPermissionList } from '@fastgpt/global/support/permission/app/constant';
import {
  deleteAppCollaborators,
  getCollaboratorList,
  postUpdateAppCollaborators
} from '@/web/core/app/api/collaborator';

const ConfigPerModal = dynamic(() => import('@/components/support/permission/ConfigPerModal'));

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
  const [editPerAppIndex, setEditPerAppIndex] = useState<string>();

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
  const [activeAppType, setActiveAppType] = useState(0);
  const [mySelectType, setMySelectType] = useState(1);
  const {
    data: appTypes = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getTypes'], () => getTypes());

  const mySelectTypes = [
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
      name: '团队分享'
    }
  ];
  const myApps = () => {
    return ownerApps.filter(
      (item: any) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (activeAppType != 0 ? item.appShowType == activeAppType : 1 == 1) &&
        (mySelectType == 1
          ? 1 == 1
          : mySelectType == 2
            ? item.appType == AppSortType.COMPANY
            : mySelectType == 3
              ? item.appType == AppSortType.PERSON
              : mySelectType == 4
                ? item.appType == AppSortType.SHARE
                : collects && collects.includes(item._id))
    );
  };

  const editPerApp = useMemo(
    () =>
      editPerAppIndex !== undefined
        ? myApps().find((item: any) => item._id == editPerAppIndex)
        : undefined,
    [editPerAppIndex, myApps]
  );
  return (
    <>
      <Flex
        px={[5, '48px']}
        py={['10px']}
        bgColor={'#F0F2F5'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex alignItems={'center'}>
          <Text
            bgColor={'#fff'}
            borderRadius={'md'}
            boxShadow="md"
            key={0}
            fontSize="14px"
            minW={'100px'}
            textAlign={'center'}
            m={['5px']}
            p={'5px'}
            {...(0 === activeAppType
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
                    setActiveAppType(0);
                  }
                })}
          >
            {`全部`}
          </Text>
          {appTypes.map((item: any) => (
            <Text
              bgColor={'#fff'}
              borderRadius={'md'}
              boxShadow="md"
              key={item._id}
              fontSize="14px"
              minW={'100px'}
              textAlign={'center'}
              m={['5px']}
              p={'5px'}
              {...(item._id === activeAppType
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
                      setActiveAppType(item._id);
                    }
                  })}
            >
              {item.name}
            </Text>
          ))}
        </Flex>
        <Flex px={'10px'}>
          <Box px={'10px'}>
            <Input
              placeholder="搜索"
              value={searchText}
              bg={'#fff'}
              onChange={(e) => setSearchText(e.currentTarget.value)}
            />
          </Box>
          <Box width={'100px'}>
            <MySelect
              height={'40px'}
              value={mySelectType as any}
              list={mySelectTypes.map((item) => ({
                label: item.name,
                value: item.id as any
              }))}
              onchange={(val: any) => {
                setMySelectType(val);
              }}
            />
          </Box>
        </Flex>
      </Flex>
      <PageContainer
        insertProps={{
          px: [5, '48px'],
          borderRadius: [0, '0px'],
          borderWidth: [0],
          boxShadow: '0',
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
          {myApps().map((app: any, index: any) => (
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
                  '& .more': {
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
                      {app.appType === AppSortType.PERSON
                        ? '个人应用'
                        : app.appType === AppSortType.SHARE
                          ? '团队分享'
                          : '企业应用'}
                    </Text>
                    {app.isOwner &&
                      userInfo?.team.canWrite &&
                      app.appType === AppSortType.PERSON && (
                        <Box className="more" display={['', 'none']} zIndex={9}>
                          <MyMenu
                            Button={
                              <IconButton
                                size={'xsSquare'}
                                variant={'transparentBase'}
                                icon={<MyIcon name={'more'} w={'0.875rem'} color={'myGray.500'} />}
                                aria-label={''}
                              />
                            }
                            menuList={[
                              {
                                children: [
                                  {
                                    icon: 'support/team/key',
                                    label: t('common:common.Permission'),
                                    onClick: () => setEditPerAppIndex(app._id)
                                  },
                                  {
                                    type: 'primary' as 'primary',
                                    icon: 'common/settingLight',
                                    label: t('common:common.Setting'),
                                    onClick: () => router.push(`/home/detail?appId=${app._id}`)
                                  }
                                ]
                              },
                              {
                                children: [
                                  {
                                    type: 'danger' as 'danger',
                                    icon: 'delete',
                                    label: t('common:common.Delete'),
                                    onClick: () => openConfirm(() => onclickDelApp(app._id))()
                                  }
                                ]
                              }
                            ]}
                          ></MyMenu>
                        </Box>
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
        {!!editPerApp && (
          <ConfigPerModal
            refetchResource={() => onRefresh()}
            avatar={editPerApp.avatar}
            name={editPerApp.name}
            managePer={{
              permission: editPerApp.permission,
              permissionList: AppPermissionList,
              onGetCollaboratorList: () => getCollaboratorList(editPerApp._id),
              onUpdateCollaborators: ({
                tmbIds,
                permission
              }: {
                tmbIds: string[];
                permission: number;
              }) => {
                return postUpdateAppCollaborators({
                  tmbIds,
                  permission,
                  appId: editPerApp._id
                });
              },
              onDelOneCollaborator: (tmbId: string) =>
                deleteAppCollaborators({
                  appId: editPerApp._id,
                  delTmbId: tmbId
                }),
              refreshDeps: [editPerApp.inheritPermission]
            }}
            onClose={() => setEditPerAppIndex(undefined)}
          />
        )}
      </PageContainer>
    </>
  );
};

export default MyAppListPc;
