import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { twoColAppType } from '@fastgpt/global/core/app/constants';

export const twoColConfigList: twoColAppType[] = [
  {
    id: '66a9e5d7ba8268537ce2816d',
    name: ' 智能面试助手-ai',

    left_tag: '候选人评估',
    left_tabs: ['会话'],
    left_module: '候选人评估',

    right_tag: '面试问题设计',
    right_tabs: ['会话'],
    right_module: '面试问题设计'
  },
  {
    id: '66a9e121ba8268537ce27f21',
    name: 'AI智能搜索-ai',

    left_tag: '问题回答',
    left_tabs: ['会话'],
    left_module: '生成总结',

    right_tag: '总结',
    right_tabs: ['大纲', '导图'],
    right_module: '生成大纲和导图'
  }
];
