import React, { useState, useEffect, useRef } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { serviceSideProps } from '@/web/common/utils/i18n';
import MyAppListPc from './component/MyAppListPc';
import MyAppList from './component/MyAppList';
import AsidePage from './component/AsidePage';
import HeaderPage from './component/HeaderPage';
import { useAppStore } from '@/web/core/app/store/useAppStore';
import { useUserStore } from '@/web/support/user/useUserStore';
import { getOwnerApps, getCollectById } from '@/web/support/user/api';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { AppListItemType } from '@fastgpt/global/core/app/type.d';
import CreateModal from '@/pages/app/list/component/CreateModal';

const Home = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();
  const { Loading } = useLoading();
  const { userInfo } = useUserStore();
  const { myApps, loadMyApps } = useAppStore();
  const { isPc } = useSystemStore();
  const authCode = router.query.appId as string;
  const [activeAppId, setActiveAppId] = useState(authCode || '');
  const reloadCollect = useRef(false);

  /* 加载模型 */
  const { isFetching } = useQuery(['loadApps'], () => loadMyApps(true), {
    refetchOnMount: true
  });
  const { data: ownerApps = [] as any, isLoading: isGetting } = useQuery(['getOwnerApps'], () =>
    getOwnerApps(userInfo?._id, userInfo?.team.tmbId)
  );

  const { data: collects = [] as any, isLoading: isGettingCollect } = useQuery(
    ['getCollectById', reloadCollect],
    () => getCollectById(userInfo?.team.tmbId)
  );

  const appList = myApps.filter((app: AppListItemType) => ownerApps.includes(app._id));

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  const routerJump = (id: string) => {
    setActiveAppId(id);
    if (id != 'create') {
      if (id === 'default' || !id) {
        router.push('/home');
      } else {
        router.push(`/home/chat?appId=${id}`);
      }
    }
  };
  useEffect(() => {
    loadMyApps(true);
    setActiveAppId(authCode || 'default');
  }, [router.pathname, authCode]);
  return (
    <>
      {isPc === true && (
        <>
          <Box position={'fixed'} h={'100%'} top={0} left={0} w={'260px'}>
            <AsidePage
              ownerApps={appList}
              collects={collects}
              data={activeAppId}
              onCreate={onOpenCreateModal}
              onEdit={(id) => routerJump(id)}
              onRefresh={() => {
                reloadCollect.current = !reloadCollect.current;
                loadMyApps(true);
              }}
            />
          </Box>
          <Box h={'100%'} left={'260px'} position={'fixed'}>
            <HeaderPage />
            <Box
              h={'100%'}
              left={'260px'}
              top={'60px'}
              right={0}
              position={'fixed'}
              paddingBottom={'60px'}
            >
              {router.pathname == '/home' ? (
                <MyAppListPc
                  ownerApps={appList}
                  collects={collects}
                  data={activeAppId}
                  onRefresh={() => {
                    reloadCollect.current = !reloadCollect.current;
                    loadMyApps(true);
                  }}
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
      {isOpenCreateModal && (
        <CreateModal onClose={onCloseCreateModal} onSuccess={() => loadMyApps(true)} />
      )}
      <Loading loading={isGetting || isFetching || isGettingCollect} fixed={false} />
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
