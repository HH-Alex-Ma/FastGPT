import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, IconButton, useTheme, Input, List, ListItem, Text, Spinner, Collapse, Badge, HStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import PDFPreview from './component/PDFPreview';
import { serviceSideProps } from '@/web/common/utils/i18n';

interface Clause {
  ruleName: string;
  riskName: string;
  markdownResult: string;
  pageNumber: number; // 新增页面号字段
  positions?: { // 新增位置字段
    box: number[];
  }[];
}

interface UploadedFile {
  name: string;
  dataUrl: string;
  taskId: string;
}

const PDFDetail = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [instance, setInstance] = useState<any>(null);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [collapsedItems, setCollapsedItems] = useState<boolean[]>([]);
  const [reviewResults, setReviewResults] = useState<Clause[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);


  const loadDocument = (dataUrl: string) => {
    if (instance) {
      const { documentViewer } = instance.Core;
      documentViewer.loadDocument(dataUrl);
    }
  };

  const handleFileItemClick = async (file: UploadedFile) => {
    loadDocument(file.dataUrl);
    setReviewResults([]);
    setCollapsedItems([]);
    setIsLoading(true);
    await fetchAndSetReviewResults(file.taskId);
    setIsLoading(false);
  };

  const fetchAndSetReviewResults = async (taskId: string) => {
    const result = await getContractReviewResult(taskId);
    console.log('Contract review result:', result);
    if (result && result.result.status === 'success') {
      const textReviewResults = result.result.textreviewResult || [];
      setReviewResults(
        textReviewResults.flatMap((doc: any) =>
          doc.chatContents.map((item: any) => ({
            ruleName: item.ruleName,
            riskName: item.riskName || "未知风险",
            markdownResult: item.markdownResult,
            pageNumber: item.pageNumber, // 从接口获取页码或坐标信息
            positions: item.positions || [] // 获取位置信息
          }))
        )
      );
      setCollapsedItems(Array(textReviewResults.length).fill(true));

      // Optional: Auto-expand the first item
      if (textReviewResults.length > 0) {
        toggleCollapse(0);
      }
    } else if (result && result.result.status === 'fail') {
      console.error('Review result fetch failed:', result.result.message);
    }
  };

  return (
    <>
      <Head>
        <title>智能文档分析</title>
      </Head>
      <PageContainer>
        <Flex flexDirection={['column', 'row']} h="100%">
          <Box display={['none', 'flex']} flexDirection="column" p={4} w="180px" borderRight={theme.borders.base}>
            <Flex mb={4} alignItems="center">
              <Avatar src="/imgs/module/contract.png" w="34px" borderRadius="md" />
              <Box ml={2} fontWeight="bold">智能文档分析</Box>
            </Flex>
            <Flex
              alignItems="center"
              px={5}
              py={2}
              borderRadius="md"
              cursor="pointer"
              bg="primary.500"
              color="white"
              h={['28px', '35px']}
              as="label"
              htmlFor="file-upload"
            >
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                id="file-upload"
                style={{ display: 'none' }}
              />
              <MyIcon name="common/importLight" mr={2} w="14px" />
              <Box>{t('dataset.collections.Create And Import')}</Box>
            </Flex>
            <List mt={4} spacing={2}>
              {fileList.map(fileName => (
                <ListItem
                  key={fileName}
                  cursor="pointer"
                  py={2}
                  px={3}
                  borderRadius="md"
                  _hover={{ bg: 'myGray.100' }}
                  onClick={() => handleFileClick(fileName)}
                >
                  {fileName}
                </ListItem>
              ))}
            </List>
            <Flex
              alignItems="center"
              cursor="pointer"
              py={2}
              px={3}
              borderRadius="md"
              _hover={{ bg: 'myGray.100' }}
              onClick={() => router.replace('/app/list')}
            >
              <IconButton
                mr={3}
                icon={<MyIcon name="common/backFill" w="18px" color="primary.500" />}
                bg="white"
                boxShadow="1px 1px 9px rgba(0,0,0,0.15)"
                size="smSquare"
                borderRadius="50%"
                aria-label=""
              />
              {t('app.My Apps')}
            </Flex>
          </Box>
          <Box flex="1" h={['auto', '100%']} overflow="hidden">
            <Flex flexDirection={['column', 'row']} h="100%">
              <Box flex="1" overflow="hidden">
                <PDFPreview file={{ name: '', dataUrl: file, taskId: '' }} />
              </Box>
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                p={4}
                bg="gray.50"
              >
                <Text fontSize="xl" fontWeight="bold" mb={4}>合同条款审查结果</Text>
                {isLoading ? (
                  <Spinner size="md" />
                ) : (
                  <>
                    <HStack spacing={4} mb={4}>
                      <Badge
                        variant="subtle"
                        colorScheme="red"
                        cursor="pointer"
                        onClick={() => handleRiskLevelClick('重大风险')}
                      >
                        重大风险 ({countRiskLevels('重大风险')})
                      </Badge>
                      <Badge
                        variant="subtle"
                        colorScheme="yellow"
                        cursor="pointer"
                        onClick={() => handleRiskLevelClick('中等风险')}
                      >
                        中等风险 ({countRiskLevels('中等风险')})
                      </Badge>
                      <Badge
                        variant="subtle"
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => handleRiskLevelClick('轻微风险')}
                      >
                        轻微风险 ({countRiskLevels('轻微风险')})
                      </Badge>
                      <Badge
                        variant="subtle"
                        cursor="pointer"
                        onClick={() => handleRiskLevelClick(null)}
                      >
                        全部风险 ({reviewResults.length})
                      </Badge>
                    </HStack>
                    <List spacing={4} overflowY="auto">
                      {filteredResults.map((item, index) => (
                        <ListItem key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="white">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="bold">{item.ruleName}</Text>
                            <Text color="red.500">{item.riskName}</Text>
                            <IconButton
                              size="sm"
                              aria-label="Toggle collapse"
                              // icon={<MyIcon name={collapsedItems[index] ? 'chevron-up' : 'chevron-down'} />}
                              onClick={() => setCollapsedItems(prev => {
                                const newCollapsedItems = [...prev];
                                newCollapsedItems[index] = !newCollapsedItems[index];
                                return newCollapsedItems;
                              })}
                            />
                          </Flex>
                          <Collapse in={collapsedItems[index]}>
                            <Box>
                              <Text mb={2} fontSize="sm" whiteSpace="pre-wrap">{item.markdownResult}</Text>
                            </Box>
                          </Collapse>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </PageContainer>
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default PDFDetail;