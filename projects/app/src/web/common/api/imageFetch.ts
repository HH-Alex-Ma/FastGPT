import { SseResponseEventEnum } from '@fastgpt/global/core/module/runtime/constants';
import { getErrText } from '@fastgpt/global/common/error/utils';
import type { ChatHistoryItemResType } from '@fastgpt/global/core/chat/type.d';
import type { StartChatFnProps } from '@/components/ChatBox/type.d';
import { getToken } from '@/web/support/user/auth';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import dayjs from 'dayjs';
import {
  // refer to https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web
  EventStreamContentType,
  fetchEventSource
} from '@fortaine/fetch-event-source';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { useSystemStore } from '../system/useSystemStore';

type ImageFetchProps = {
  url?: string;
  data: Record<string, any>;
  onMessage: StartChatFnProps['generatingMessage'];
  abortSignal: AbortController;
};
type ImageResponseType = {
  responseText: string;
  [DispatchNodeResponseKeyEnum.nodeResponse]: ChatHistoryItemResType[];
};
class FatalError extends Error {}

export const ImageFetch = ({
  url = '/api/v1/images/generations',
  data,
  onMessage,
  abortSignal
}: ImageFetchProps) =>
  new Promise<ImageResponseType>(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      abortSignal.abort('Time out');
    }, 60000);

    // response data
    let responseText = '';
    let errMsg: string | undefined;
    let responseData: ChatHistoryItemResType[] = [];
    let finished = false;

    const finish = () => {
      if (errMsg !== undefined) {
        return failedFinish();
      }
      return resolve({
        responseText,
        responseData
      });
    };
    const failedFinish = (err?: any) => {
      finished = true;
      reject({
        message: getErrText(err, errMsg ?? '响应过程出现异常~'),
        responseText
      });
    };

    try {
      const variables = data?.variables || {};
      variables.cTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      // send request
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: getToken()
        },
        signal: abortSignal.signal,
        body: JSON.stringify({
          ...data,
          variables
        })
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          }
        })
        .then((body) => {
          const parseJson = (() => {
            try {
              return JSON.parse(body.data);
            } catch (error) {
              return {};
            }
          })();
          const text = parseJson.choices?.[0]?.delta?.content || '';
          responseText = text;
          responseData = [];
          console.log(data);
        })
        .finally(() => {
          finished = true;
          finish();
        });
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (abortSignal.signal.aborted) {
        finished = true;

        return;
      }
      console.log(err, 'fetch error');
      failedFinish(err);
    }
  });
