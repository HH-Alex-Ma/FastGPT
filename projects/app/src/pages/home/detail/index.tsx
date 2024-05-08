import React, { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, IconButton, useTheme } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import Tabs from '@/components/Tabs';
import SideTabs from '@/components/SideTabs';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import Loading from '@fastgpt/web/components/common/MyLoading';

import SimpleEdit from '@/pages/app/detail/components/SimpleEdit';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useAppStore } from '@/web/core/app/store/useAppStore';
import Head from 'next/head';

const FlowEdit = dynamic(() => import('@/pages/app/detail/components/FlowEdit'), {
  loading: () => <Loading />
});
const OutLink = dynamic(() => import('@/pages/app/detail/components/OutLink'), {});
const Logs = dynamic(() => import('@/pages/app/detail/components/Logs'), {});

enum TabEnum {
  'simpleEdit' = 'simpleEdit',
  'logs' = 'logs',
  'startChat' = 'startChat'
}

const AppDetail = ({ currentTab }: { currentTab: `${TabEnum}` }) => {
  const router = useRouter();
  const theme = useTheme();
  const { toast } = useToast();
  const { appId } = router.query as { appId: string };
  const { appDetail, loadAppDetail, clearAppModules } = useAppStore();
  const { feConfigs } = useSystemStore();

  const setCurrentTab = useCallback(
    (tab: `${TabEnum}`) => {
      router.replace({
        query: {
          appId,
          currentTab: tab
        }
      });
    },
    [appId, router]
  );

  const tabList = useMemo(
    () => [
      { label: '简易配置', id: TabEnum.simpleEdit, icon: 'common/overviewLight' },
      { label: '对话日志', id: TabEnum.logs, icon: 'core/app/logsLight' },
      { label: '立即对话', id: TabEnum.startChat, icon: 'core/chat/chatLight' }
    ],
    []
  );

  useEffect(() => {
    const listen =
      process.env.NODE_ENV === 'production'
        ? (e: any) => {
            e.preventDefault();
            e.returnValue = '内容已修改，确认离开页面吗？';
          }
        : () => {};
    window.addEventListener('beforeunload', listen);

    return () => {
      window.removeEventListener('beforeunload', listen);
      clearAppModules();
    };
  }, []);

  useQuery([appId], () => loadAppDetail(appId, true), {
    onError(err: any) {
      toast({
        title: err?.message || '获取应用异常',
        status: 'error'
      });
      router.push('/home');
    },
    onSettled() {
      router.prefetch(`/home/chat?appId=${appId}`);
    }
  });

  return (
    <>
      <Head>
        <title>{appDetail.name}</title>
      </Head>
      <PageContainer p={[0, '0px']} insertProps={{ borderRadius: [0, '0px'], borderWidth: [0] }}>
        <Flex flexDirection={['column', 'row']} h={'100%'}>
          {/* pc tab */}
          <Box
            display={['none', 'flex']}
            flexDirection={'column'}
            p={4}
            w={'180px'}
            borderRight={theme.borders.base}
          >
            <Flex mb={4} alignItems={'center'}>
              <Avatar src={appDetail.avatar} w={'34px'} borderRadius={'md'} />
              <Box ml={2} fontWeight={'bold'}>
                {appDetail.name}
              </Box>
            </Flex>
            <SideTabs
              flex={1}
              mx={'auto'}
              mt={2}
              w={'100%'}
              list={tabList}
              activeId={currentTab}
              onChange={(e: any) => {
                if (e === 'startChat') {
                  router.push(`/home/chat?appId=${appId}`);
                } else {
                  setCurrentTab(e);
                }
              }}
            />
          </Box>
          <Box flex={'1 0 0'} h={[0, '100%']} overflow={['overlay', '']}>
            {currentTab === TabEnum.simpleEdit && (
              <SimpleEdit appId={appId} showGlobalVariables={false} />
            )}
            {currentTab === TabEnum.logs && <Logs appId={appId} />}
          </Box>
        </Flex>
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(context: any) {
  const currentTab = context?.query?.currentTab || TabEnum.simpleEdit;

  return {
    props: { currentTab, ...(await serviceSideProps(context)) }
  };
}

export default AppDetail;
