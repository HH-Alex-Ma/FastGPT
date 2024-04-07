export const renderNumber = (num: number) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(2) + 'k';
  } else {
    return (num / 1000).toFixed(2) + 'K';
  }
};

export const renderBalance = (type: number, balance: number) => {
  switch (type) {
    case 1: // OpenAI
      return `$${balance.toFixed(2)}`;
    case 4: // CloseAI
      return `¥${balance.toFixed(2)}`;
    case 8: // 自定义
      return `$${balance.toFixed(2)}`;
    case 5: // OpenAI-SB
      return `¥${(balance / 10000).toFixed(2)}`;
    case 10: // AI Proxy
      return `${renderNumber(balance)}`;
    case 12: // API2GPT
      return `¥${balance.toFixed(2)}`;
    case 13: // AIGC2D
      return `${renderNumber(balance)}`;
    default:
      return `不支持`;
  }
};

let type2label: any = undefined;
export const CHANNEL_OPTIONS = [
  { key: 1, text: 'OpenAI', value: 1, color: 'green' },
  { key: 14, text: 'Anthropic Claude', value: 14, color: 'black' },
  { key: 3, text: 'Azure OpenAI', value: 3, color: 'olive' },
  { key: 11, text: 'Google PaLM2', value: 11, color: 'orange' },
  { key: 15, text: '百度文心千帆', value: 15, color: 'blue' },
  { key: 17, text: '阿里通义千问', value: 17, color: 'orange' },
  { key: 18, text: '讯飞星火认知', value: 18, color: 'blue' },
  { key: 16, text: '智谱 ChatGLM', value: 16, color: 'violet' },
  { key: 19, text: '360 智脑', value: 19, color: 'blue' },
  { key: 23, text: '腾讯混元', value: 23, color: 'teal' },
  { key: 8, text: '自定义渠道', value: 8, color: 'pink' },
  { key: 22, text: '知识库:FastGPT', value: 22, color: 'blue' },
  { key: 21, text: '知识库:AI Proxy', value: 21, color: 'purple' },
  { key: 20, text: '代理:OpenRouter', value: 20, color: 'black' },
  { key: 2, text: '代理:API2D', value: 2, color: 'blue' },
  { key: 5, text: '代理:OpenAI-SB', value: 5, color: 'brown' },
  { key: 7, text: '代理:OhMyGPT', value: 7, color: 'purple' },
  { key: 10, text: '代理:AI Proxy', value: 10, color: 'purple' },
  { key: 4, text: '代理:CloseAI', value: 4, color: 'teal' },
  { key: 6, text: '代理:OpenAI Max', value: 6, color: 'violet' },
  { key: 9, text: '代理:AI.LS', value: 9, color: 'yellow' },
  { key: 12, text: '代理:API2GPT', value: 12, color: 'blue' },
  { key: 13, text: '代理:AIGC2D', value: 13, color: 'purple' }
];
export const renderType = (type: number) => {
  if (!type2label) {
    type2label = new Map();
    for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
      type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
    }
    type2label[0] = { value: 0, text: '未知类型', color: 'grey' };
  }
  // return (
  //   `<Tag size="md" key="md" variant="subtle" color="#69758269">
  //     <TagLabel color={type2label[type]?.color}> {type2label[type]?.text}</TagLabel>
  //   </Tag>`
  // );
  return type2label[type];
};

export const defaultConfig = {
  inputLabel: {
    name: '渠道名称',
    type: '渠道类型',
    base_url: '渠道API地址',
    key: '密钥',
    other: '其他参数',
    models: '模型',
    model_mapping: '模型映射关系',
    groups: '用户组'
  },
  prompt: {
    type: '请选择渠道类型',
    name: '请为渠道命名',
    base_url: '可空，请输入中转API地址，例如通过cloudflare中转',
    key: '请输入渠道对应的鉴权密钥',
    other: '',
    models: '请选择该渠道所支持的模型',
    model_mapping:
      '请输入要修改的模型映射关系，格式为：api请求模型ID:实际转发给渠道的模型ID，使用JSON数组表示，例如：{"gpt-3.5": "gpt-35"}',
    groups: '请选择该渠道所支持的用户组'
  },
  modelGroup: 'openai'
};

export const typeConfig = {
  3: {
    inputLabel: {
      base_url: 'AZURE_OPENAI_ENDPOINT',
      other: '默认 API 版本'
    },
    prompt: {
      base_url: '请填写AZURE_OPENAI_ENDPOINT',
      other: '请输入默认API版本，例如：2023-06-01-preview'
    }
  },
  11: {
    input: {
      models: ['PaLM-2']
    },
    modelGroup: 'google palm'
  },
  14: {
    input: {
      models: ['claude-instant-1', 'claude-2', 'claude-2.0', 'claude-2.1']
    },
    modelGroup: 'anthropic'
  },
  15: {
    input: {
      models: ['ERNIE-Bot', 'ERNIE-Bot-turbo', 'ERNIE-Bot-4', 'Embedding-V1']
    },
    prompt: {
      key: '按照如下格式输入：APIKey|SecretKey'
    },
    modelGroup: 'baidu'
  },
  16: {
    input: {
      models: ['chatglm_turbo', 'chatglm_pro', 'chatglm_std', 'chatglm_lite']
    },
    modelGroup: 'zhipu'
  },
  17: {
    inputLabel: {
      other: '插件参数'
    },
    input: {
      models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext', 'text-embedding-v1']
    },
    prompt: {
      other: '请输入插件参数，即 X-DashScope-Plugin 请求头的取值'
    },
    modelGroup: 'ali'
  },
  18: {
    inputLabel: {
      other: '版本号'
    },
    input: {
      models: ['SparkDesk']
    },
    prompt: {
      key: '按照如下格式输入：APPID|APISecret|APIKey',
      other: '请输入版本号，例如：v3.1'
    },
    modelGroup: 'xunfei'
  },
  19: {
    input: {
      models: [
        '360GPT_S2_V9',
        'embedding-bert-512-v1',
        'embedding_s1_v1',
        'semantic_similarity_s1_v1'
      ]
    },
    modelGroup: '360'
  },
  22: {
    prompt: {
      key: '按照如下格式输入：APIKey-AppId，例如：fastgpt-0sp2gtvfdgyi4k30jwlgwf1i-64f335d84283f05518e9e041'
    }
  },
  23: {
    input: {
      models: ['hunyuan']
    },
    prompt: {
      key: '按照如下格式输入：AppId|SecretId|SecretKey'
    },
    modelGroup: 'tencent'
  },
  24: {
    inputLabel: {
      other: '版本号'
    },
    input: {
      models: ['gemini-pro']
    },
    prompt: {
      other: '请输入版本号，例如：v1'
    },
    modelGroup: 'google gemini'
  }
};
