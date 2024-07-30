import {
  FlowNodeTemplateTypeEnum,
  ModuleIOValueTypeEnum,
  ModuleOutputKeyEnum
} from '../../constants';
import { FlowNodeOutputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from 'core/module/type';
import { Input_Template_UserChatInput } from '../input';

export const DailyHotWords: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.dailyhotwords, // module id, unique
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowType: FlowNodeTypeEnum.dailyhotwords, // render node card
  avatar: '/imgs/module/explore.png',
  name: '网络热点汇总',
  intro: '一站式获取热门网站热点信息', // template list intro
  isTool: true, // can be connected by tool
  showStatus: true, // chatting response step status
  inputs: [Input_Template_UserChatInput],
  outputs: [
    {
      key: ModuleOutputKeyEnum.httpRawResponse,
      label: '原始响应',
      description: '以JSON格式返回的热点信息',
      valueType: ModuleIOValueTypeEnum.any,
      type: FlowNodeOutputTypeEnum.source,
      targets: []
    }
  ]

  // // plugin data
  // pluginType?: `${PluginTypeEnum}`;
  // parentId?: string;
};
