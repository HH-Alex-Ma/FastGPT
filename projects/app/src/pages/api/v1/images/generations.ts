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

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.on('close', () => {
    res.end();
  });
  res.on('error', () => {
    console.log('error: ', 'request error');
    res.end();
  });

  const {
    chatId,
    appId,
    // share chat
    shareId,
    outLinkUid,
    // team chat
    teamId: spaceTeamId,
    teamToken,
    stream = false,
    detail = false,
    messages = [],
    variables = {}
  } = req.body as Props;
  console.log(
    chatId,
    appId,
    // share chat
    shareId,
    outLinkUid,
    // team chat
    spaceTeamId,
    teamToken,
    stream,
    detail,
    messages,
    variables
  );

  // const originIp = requestIp.getClientIp(req);

  // await connectToDatabase();
  // body data check
});
