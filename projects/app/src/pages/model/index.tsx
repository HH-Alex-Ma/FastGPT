import React, { useCallback } from 'react';
import { Box, Flex, useTheme } from '@chakra-ui/react';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/PageContainer';
import SideTabs from '@/components/SideTabs';
import Tabs from '@/components/Tabs';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';
import Script from 'next/script';

const ModelList = dynamic(() => import('./components/ModelList'));
const ChannelManger = dynamic(() => import('./components/ChannelManger'));
const TokenList = dynamic(() => import('./components/TokenList'));
const LogsList = dynamic(() => import('./components/LogsList'));

enum TabEnum {
  'models' = 'models',
  'channels' = 'channels',
  'tokens' = 'tokens',
  'logs' = 'logs'
}

const Model = ({ currentTab }: { currentTab: `${TabEnum}` }) => {
  const { t } = useTranslation();
  const tabList = [
    {
      icon: 'modelBase',
      label: t('modelCenter.modelBase'),
      id: TabEnum.models
    },
    {
      icon: 'channel',
      label: t('modelCenter.channel.channelManager'),
      id: TabEnum.channels
    },
    {
      icon: 'support/outlink/apikeyLight',
      label: t('modelCenter.token.tokenManager'),
      id: TabEnum.tokens
    },
    {
      icon: 'core/app/logsLight',
      label: t('modelCenter.log.modelLogs'),
      id: TabEnum.logs
    }
  ];
  const router = useRouter();
  const theme = useTheme();
  const { isPc } = useSystemStore();

  const setCurrentTab = useCallback(
    (tab: string) => {
      router.replace({
        query: {
          currentTab: tab
        }
      });
    },
    [router]
  );

  return (
    <>
      <Script src="/js/qrcode.min.js" strategy="lazyOnload"></Script>
      <PageContainer>
        <Flex flexDirection={['column', 'row']} h={'100%'} pt={[4, 0]}>
          {isPc ? (
            <Flex
              flexDirection={'column'}
              p={4}
              h={'100%'}
              flex={'0 0 200px'}
              borderRight={theme.borders.base}
            >
              <SideTabs
                flex={1}
                mx={'auto'}
                mt={2}
                w={'100%'}
                list={tabList}
                activeId={currentTab}
                onChange={setCurrentTab}
              />
            </Flex>
          ) : (
            <Box mb={3}>
              <Tabs
                m={'auto'}
                size={isPc ? 'md' : 'sm'}
                list={tabList.map((item) => ({
                  id: item.id,
                  label: item.label
                }))}
                activeId={currentTab}
                onChange={setCurrentTab}
              />
            </Box>
          )}

          <Box flex={'1 0 0'} h={'100%'} pb={[4, 0]}>
            {currentTab === TabEnum.models && <ModelList />}
            {currentTab === TabEnum.channels && <ChannelManger />}
            {currentTab === TabEnum.tokens && <TokenList />}
            {currentTab === TabEnum.logs && <LogsList />}
          </Box>
        </Flex>
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      currentTab: content?.query?.currentTab || TabEnum.logs,
      ...(await serviceSideProps(content))
    }
  };
}

export default Model;
