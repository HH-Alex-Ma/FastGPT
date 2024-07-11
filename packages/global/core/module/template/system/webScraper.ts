import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';

export const WebScraperModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.webScraper,
  templateType: FlowNodeTemplateTypeEnum.other,
  flowType: FlowNodeTypeEnum.webScraper,
  avatar: '/imgs/module/textEditor.svg',
  name: '网站 Scraper',
  intro: '提取网站的文字内容',
  showStatus: true,
  isTool: true,
  inputs: [
    {
      key: ModuleInputKeyEnum.url,
      label: 'URL',
      description: '目标页面的URL, 将在地址验证后进行总结',
      valueType: ModuleIOValueTypeEnum.string,
      type: FlowNodeInputTypeEnum.target,
      showTargetInApp: true,
      showTargetInPlugin: true
    }
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.text,
      label: '文字内容',
      description: '以text形式输出页面内的文字内容',
      valueType: ModuleIOValueTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source,
      targets: []
    }
  ]
};
