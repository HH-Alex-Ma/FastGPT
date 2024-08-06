import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';
import type { ModuleItemType } from '@fastgpt/global/core/module/type.d';

export const getChatModelNameListByModules = (modules: ModuleItemType[]): string[] => {
  const chatModules = modules.filter((item) => item.flowType === FlowNodeTypeEnum.chatNode);
  return chatModules
    .map((item) => {
      const model = item.inputs.find((input) => input.key === 'model')?.value;
      return global.llmModels.find((item) => item.model === model)?.name || '';
    })
    .filter(Boolean);
};

export const getChatModuleNameList = (modules: ModuleItemType[]): string[] => {
  const chatModules = modules.filter((item) => item.flowType === FlowNodeTypeEnum.chatNode);
  return chatModules //return the name list of chatNode Modules whose text output is set to true
    .filter((item) =>
      item.inputs.some(
        (input) => input.key === ModuleInputKeyEnum.aiChatIsResponseText && input.value === true
      )
    )
    .map((item) => {
      return item.name;
    })
    .filter(Boolean);
};
