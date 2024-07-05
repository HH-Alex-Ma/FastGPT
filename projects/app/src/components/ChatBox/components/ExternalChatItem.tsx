import {
  Box,
  BoxProps,
  Card,
  Flex,
  useTheme,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import ChatController, { ExternalChatItemProps, type ChatControllerProps } from './ChatController';
import ChatAvatar from './ChatAvatar';
import { MessageCardStyle } from '../constants';
import { formatChatValue2InputType } from '../utils';
import Markdown, { CodeClassName } from '@/components/Markdown';
import styles from '../index.module.scss';
import MyIcon from '@fastgpt/web/components/common/Icon';
import {
  ChatItemValueTypeEnum,
  ChatRoleEnum,
  ChatStatusEnum
} from '@fastgpt/global/core/chat/constants';
import FilesBlock from './FilesBox';
import { useChatProviderStore } from '../Provider';
import { getExternalData } from '@/pages/api/data/api';

const colorMap = {
  [ChatStatusEnum.loading]: {
    bg: 'myGray.100',
    color: 'myGray.600'
  },
  [ChatStatusEnum.running]: {
    bg: 'green.50',
    color: 'green.700'
  },
  [ChatStatusEnum.finish]: {
    bg: 'green.50',
    color: 'green.700'
  }
};

// let mockJson = {
//   status: 200,
//   message: '',
//   data: [
//     {
//       invention_title: '一种同轴磁性齿轮的定子铁心的形状优化方法',
//       assignees: '中国航空工业集团公司金城南京机电液压工程研究中心',
//       relevancy: '98%'
//     },
//     {
//       invention_title:
//         'Connection disc structure parameter optimization method and device, equipment and medium',
//       assignees: '盛瑞传动股份有限公司',
//       relevancy: '95%'
//     },
//     {
//       invention_title: 'Design method for laminated coupling of reciprocating compressor',
//       assignees: '西南石油大学',
//       relevancy: '94%'
//     },
//     {
//       invention_title:
//         'Method and device for optimizing structure of elastic part, storage medium and electronic equipment',
//       assignees: '海信(山东)冰箱有限公司',
//       relevancy: '93%'
//     },
//     {
//       invention_title: '一种复合材料/金属混合齿轮结构设计及制备方法',
//       assignees: '北京航空航天大学',
//       relevancy: '93%'
//     },
//     {
//       invention_title: '一种连接盘结构参数优化方法、装置、设备及介质',
//       assignees: '盛瑞传动股份有限公司',
//       relevancy: '93%'
//     },
//     {
//       invention_title: 'Electric wheel rotor shell lightweight design method',
//       assignees: '上海理工大学',
//       relevancy: '93%'
//     },
//     {
//       invention_title: '一种矿用自卸车轮毂驱动单元概念设计方法',
//       assignees: '徐州徐工矿业机械有限公司',
//       relevancy: '92%'
//     },
//     {
//       invention_title:
//         'Multi-objective optimization design method for gear stress release hole based on interval analysis',
//       assignees: '广州大学',
//       relevancy: '92%'
//     },
//     {
//       invention_title:
//         'Design method of elliptical pull rod holes uniformly distributed in circumferential direction of wheel disc of gas turbine',
//       assignees: '西安交通大学',
//       relevancy: '92%'
//     }
//   ]
// };

// let externalData = [];

// for (let item of mockJson.data) {
//   externalData.push({
//     invention_title: item.invention_title,
//     assignees: item.assignees,
//     relevancy: item.relevancy
//   });
// }

interface ExternalDataItem {
  invention_title: string;
  assignees: string;
  relevancy: any;
}

const ChatItem = ({
  type,
  avatar,
  statusBoxData,
  children,
  isLastChild,
  questionGuides = [],
  text,
  ...chatControllerProps
}: {
  type: ChatRoleEnum.Human | ChatRoleEnum.AI;
  avatar?: string;
  statusBoxData?: {
    status: `${ChatStatusEnum}`;
    name: string;
  };
  text: string;
  questionGuides?: string[];
  children?: React.ReactNode;
} & ExternalChatItemProps) => {
  const styleMap: BoxProps =
    type === ChatRoleEnum.Human
      ? {
          order: 0,
          borderRadius: '8px 0 8px 8px',
          justifyContent: 'flex-end',
          textAlign: 'right',
          bg: 'primary.100'
        }
      : {
          order: 1,
          borderRadius: '0 8px 8px 8px',
          justifyContent: 'flex-start',
          textAlign: 'left',
          bg: 'myGray.50'
        };

  const { isChatting } = useChatProviderStore();
  const { chat } = chatControllerProps;
  // 智慧芽接口
  const [externalData, setExternalData] = useState<ExternalDataItem[] | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      console.log('getExternalData text', text);
      const data = await getExternalData(text);
      setExternalData(data);
      console.log('data', data);
    };

    fetchData();
  }, [text]);

  const ExternalContentCard = useMemo(() => {
    if (type === 'Human') {
      const { text, files = [] } = formatChatValue2InputType(chat.value);

      return (
        <>
          {files.length > 0 && <FilesBlock files={files} />}
          <Markdown source={text} />
        </>
      );
    }
    /* AI */
    return (
      <Flex flexDirection={'column'} gap={2}>
        {externalData &&
          externalData.map((value, index) => (
            <div key={index}>
              <div>
                <a href={value.invention_title} target="_blank" rel="noopener noreferrer">
                  专利标题: {value.invention_title}
                </a>
              </div>
              <div>申请人: {value.assignees}</div>
              <div>相关度: {value.relevancy}</div>
            </div>
          ))}
      </Flex>
    );
  }, [chat.dataId, chat.value, isChatting, isLastChild, questionGuides, type, externalData]);

  const ContentCard = useMemo(() => {
    if (type === 'Human') {
      const { text, files = [] } = formatChatValue2InputType(chat.value);

      return (
        <>
          {files.length > 0 && <FilesBlock files={files} />}
          <Markdown source={text} />
        </>
      );
    }

    /* AI */
    return (
      <Flex flexDirection={'column'} key={chat.dataId} gap={2}>
        {chat.value.map((value, i) => {
          const key = `${chat.dataId}-ai-${i}`;

          if (value.text) {
            let source = (value.text?.content || '').trim();

            if (!source && chat.value.length > 1) return null;

            if (
              isLastChild &&
              !isChatting &&
              questionGuides.length > 0 &&
              i === chat.value.length - 1
            ) {
              source = `${source}
\`\`\`${CodeClassName.questionGuide}
${JSON.stringify(questionGuides)}`;
            }

            return (
              <Markdown
                key={key}
                source={source}
                showAnimation={isLastChild && isChatting && i === chat.value.length - 1}
              />
            );
          }
          // tool
          if (value.type === ChatItemValueTypeEnum.tool && value.tools) {
            return (
              <Box key={key}>
                {value.tools.map((tool) => {
                  const toolParams = (() => {
                    try {
                      return JSON.stringify(JSON.parse(tool.params), null, 2);
                    } catch (error) {
                      return tool.params;
                    }
                  })();
                  const toolResponse = (() => {
                    try {
                      return JSON.stringify(JSON.parse(tool.response), null, 2);
                    } catch (error) {
                      return tool.response;
                    }
                  })();

                  return (
                    <Box key={tool.id}>
                      <Accordion allowToggle>
                        <AccordionItem borderTop={'none'} borderBottom={'none'}>
                          <AccordionButton
                            w={'auto'}
                            bg={'white'}
                            borderRadius={'md'}
                            borderWidth={'1px'}
                            borderColor={'myGray.200'}
                            boxShadow={'1'}
                            _hover={{
                              bg: 'auto',
                              color: 'primary.600'
                            }}
                          >
                            <Image src={tool.toolAvatar} alt={''} w={'14px'} mr={2} />
                            <Box mr={1}>{tool.toolName}</Box>
                            {isChatting && !tool.response && (
                              <MyIcon name={'common/loading'} w={'14px'} />
                            )}
                            <AccordionIcon color={'myGray.600'} ml={5} />
                          </AccordionButton>
                          <AccordionPanel
                            py={0}
                            px={0}
                            mt={0}
                            borderRadius={'md'}
                            overflow={'hidden'}
                            maxH={'500px'}
                            overflowY={'auto'}
                          >
                            {toolParams && toolParams !== '{}' && (
                              <Markdown
                                source={`~~~json#Input
${toolParams}`}
                              />
                            )}
                            {toolResponse && (
                              <Markdown
                                source={`~~~json#Response
${toolResponse}`}
                              />
                            )}
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Box>
                  );
                })}
              </Box>
            );
          }
          return null;
        })}
      </Flex>
    );
  }, [chat.dataId, chat.value, isChatting, isLastChild, questionGuides, type]);

  const chatStatusMap = useMemo(() => {
    if (!statusBoxData?.status) return;
    return colorMap[statusBoxData.status];
  }, [statusBoxData?.status]);

  return (
    <>
      {/* control icon */}
      <Flex w={'100%'} alignItems={'center'} gap={1} justifyContent={styleMap.justifyContent}>
        {/* {isChatting && type === ChatRoleEnum.AI && isLastChild ? null : (
          <Box order={styleMap.order} ml={styleMap.ml}>
            <ChatController {...chatControllerProps} isLastChild={isLastChild} />
          </Box>
        )} */}
        {/* <ChatAvatar src={avatar} type={type} /> */}

        {!!chatStatusMap && statusBoxData && isLastChild && (
          <Flex alignItems={'center'} px={3} py={'1.5px'} borderRadius="md" bg={chatStatusMap.bg}>
            <Box
              className={styles.statusAnimation}
              bg={chatStatusMap.color}
              w="8px"
              h="8px"
              borderRadius={'50%'}
              mt={'1px'}
            />
            <Box ml={2} color={'myGray.600'}>
              {statusBoxData.name}
            </Box>
          </Flex>
        )}
      </Flex>
      {/* content */}
      <Box mt={['6px', 2]} textAlign={styleMap.textAlign}>
        <Card
          className="markdown"
          {...MessageCardStyle}
          bg={styleMap.bg}
          borderRadius={styleMap.borderRadius}
          textAlign={'left'}
        >
          {ExternalContentCard}
          {children}
        </Card>
      </Box>
    </>
  );
};

export default React.memo(ChatItem);
