import React, { useCallback, useState } from 'react';
import { Box, Flex, Text, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { StarIcon, AddIcon, MinusIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import MyAvatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';
import { setAppCollect } from '@/web/support/user/api';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useToast } from '@fastgpt/web/hooks/useToast';

const AsidePage = ({
  ownerApps,
  collects,
  data,
  onEdit,
  onCreate,
  onRefresh
}: {
  ownerApps: any;
  collects: any;
  data: any;
  onEdit: (id: string) => void;
  onCreate: () => void;
  onRefresh: () => void;
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const [isShow, setIsShow] = useState(true);

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
  return (
    <Flex
      flexDirection={'column'}
      h={'100%'}
      py={[0, '0px']}
      pr={[0, '0px']}
      backgroundColor={'#ffffff'}
      borderRight={'1px'}
      borderColor={'#e1e1e1'}
    >
      <Box mx={1} px={3} h={'60px'} pt={'12.5px'}>
        <Flex alignItems={'center'} borderRadius={'md'}>
          <MyAvatar w={'40px'} h={'40px'} mr={'5px'} borderRadius={'20px'} src={LOGO_ICON} />
          <Text fontSize="18px" fontWeight={'700'} pl={'5px'}>
            GenAI企业应用助手
          </Text>
        </Flex>
      </Box>
      <Box mx={1} mt={'10px'} pt={'5px'}>
        <Flex
          key={'default'}
          py={3}
          px={3}
          mx={2}
          cursor={'pointer'}
          borderRadius={'md'}
          alignItems={'center'}
          justifyItems={'center'}
          {...('default' === data
            ? {
                bg: '#E5EAFF',
                boxShadow: 'md',
                // fontWeight: '700',
                color: '#447EF2'
              }
            : {
                _hover: {
                  bg: '#E5EAFF'
                },
                onClick: () => {
                  onEdit('default');
                }
              })}
        >
          <MyIcon name={'core/app/aiLight'} boxSize={'18px'} />
          <Box ml={4} className={'textEllipsis'} fontSize={'16px'}>
            {'应用中心'}
          </Box>
        </Flex>
      </Box>
      <Box mx={1} mt={'5px'}>
        <Flex
          key={'default'}
          py={3}
          px={3}
          mx={2}
          cursor={'pointer'}
          borderRadius={'md'}
          alignItems={'center'}
          {...('create' === data
            ? {
                bg: '#E5EAFF',
                boxShadow: 'md',
                color: '#447EF2'
              }
            : {
                _hover: {
                  bg: '#E5EAFF'
                },
                onClick: () => {
                  onCreate();
                  // onEdit('create');
                }
              })}
        >
          <MyIcon name={'common/addCircleLight'} boxSize={'18px'} />
          <Box ml={4} className={'textEllipsis'} fontSize={'16px'}>
            {'创建应用'}
          </Box>
        </Flex>
      </Box>
      <Box>
        <Flex
          px={6}
          mt={'5px'}
          p={4}
          className={'textEllipsis'}
          borderTop={'1px'}
          cursor={'pointer'}
          borderColor={'#e1e1e1'}
          alignItems={'center'}
          _hover={{
            bg: 'myGray.100',
            '& .more': {
              display: 'block'
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsShow(!isShow);
          }}
        >
          <Box flex={'1 0 0'} ml={3} className="textEllipsis" fontSize="16px">
            {'我的收藏'}
          </Box>
          {isShow ? <ChevronUpIcon boxSize={'16px'} /> : <ChevronDownIcon boxSize={'16px'} />}
        </Flex>
      </Box>

      {isShow && (
        <Box
          height={'100%'}
          flex={'1 0 0'}
          mx={1}
          overflow={'overlay'}
          css={{
            '&::-webkit-scrollbar': {
              width: '2px',
              backgroundColor: 'gray.200'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'blue.500',
              borderRadius: '0px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'gray.100'
            }
          }}
          pt={'1px'}
        >
          {ownerApps
            .filter((item: any) => collects && collects.includes(item._id))
            .map((item: any) => (
              <Flex
                key={item._id}
                mx={2}
                py={3}
                px={3}
                mb={2}
                cursor={'pointer'}
                borderRadius={'md'}
                position={'relative'}
                alignItems={'center'}
                _hover={{
                  bg: 'myGray.100',
                  '& .more': {
                    display: 'block'
                  }
                }}
                bg={item.top ? '#E6F6F6 !important' : ''}
                {...(item._id === data
                  ? {
                      backgroundColor: 'primary.50 !important',
                      color: 'primary.600'
                    }
                  : {
                      onClick: (e) => {
                        e.stopPropagation();
                        onEdit(item._id);
                      }
                    })}
              >
                <MyAvatar src={item.avatar} w={'20px'} />
                <Box flex={'1 0 0'} ml={3} className="textEllipsis" fontSize="16px">
                  {item.name}
                </Box>
                <Box className="more" display={['block', 'none']}>
                  <Menu autoSelect={false} isLazy offset={[0, 5]}>
                    <MenuButton
                      _hover={{ bg: 'white' }}
                      cursor={'pointer'}
                      borderRadius={'md'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MyIcon name={'more'} w={'14px'} p={1} />
                    </MenuButton>
                    <MenuList color={'myGray.700'} minW={`90px !important`}>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onclickCollectApp(item._id, 0);
                        }}
                      >
                        {'取消收藏'}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Flex>
            ))}
          {ownerApps.filter((item: any) => collects && collects.includes(item._id)).length ===
            0 && (
            <Flex mt={'35px'} flexDirection={'column'} alignItems={'center'}>
              <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
              <Box mt={2} color={'myGray.500'}>
                还没有收藏应用，快去收藏一个吧！
              </Box>
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );
};

export default AsidePage;
