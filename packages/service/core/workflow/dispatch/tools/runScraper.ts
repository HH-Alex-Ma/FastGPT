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
    console.log('Scraping URL:', url);
    const response = await axios.post('http://localhost:3000/api/plugins/webScraper', { url });
    console.log('Scraped Data:', response.data.data);
    const result = response.data.data ? response.data.data.textOutput : '未能提取到内容';

    return {
      [DispatchNodeResponseKeyEnum.nodeResponse]: {
        textOutput: result
      }, // The node response detail
      //[DispatchNodeResponseKeyEnum.nodeDispatchUsages]?: ChatNodeUsageType[]; //
      //[DispatchNodeResponseKeyEnum.childrenResponses]?: DispatchNodeResultType[];
      //[DispatchNodeResponseKeyEnum.toolResponses]?: ToolRunResponseItemType;
      //[DispatchNodeResponseKeyEnum.assistantResponses]?: ChatItemValueItemType[];
      [ModuleOutputKeyEnum.answerText]: result
    };
    //response.data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
