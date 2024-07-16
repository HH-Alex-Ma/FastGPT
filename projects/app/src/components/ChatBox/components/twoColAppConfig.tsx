import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { twoColAppType } from '@fastgpt/global/core/app/constants';

export const twoColConfigList: twoColAppType[] = [
  {
    id: '6686694000ebf388aadb02d1',
    name: '小红书营销专家',

    left_tag: '产品推广方案',
    left_tabs: ['会话'],
    left_module: '生成推广方案',

    right_tag: '产品软广文案',
    right_tabs: ['会话'],
    right_module: '生成文案'
  },
  {
    id: '668f9581cbb03ffde913f6cf',
    name: 'AI智能搜索',

    left_tag: '问题回答',
    left_tabs: ['会话'],
    left_module: '生成总结',

    right_tag: '总结',
    right_tabs: ['大纲', '导图'],
    right_module: '生成大纲和导图'
  }
];
