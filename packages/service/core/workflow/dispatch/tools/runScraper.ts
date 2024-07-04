import { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import { DispatchNodeResultType } from '@fastgpt/global/core/module/runtime/type';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import axios from 'axios';

type ScrapeRequestProps = ModuleDispatchProps<{
  [ModuleInputKeyEnum.url]: string;
}>;
type ScrapeResponseProps = DispatchNodeResultType<{
  [ModuleOutputKeyEnum.answerText]: string;
}>;

export const dispatchScraper = async (props: ScrapeRequestProps): Promise<ScrapeResponseProps> => {
  try {
    const url = props.params.url;
    const response = await axios.post('/api/plugins/webScraper/index', { url });
    console.log('Scraped Data:', response.data.data);
    return {
      [DispatchNodeResponseKeyEnum.nodeResponse]: {
        textOutput: response.data.data
      }, // The node response detail
      //[DispatchNodeResponseKeyEnum.nodeDispatchUsages]?: ChatNodeUsageType[]; //
      //[DispatchNodeResponseKeyEnum.childrenResponses]?: DispatchNodeResultType[];
      //[DispatchNodeResponseKeyEnum.toolResponses]?: ToolRunResponseItemType;
      //[DispatchNodeResponseKeyEnum.assistantResponses]?: ChatItemValueItemType[];
      [ModuleOutputKeyEnum.answerText]: response.data.data
    };
    //response.data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
