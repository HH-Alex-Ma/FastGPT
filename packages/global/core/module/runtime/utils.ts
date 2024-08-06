import { ChatCompletionRequestMessageRoleEnum } from '../../ai/constants';

export const textAdaptGptResponse = ({
  text,
  model = '',
  finish_reason = null,
  extraData = {},
  moduleName
}: {
  model?: string;
  text: string | null;
  finish_reason?: null | 'stop';
  extraData?: Object;
  moduleName?: string;
}) => {
  return JSON.stringify({
    ...extraData,
    id: '',
    object: '',
    created: 0,
    model,
    module: moduleName,
    choices: [
      {
        delta:
          text === null
            ? {}
            : { role: ChatCompletionRequestMessageRoleEnum.Assistant, content: text },
        index: 0,
        finish_reason
      }
    ]
  });
};
