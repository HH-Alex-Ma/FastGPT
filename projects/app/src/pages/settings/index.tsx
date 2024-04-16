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

const UserListPage = dynamic(() => import('./components/UserList'));
const RoleListPage = dynamic(() => import('./components/RoleList'));

enum TabEnum {
  'info' = 'info',
  'role' = 'role'
}

const Settings = ({ currentTab }: { currentTab: `${TabEnum}` }) => {
  const { t } = useTranslation();
  const { feConfigs, isPc, systemVersion } = useSystemStore();

  const tabList = [
    {
      icon: '',
      label: '用户管理',
      id: TabEnum.info
    },
    {
      icon: '',
      label: '角色管理',
      id: TabEnum.role
    }
  ];

  const router = useRouter();
  const theme = useTheme();

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
              <Flex alignItems={'center'}>
                <Box w={'8px'} h={'8px'} borderRadius={'50%'} bg={'#67c13b'} />
                <Box fontSize={'md'} ml={2}>
                  V{systemVersion}
                </Box>
              </Flex>
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
            {currentTab === TabEnum.info && <UserListPage />}
            {currentTab === TabEnum.role && <RoleListPage />}
          </Box>
        </Flex>
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      currentTab: content?.query?.currentTab || TabEnum.info,
      ...(await serviceSideProps(content))
    }
  };
}

export default Settings;
