import {
  Box,
  BoxProps,
  Card,
  Divider,
  Flex,
  useTheme,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChatController, { type ChatControllerProps } from './ChatController';
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
import MarkMapViewer from 'src/components/ChatBox/components/markmap';
import { AIChatItemType, ChatHistoryItemResType } from '@fastgpt/global/core/chat/type';
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

const ChatItem = ({
  type,
  avatar,
  statusBoxData,
  children,
  isLastChild,
  questionGuides = [],
  ...chatControllerProps
}: {
  type: ChatRoleEnum.Human | ChatRoleEnum.AI;
  avatar?: string;
  statusBoxData?: {
    status: `${ChatStatusEnum}`;
    name: string;
  };
  questionGuides?: string[];
  children?: React.ReactNode;
} & ChatControllerProps) => {
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
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

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

            {
              /* 把回答按模板切分为文字，大纲，思维导图三部分 
            const parseResponse = (content: string) : string[] => {
              const parts1 = content.split('**大纲**:');
              const text = parts1[0].replace('**文本回答**:', '').trim();
              const parts2 = parts1[1].split('**Markdown思维导图**:');
              
              const outline = parts2[0].replace('', '').trim();
              const mindMap = parts2[1].trim().replace(/^```|```$/g, '')
              return [text, outline, mindMap]
            }

            
            const [textAnswer, outlineMD , mindMapMD] = parseResponse(source);
            */
            }

            let extraData: ChatHistoryItemResType | undefined;
            let extraResponse: string | undefined;
            if ((chat as AIChatItemType).responseData !== undefined) {
              //提取外部搜索的回答
              extraData = (chat as AIChatItemType).responseData?.find(
                (obj) => obj.moduleName === '候选人评估' && obj.moduleType === 'chatNode'
              );
            }
            if (extraData) {
              extraResponse = extraData.historyPreview?.at(-1)?.value;
            }

            return (
              <Flex flexDirection="row" height="auto">
                <Flex flexDirection="column" maxWidth="50%">
                  <Flex justifyContent="center">
                    <Tag colorScheme="cyan">候选人评估</Tag>
                  </Flex>
                  <Tabs isLazy>
                    <TabList>
                      <Tab>会话</Tab>
                      {/* <Tab>大纲</Tab>
                      <Tab>思维导图</Tab> */}
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <p>
                          <Markdown
                            key={key}
                            source={source}
                            showAnimation={isLastChild && isChatting && i === chat.value.length - 1}
                          />
                        </p>
                      </TabPanel>
                      {/* <TabPanel>
                        <p>这是大纲</p>
                      </TabPanel>
                      <TabPanel>
                        <Flex>
                          <MarkMapViewer />
                        </Flex>
                      </TabPanel> */}
                    </TabPanels>
                  </Tabs>
                </Flex>
                {type === 'AI' && (
                  <Flex height="auto">
                    <Divider orientation="vertical" alignSelf="stretch" />
                  </Flex>
                )}
                {type === 'AI' && (
                  <Flex flexDirection="column" maxWidth="50%">
                    <Flex justifyContent="center">
                      <Tag colorScheme="green">面试问题设计</Tag>
                    </Flex>
                    <Tabs isLazy>
                      <TabList>
                        <Tab>会话</Tab>
                        {/*<Tab>大纲</Tab>
                        <Tab>思维导图</Tab>*/}
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <p>
                            <Markdown
                              key={key}
                              source={extraResponse}
                              showAnimation={
                                isLastChild && isChatting && i === chat.value.length - 1
                              }
                            />
                          </p>
                        </TabPanel>
                        {/*<TabPanel>
                          <p>这是大纲</p>
                        </TabPanel>
                        <TabPanel>
                          <Flex>
                            <MarkMapViewer />
                          </Flex>
                        </TabPanel> */}
                      </TabPanels>
                    </Tabs>
                  </Flex>
                )}
              </Flex>
            );
          }
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
      <Flex w={'100%'} alignItems={'center'} gap={2} justifyContent={styleMap.justifyContent}>
        {isChatting && type === ChatRoleEnum.AI && isLastChild ? null : (
          <Box order={styleMap.order} ml={styleMap.ml}>
            <ChatController {...chatControllerProps} isLastChild={isLastChild} />
          </Box>
        )}
        <ChatAvatar src={avatar} type={type} />

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
          {ContentCard}
          {children}
        </Card>
      </Box>
    </>
  );
};

export default React.memo(ChatItem);
