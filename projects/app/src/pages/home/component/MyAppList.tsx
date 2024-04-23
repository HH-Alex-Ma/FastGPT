import React, { useCallback, useState } from 'react';
import { Box, Grid, Flex, IconButton, useDisclosure, Button } from '@chakra-ui/react';
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
          {t('app.My Apps')}
        </Box>
        <Button leftIcon={<AddIcon />} variant={'primaryOutline'} onClick={onOpenCreateModal}>
          {t('common.New Create')}
        </Button>
      </Flex>
      <Grid
        py={[4, 6]}
        gridTemplateColumns={['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']}
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

export default MyAppList;
