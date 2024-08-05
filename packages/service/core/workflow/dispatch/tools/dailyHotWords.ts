import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import serveHotApi from 'dailyhot-api';
import axios from 'axios';
import { ServerType } from '@hono/node-server/.';
import { ModuleDispatchProps } from '@fastgpt/global/core/module/type';
import { DispatchNodeResultType } from '@fastgpt/global/core/module/runtime/type';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';

type DailyHotRequestProps = ModuleDispatchProps<{
  [ModuleInputKeyEnum.userChatInput]: string;
}>;
type DailyHotResponse = DispatchNodeResultType<{
  [key: string]: any;
}>;

export const dispatchDailyHotWords = async (
  props: DailyHotRequestProps
): Promise<DailyHotResponse> => {
  //微博热搜、今日头条、知乎日报、虎扑步行街、36氪、
  //哔哩哔哩热榜，知乎、IT资讯、虎嗅网、人人都是产品经理热榜百度、抖音热点豆瓣小组精选等聚合热榜
  // weibo, toutiao, zhihu-daily, hupu, 36kr, bilibili, zhihu, huxiu, douyin, douban-group
  // ithome
  const fetchNo = 5; //每个网站获取热点个数
  const url = process.env.EXTERNEL_URL;
  const fetchlist = ['weibo', 'toutiao', 'bilibili', 'zhihu', 'baidu', 'douyin'];
  //const fetchlist = ['weibo', 'toutiao'];
  const result = [];
  for (const key of fetchlist) {
    try {
      const res = await axios.get(`${url}/${key}`);
      const words = [];
      for (let i = 0; i < fetchNo; i++) {
        words.push(res.data.data[i].title);
      }
      result.push({
        title: res.data.title,
        hotwords: words
      });
    } catch (error) {
      console.log('DailyHotWords error', error);
      continue;
    }
  }
  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      textOutput: JSON.stringify(result)
    },
    data: JSON.stringify(result),
    [ModuleOutputKeyEnum.httpRawResponse]: result
  };
};
