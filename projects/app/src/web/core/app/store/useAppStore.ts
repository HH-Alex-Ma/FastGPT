import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getMyApps, getModelById, putAppById, replaceAppById, getAppsDetails, getCreatorName } from '@/web/core/app/api';
import { defaultApp } from '@/constants/app';
import type { AppUpdateParams } from '@fastgpt/global/core/app/api.d';
import { AppDetailType, AppListDetailType, AppListItemType } from '@fastgpt/global/core/app/type.d';

type State = {
  myApps: AppListItemType[];
  loadMyApps: (init?: boolean) => Promise<AppListItemType[]>;
  detailedApps: AppListDetailType[];
  appCreator: string;
  findAppCreator: (tmbId: string) => Promise<string>;
  loadAppsDetails: (init?: boolean) => Promise<AppListDetailType[]>;
  appDetail: AppDetailType;
  loadAppDetail: (id: string, init?: boolean) => Promise<AppDetailType>;
  updateAppDetail(appId: string, data: AppUpdateParams): Promise<void>;
  replaceAppDetail(appId: string, data: AppUpdateParams): Promise<void>;
  clearAppModules(): void;
};

export const useAppStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        myApps: [],
        async loadMyApps(init = true) {
          if (get().myApps.length > 0 && !init) return [];
          const res = await getMyApps();
          set((state) => {
            state.myApps = res;
          });
          return res;
        },
        detailedApps: [],
        async loadAppsDetails(init = true) {
          if (get().detailedApps.length > 0 && !init) return [];
          const res = await getAppsDetails();
          set((state) => {
            state.detailedApps = res;
          });
          return res;
        },

        appCreator: '',
        async findAppCreator(tmbId: string) {
          if (!tmbId) return 'User not found';
          const res = await getCreatorName(tmbId);
          set((state) => {
            state.appCreator = res;
          });
          return res;
        },
        appDetail: defaultApp,
        async loadAppDetail(id: string, init = false) {
          if (id === get().appDetail._id && !init) return get().appDetail;

          const res = await getModelById(id);
          set((state) => {
            state.appDetail = res;
          });
          return res;
        },
        async updateAppDetail(appId: string, data: AppUpdateParams) {
          await putAppById(appId, data);
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              ...data
            };
          });
        },
        async replaceAppDetail(appId: string, data: AppUpdateParams) {
          await replaceAppById(appId, { ...get().appDetail, ...data });
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              ...data
            };
          });
        },
        clearAppModules() {
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              modules: []
            };
          });
        }
      })),
      {
        name: 'appStore',
        partialize: (state) => ({})
      }
    )
  )
);
