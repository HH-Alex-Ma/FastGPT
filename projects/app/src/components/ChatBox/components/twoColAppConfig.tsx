import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { twoColAppType } from '@fastgpt/global/core/app/constants';

export const twoColConfigList: twoColAppType[] = [
  {
    id: '66962371a1e76a2b79b2b86e',
    name: '小红书营销专家',

    left_tag: '产品推广方案',
    left_tabs: ['会话'],
    left_module: '生成推广方案',

    right_tag: '产品软广文案',
    right_tabs: ['会话'],
    right_module: '生成文案'
  },
  {
    id: '66962497a1e76a2b79b2b929',
    name: 'AI智能搜索',

    left_tag: '问题回答',
    left_tabs: ['会话'],
    left_module: '生成总结',

    right_tag: '总结',
    right_tabs: ['大纲', '导图'],
    right_module: '生成大纲和导图'
  }
];
