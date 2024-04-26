import type { NextApiRequest, NextApiResponse } from 'next';
import { authApp } from '@fastgpt/service/support/permission/auth/app';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { sseErrRes, jsonRes } from '@fastgpt/service/common/response';
import { addLog } from '@fastgpt/service/common/system/log';
import { withNextCors } from '@fastgpt/service/common/middle/cors';
import { ChatRoleEnum, ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { SseResponseEventEnum } from '@fastgpt/global/core/module/runtime/constants';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';
import type { ChatCompletionCreateParams } from '@fastgpt/global/core/ai/type.d';
import type { ChatCompletionMessageParam } from '@fastgpt/global/core/ai/type.d';
import { textAdaptGptResponse } from '@fastgpt/global/core/module/runtime/utils';
import { GPTMessages2Chats, chatValue2RuntimePrompt } from '@fastgpt/global/core/chat/adapt';
import { getChatItems } from '@fastgpt/service/core/chat/controller';
import { saveChat } from '@/service/utils/chat/saveChat';
import { responseWrite } from '@fastgpt/service/common/response';
import { pushChatUsage } from '@/service/support/wallet/usage/push';
import { authOutLinkChatStart } from '@/service/support/permission/auth/outLink';
import { pushResult2Remote, addOutLinkUsage } from '@fastgpt/service/support/outLink/tools';
import requestIp from 'request-ip';
import { getUsageSourceByAuthType } from '@fastgpt/global/support/wallet/usage/tools';
import { authTeamSpaceToken } from '@/service/support/permission/auth/team';
import { filterPublicNodeResponseData } from '@fastgpt/global/core/chat/utils';
import { updateApiKeyUsage } from '@fastgpt/service/support/openapi/tools';
import { connectToDatabase } from '@/service/mongo';
import { getUserChatInfoAndAuthTeamPoints } from '@/service/support/permission/auth/team';
import { AuthUserTypeEnum } from '@fastgpt/global/support/permission/constant';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { UserModelSchema } from '@fastgpt/global/support/user/type';
import { AppSchema } from '@fastgpt/global/core/app/type';
import { AuthOutLinkChatProps } from '@fastgpt/global/support/outLink/api';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { ChatErrEnum } from '@fastgpt/global/common/error/code/chat';
import { OutLinkChatAuthProps } from '@fastgpt/global/support/permission/chat';
import { setEntryEntries } from '@fastgpt/service/core/workflow/dispatch/utils';
import { UserChatItemType } from '@fastgpt/global/core/chat/type';
import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/module/runtime/constants';
import { getAIApi } from '@fastgpt/service/core/ai/config';

type FastGptWebChatProps = {
  chatId?: string; // undefined: nonuse history, '': new chat, 'xxxxx': use history
  appId?: string;
};

export type Props = ChatCompletionCreateParams &
  FastGptWebChatProps &
  OutLinkChatAuthProps & {
    messages: ChatCompletionMessageParam[];
    stream?: boolean;
    detail?: boolean;
    variables: Record<string, any>;
  };
export type ChatResponseType = {
  newChatId: string;
  quoteLen?: number;
};

type AuthResponseType = {
  teamId: string;
  tmbId: string;
  user: UserModelSchema;
  app: AppSchema;
  responseDetail?: boolean;
  authType: `${AuthUserTypeEnum}`;
  apikey?: string;
  canWrite: boolean;
  outLinkUserId?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    chatId,
    appId,
    // share chat
    shareId,
    outLinkUid,
    // team chat
    teamId: spaceTeamId,
    teamToken,
    detail = false,
    messages = [],
    variables = {}
  } = req.body as Props;
  console.log('我通了');
  let maxRunTimes = 200;
  try {
    const originIp = requestIp.getClientIp(req);
    await connectToDatabase();
    // body data check
    if (!messages) {
      throw new Error('Prams Error');
    }
    if (!Array.isArray(messages)) {
      throw new Error('messages is not array');
    }
    if (messages.length === 0) {
      throw new Error('messages is empty');
    }

    const chatMessages = GPTMessages2Chats(messages);
    if (chatMessages[chatMessages.length - 1].obj !== ChatRoleEnum.Human) {
      chatMessages.pop();
    }

    // user question
    const question = chatMessages.pop() as UserChatItemType;
    if (!question) {
      throw new Error('Question is empty');
    }

    const { text, files } = chatValue2RuntimePrompt(question.value);

    const { teamId, tmbId, user, app, responseDetail, authType, apikey, canWrite, outLinkUserId } =
      await (async () => {
        // share chat
        if (shareId && outLinkUid) {
          return authShareChat({
            shareId,
            outLinkUid,
            chatId,
            ip: originIp,
            question: text
          });
        }
        // team space chat
        if (spaceTeamId && appId && teamToken) {
          return authTeamSpaceChat({
            teamId: spaceTeamId,
            teamToken,
            appId,
            chatId
          });
        }

        /* parse req: api or token */
        return authHeaderRequest({
          req,
          appId,
          chatId,
          detail
        });
      })();
    // get and concat history
    const { history } = await getChatItems({
      appId: app._id,
      chatId,
      limit: 30,
      field: `dataId obj value`
    });
    const concatHistories = history.concat(chatMessages);
    const responseChatItemId: string | undefined = messages[messages.length - 1].dataId;
    let chatModule = setEntryEntries(app.modules).filter(
      (item: any) => item.moduleId == 'chatModule'
    );
    console.log('chatModule', chatModule);
    const model = chatModule[0].inputs.filter((item: any) => item.key === 'model');
    console.log('model', model);

    let runningTime = Date.now();

    const ai = getAIApi();
    const result = await ai.images.generate({
      prompt: text,
      model: model[0].value,
      size: '1024x1024'
    });
    console.log('result', result.data[0].revised_prompt);
    console.log('result', result.data[0].url);
    const imageUrl = result.data[0].url;
    const imageContent = result.data[0].revised_prompt;

    /* Inject data into module input */

    // save chat
    if (chatId) {
      let assistantResponses: any[] = [
        {
          type: 'file',
          file: {
            type: 'image',
            name: '',
            // url: 'http://localhost:3000/api/system/img/662b01bf99ae9475d0f127c8'
            url: imageUrl
          }
        },
        {
          type: 'text',
          text: {
            content: imageContent
          }
        }
      ];
      const time = Date.now();
      let flowResponses: any[] = [
        {
          moduleName: 'AI 对话',
          moduleType: 'chatNode',
          totalPoints: 0,
          model: model[0].value,
          tokens: 2000,
          query: text,
          maxToken: 2000,
          historyPreview: [],
          contextTotalLen: 0,
          runningTime: ((time - runningTime) / 1000).toFixed(2)
        }
      ];
      const isOwnerUse = !shareId && !spaceTeamId && String(tmbId) === String(app.tmbId);
      await saveChat({
        chatId,
        appId: app._id,
        teamId,
        tmbId: tmbId,
        variables,
        updateUseTime: isOwnerUse, // owner update use time
        shareId,
        outLinkUid: outLinkUserId,
        source: (() => {
          if (shareId) {
            return ChatSourceEnum.share;
          }
          if (authType === 'apikey') {
            return ChatSourceEnum.api;
          }
          if (spaceTeamId) {
            return ChatSourceEnum.team;
          }
          return ChatSourceEnum.online;
        })(),
        content: [
          question,
          {
            dataId: responseChatItemId,
            obj: ChatRoleEnum.AI,
            value: assistantResponses,
            [DispatchNodeResponseKeyEnum.nodeResponse]: flowResponses
          }
        ],
        metadata: {
          originIp
        }
      });
    }

    return jsonRes(res, {
      data: {
        id: chatId || '',
        model: '',
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 1 },
        choices: [
          {
            delta: { role: 'assistant', content: '你好啊' },
            finish_reason: 'stop',
            index: 0
          }
        ]
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

const authShareChat = async ({
  chatId,
  ...data
}: AuthOutLinkChatProps & {
  shareId: string;
  chatId?: string;
}): Promise<AuthResponseType> => {
  const { teamId, tmbId, user, appId, authType, responseDetail, uid } =
    await authOutLinkChatStart(data);
  const app = await MongoApp.findById(appId).lean();

  if (!app) {
    return Promise.reject('app is empty');
  }

  // get chat
  const chat = await MongoChat.findOne({ appId, chatId }).lean();
  if (chat && (chat.shareId !== data.shareId || chat.outLinkUid !== uid)) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  return {
    teamId,
    tmbId,
    user,
    app,
    responseDetail,
    apikey: '',
    authType,
    canWrite: false,
    outLinkUserId: uid
  };
};
const authTeamSpaceChat = async ({
  appId,
  teamId,
  teamToken,
  chatId
}: {
  appId: string;
  teamId: string;
  teamToken: string;
  chatId?: string;
}): Promise<AuthResponseType> => {
  const { uid } = await authTeamSpaceToken({
    teamId,
    teamToken
  });

  const app = await MongoApp.findById(appId).lean();
  if (!app) {
    return Promise.reject('app is empty');
  }

  const [chat, { user }] = await Promise.all([
    MongoChat.findOne({ appId, chatId }).lean(),
    getUserChatInfoAndAuthTeamPoints(app.tmbId)
  ]);

  if (chat && (String(chat.teamId) !== teamId || chat.outLinkUid !== uid)) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  return {
    teamId,
    tmbId: app.tmbId,
    user,
    app,
    responseDetail: true,
    authType: AuthUserTypeEnum.outLink,
    apikey: '',
    canWrite: false,
    outLinkUserId: uid
  };
};
const authHeaderRequest = async ({
  req,
  appId,
  chatId,
  detail
}: {
  req: NextApiRequest;
  appId?: string;
  chatId?: string;
  detail?: boolean;
}): Promise<AuthResponseType> => {
  const {
    appId: apiKeyAppId,
    teamId,
    tmbId,
    authType,
    apikey,
    canWrite: apiKeyCanWrite
  } = await authCert({
    req,
    authToken: true,
    authApiKey: true
  });

  const { app, canWrite } = await (async () => {
    if (authType === AuthUserTypeEnum.apikey) {
      if (!apiKeyAppId) {
        return Promise.reject(
          'Key is error. You need to use the app key rather than the account key.'
        );
      }
      const app = await MongoApp.findById(apiKeyAppId);

      if (!app) {
        return Promise.reject('app is empty');
      }

      appId = String(app._id);

      return {
        app,
        canWrite: apiKeyCanWrite
      };
    } else {
      // token auth
      if (!appId) {
        return Promise.reject('appId is empty');
      }
      const { app, canWrite } = await authApp({
        req,
        authToken: true,
        appId,
        per: 'r'
      });

      return {
        app,

        canWrite: canWrite
      };
    }
  })();

  const [{ user }, chat] = await Promise.all([
    getUserChatInfoAndAuthTeamPoints(tmbId),
    MongoChat.findOne({ appId, chatId }).lean()
  ]);

  if (chat && (String(chat.teamId) !== teamId || String(chat.tmbId) !== tmbId)) {
    return Promise.reject(ChatErrEnum.unAuthChat);
  }

  return {
    teamId,
    tmbId,
    user,
    app,
    responseDetail: detail,
    apikey,
    authType,
    canWrite
  };
};
