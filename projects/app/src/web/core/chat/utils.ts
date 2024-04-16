import { FlowNodeTypeEnum } from '@fastgpt/global/core/module/node/constant';
import { ModuleItemType } from '@fastgpt/global/core/module/type.d';
import { useSystemStore } from '@/web/common/system/useSystemStore';
// TODO: 检查给定的模型数组中是否有任何模型支持通过聊天选择文件(图片和文件)
export function checkChatSupportSelectFileByChatModels(models: string[] = []) {
  const llmModelList = useSystemStore.getState().llmModelList;

  for (const model of models) {
    const modelData = llmModelList.find((item) => item.model === model || item.name === model);
    if (modelData?.vision) {
      return true;
    }
  }
  return false;
}

export function checkChatSupportSelectFileByModules(modules: ModuleItemType[] = []) {
  const chatModules = modules.filter(
    (item) =>
      item.flowType === FlowNodeTypeEnum.chatNode || item.flowType === FlowNodeTypeEnum.tools
  );
  const models: string[] = chatModules.map(
    (item) => item.inputs.find((item) => item.key === 'model')?.value || ''
  );
  return checkChatSupportSelectFileByChatModels(models);
}
