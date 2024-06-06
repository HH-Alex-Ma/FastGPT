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
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TableContainer
} from '@chakra-ui/react';
import { DragHandleIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { AddIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
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
import PermissionIconText from '@/components/support/permission/IconText';
import { useUserStore } from '@/web/support/user/useUserStore';
import { ModelType } from '@fastgpt/global/support/permission/constant';
import { filter } from 'lodash';
import AppDetail from '../detail';

const MyApps = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo } = useUserStore();
  /* 用LoadAppsDetails代替loadMyApps */
  const { myApps, loadMyApps, detailedApps, loadAppsDetails, findAppCreator } = useAppStore();
  const [teamsTags, setTeamTags] = useState([]);
  const { openConfirm, ConfirmModal } = useConfirm({
    title: '删除提示',
    content: '确认删除该应用所有信息？'
  });
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  const [searchText, setSearchText] = useState('');
  /* 根据搜索栏过滤显示 */
  const filteredApps = detailedApps
    .map((app) => {
      let modelValue = '';
      for (let module of app.modules) {
        if (module.moduleId === 'chatModule') {
          for (let input of module.inputs) {
            if (input.key === 'model') {
              modelValue = input.value;
              break;
            }
          }
          break;
        }
      }

      const valueStr = modelValue
        ? typeof modelValue === 'string'
          ? modelValue.toLowerCase()
          : (modelValue as string).toString().toLowerCase()
        : '';
      return {
        ...app,
        modelValue,
        isFiltered:
          app.isShow === ModelType.MINE &&
          (app.name.toLowerCase().includes(searchText.toLowerCase()) ||
            app.intro.toLowerCase().includes(searchText.toLowerCase()) ||
            valueStr.includes(searchText.toLowerCase()) ||
            app.userId.toLowerCase().includes(searchText.toLowerCase()) ||
            app.updateTime.toString().toLowerCase().includes(searchText.toLowerCase()) ||
            (app.appType === 'Person' && '个人'.includes(searchText.toLowerCase())) ||
            (app.appType === 'Company' && '企业'.includes(searchText.toLowerCase())))
      };
    })
    .filter((app) => app.isFiltered);

  /* 显示模式 */
  const [displayMode, setDisplayMode] = useState('grid');
  const toggleDisplayMode = () => {
    setDisplayMode((currMode) => (currMode === 'grid' ? 'table' : 'grid'));
  };
  /* 页数和搜索内容 */
  const itemsPerPage = 11;
  const [initPage, setInitPage] = useState(true);
  const [inputObj, setInputObj] = useState({
    pageNum: 0,
    keyword: ''
  });
  const [tempObj, setTempObj] = useState({
    pageNum: 1,
    keyword: ''
  });

  /* 点击删除 */
  const onclickDelApp = useCallback(
    async (id: string) => {
      try {
        await delModelById(id);
        toast({
          title: '删除成功',
          status: 'success'
        });
        loadAppsDetails(true);
      } catch (err: any) {
        toast({
          title: err?.message || '删除失败',
          status: 'error'
        });
      }
    },
    [toast, loadAppsDetails]
  );

  /* 加载模型 */
  const { isFetching } = useQuery(['loadDetailedApps'], () => loadAppsDetails(true), {
    refetchOnMount: true
  });

  return (
    <PageContainer isLoading={isFetching} insertProps={{ px: [5, '48px'] }}>
      <Flex pt={[4, '30px']} alignItems={'center'} justifyContent={'space-between'}>
        <Flex gap="3">
          <Box letterSpacing={1} fontSize={['20px', '24px']} color={'myGray.900'}>
            {t('app.My Apps')}
          </Box>
          <MyTooltip label={'切换显示'}>
            <IconButton
              aria-label="切换显示"
              variant="outline"
              onClick={toggleDisplayMode}
              icon={displayMode === 'grid' ? <HamburgerIcon /> : <DragHandleIcon />}
            />
          </MyTooltip>
        </Flex>
        {/*搜索栏*/}
        <Flex gap="2">
          <Box>
            <Input
              placeholder="搜索"
              value={searchText}
              bg={'#fff'}
              onChange={(e) => {
                setSearchText(e.currentTarget.value);
                setTempObj({ ...tempObj, pageNum: 1 });
              }}
            />
          </Box>
          <Button leftIcon={<AddIcon />} variant={'primaryOutline'} onClick={onOpenCreateModal}>
            {t('common.New Create')}
          </Button>
        </Flex>
      </Flex>

      {/* 显示模式(grid or table) */}
      {displayMode === 'grid' ? (
        /* Grid Display */
        <Grid
          py={[4, 6]}
          gridTemplateColumns={['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']}
          gridGap={5}
        >
          {filteredApps.map((app) => (
            <MyTooltip
              key={app._id}
              label={userInfo?.team.canWrite ? t('app.To Settings') : t('app.To Chat')}
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
                  if (userInfo?.team.canWrite) {
                    router.push(`/app/detail?appId=${app._id}`);
                  } else {
                    router.push(`/chat?appId=${app._id}`);
                  }
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
                <Flex h={'34px'} alignItems={'flex-end'}>
                  <Box flex={1}>
                    {/* <PermissionIconText permission={app.permission} color={'myGray.600'} /> */}
                  </Box>
                  {userInfo?.team.canWrite && (
                    <IconButton
                      className="chat"
                      size={'xsSquare'}
                      variant={'whitePrimary'}
                      icon={
                        <MyTooltip label={'去聊天'}>
                          <MyIcon name={'core/chat/chatLight'} w={'14px'} />
                        </MyTooltip>
                      }
                      aria-label={'chat'}
                      display={['', 'none']}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/chat?appId=${app._id}`);
                      }}
                    />
                  )}
                </Flex>
              </Box>
            </MyTooltip>
          ))}
        </Grid>
      ) : (
        /* Table Display */
        <Flex flexDirection={'column'} h={'90%'} pt={[1, 5]} position={'relative'}>
          <TableContainer mt={2} position={'relative'} h={'100%'} minH={'550px'}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>名称</Th>
                  <Th>描述</Th>
                  <Th>AI模型</Th>
                  <Th>创建人</Th>
                  <Th>企业/个人</Th>
                  <Th>更新时间</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredApps
                  .slice((tempObj.pageNum - 1) * itemsPerPage, tempObj.pageNum * itemsPerPage)
                  .map((app) => (
                    <Tr key={app._id}>
                      {/* 名称 */}
                      <Td>
                        <Flex flexDirection={'row'} alignItems="center" gap="8px">
                          <Avatar src={app.avatar} w="20px" h="20px" />
                          {app.name}
                        </Flex>
                      </Td>
                      {/* 描述 */}
                      <Td>
                        <MyTooltip label={app.intro ? app.intro : ''}>
                          {app.intro === ''
                            ? '这个应用还没写介绍~'
                            : app.intro.slice(0, 15) + ' . . .'}
                        </MyTooltip>
                      </Td>
                      {/* 模型（通过modules内固定index索引查得） */}
                      <Td>
                        <Tag size="sm" key="md" variant="subtle" color="#69758269">
                          <TagLabel color="#697582">{app.modelValue}</TagLabel>
                        </Tag>
                      </Td>
                      {/* 创建人 */}
                      <Td>{app.userId}</Td>
                      {/* 企业/个人 */}
                      <Td>
                        <Tag
                          size="sm"
                          key="md"
                          variant="subtle"
                          colorScheme={app.appType === 'Person' ? 'blue' : 'green'}
                        >
                          <TagLabel color="#697582">
                            {app.appType === 'Person' ? '个人应用' : '企业应用'}
                          </TagLabel>
                        </Tag>
                      </Td>
                      {/* 更新时间 */}
                      <Td>
                        {app.updateTime.toString().slice(0, 10) +
                          ' ' +
                          app.updateTime.toString().slice(11, 16)}
                      </Td>
                      <Td style={{ padding: 'px 10px' }}>
                        <Menu autoSelect={false} isLazy>
                          <MenuButton
                            _hover={{ bg: 'myWhite.600  ' }}
                            cursor={'pointer'}
                            borderRadius={'md'}
                          >
                            <MyIcon name={'more'} w={'14px'} p={2} />
                          </MenuButton>
                          <MenuList color={'myGray.700'} minW={`120px !important`} zIndex={10}>
                            <MenuItem
                              onClick={() => {
                                if (userInfo?.team.canWrite) {
                                  router.push(`/app/detail?appId=${app._id}`);
                                } else {
                                  router.push(`/chat?appId=${app._id}`);
                                }
                              }}
                              py={[2, 3]}
                            >
                              <MyIcon name={'edit'} w={['14px', '16px']} />
                              <Box ml={[1, 2]}>{t('common.Edit')}</Box>
                            </MenuItem>
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirm(() => onclickDelApp(app._id))();
                              }}
                              py={[2, 3]}
                            >
                              <MyIcon name={'delete'} w={['14px', '16px']} />
                              <Box ml={[1, 2]}>{t('common.Delete')}</Box>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex w={'100%'} p={5} alignItems={'center'} justifyContent={'flex-end'}>
            <Box ml={3}>
              <Flex alignItems={'center'} justifyContent={'end'}>
                <IconButton
                  isDisabled={tempObj.pageNum === 1}
                  icon={<ArrowBackIcon />}
                  aria-label={'left'}
                  size={'smSquare'}
                  onClick={() => {
                    setTempObj({ ...tempObj, pageNum: tempObj.pageNum - 1 });
                    setInputObj({ ...inputObj, pageNum: inputObj.pageNum - 1 });
                  }}
                />
                <Flex mx={2} alignItems={'center'}>
                  {t('modelCenter.pagePre')}&nbsp;
                  <Input
                    value={tempObj.pageNum}
                    w={'50px'}
                    h={'30px'}
                    size={'xs'}
                    type={'number'}
                    min={1}
                    readOnly={true}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (parseInt(val) <= 0) {
                        setTempObj({ ...tempObj, pageNum: 1 });
                      } else {
                        setTempObj({ ...tempObj, pageNum: parseInt(val) });
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (val === inputObj.pageNum + 1) return;
                      if (val < 1) {
                        setInputObj({ ...inputObj, pageNum: 0 });
                      } else {
                        setInputObj({ ...inputObj, pageNum: val - 1 });
                      }
                    }}
                  />
                  &nbsp;{t('modelCenter.pageSuf')}
                </Flex>
                <IconButton
                  isDisabled={filteredApps.length / itemsPerPage <= tempObj.pageNum}
                  icon={<ArrowForwardIcon />}
                  aria-label={'left'}
                  size={'sm'}
                  w={'28px'}
                  h={'28px'}
                  onClick={() => {
                    setTempObj({ ...tempObj, pageNum: tempObj.pageNum + 1 });
                    setInputObj({ ...inputObj, pageNum: inputObj.pageNum + 1 });
                  }}
                />
              </Flex>
            </Box>
          </Flex>
        </Flex>
      )}
      {/* (
        <ShareBox></ShareBox>
      ) */}

      {filteredApps.length === 0 && (
        <Flex mt={'35vh'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            没有符合条件的应用，快去创建一个吧！
          </Box>
        </Flex>
      )}
      <ConfirmModal />
      {isOpenCreateModal && (
        <CreateModal onClose={onCloseCreateModal} onSuccess={() => loadAppsDetails(true)} />
      )}
    </PageContainer>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default MyApps;
