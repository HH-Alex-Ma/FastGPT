import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  Badge,
  Collapse,
  Spinner,
  Heading
} from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import PageContainer from '@/components/PageContainer';
import UploadModal from './component/UploadModal';
import PDFPreview from './component/PDFPreview';
import { serviceSideProps } from '@/web/common/utils/i18n';

const PDFDetail = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>({ textreviewResult: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsedItems, setCollapsedItems] = useState<boolean[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    setUploadedFiles(
      storedFiles.map((fileData: any) => new File([], fileData.name, { type: fileData.type }))
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'uploadedFiles',
      JSON.stringify(uploadedFiles.map((file) => ({ name: file.name, type: file.type })))
    );
  }, [uploadedFiles]);

  const handleFileUpload = async (result: any, file: File) => {
    setFileUrl(URL.createObjectURL(file));
    setUploadedFiles((prevFiles) => [...prevFiles, file]);

    setAnalysisResult(result.result || { textreviewResult: [] });
    console.log('setAnalysisResult:', result.result);
  };

  const handleFileClick = (file: File) => {
    setFileUrl(URL.createObjectURL(file));
  };

  const handleRiskLevelClick = (riskLevel: string | null) => {
    setSelectedRiskLevel((prev) => (prev === riskLevel ? null : riskLevel));
  };

  const toggleCollapse = (index: number) => {
    setCollapsedItems((prev) => {
      const newCollapsedItems = [...prev];
      newCollapsedItems[index] = !newCollapsedItems[index];
      return newCollapsedItems;
    });
  };

  // Calculate counts for each risk level
  const allRiskCounts = (analysisResult.textreviewResult || [])
    .flatMap((doc: any) => doc.chatContents)
    .reduce((acc: any, item: any) => {
      acc[item.riskName] = (acc[item.riskName] || 0) + 1;
      return acc;
    }, {});

  // Filter results based on selected risk level
  const filteredResults = (analysisResult.textreviewResult || [])
    .flatMap((doc: any) => doc.chatContents)
    .filter((item: any) => !selectedRiskLevel || item.riskName === selectedRiskLevel);

  // Set initial collapsed state
  useEffect(() => {
    setCollapsedItems(new Array(filteredResults.length).fill(true));
  }, [filteredResults.length]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <>
      <Head>
        <title>智能文档分析</title>
      </Head>
      <PageContainer>
        <Flex flexDirection={['column', 'row']} h="100%">
          <Box
            display={['none', 'flex']}
            flexDirection="column"
            p={4}
            w="180px"
            borderRight="1px solid"
            borderColor="gray.200"
          >
            <Flex mb={4} alignItems="center">
              <Avatar src="/imgs/module/contract.png" w="34px" borderRadius="md" />
              <Box ml={2} fontWeight="bold">
                智能文档分析
              </Box>
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
              onClick={onOpen}
            >
              <MyIcon name="common/importLight" mr={2} w="14px" />
              <Box>{t('dataset.collections.Create And Import')}</Box>
            </Flex>

            {uploadedFiles.map((file, index) => (
              <Flex
                key={index}
                alignItems="center"
                px={3}
                py={2}
                borderRadius="md"
                cursor="pointer"
                bg="gray.100"
                _hover={{ bg: 'gray.200' }}
                onClick={() => handleFileClick(file)}
              >
                <Text isTruncated>{file.name}</Text>
              </Flex>
            ))}
          </Box>

          <Box flex="1" p={4}>
            <PDFPreview fileUrl={fileUrl} />
          </Box>

          <Box w="300px" bg="white" p={4} borderLeft="1px solid" borderColor="gray.200">
            <VStack bg="white" p={4} spacing={4} h="100%" overflowY="auto">
              <Heading size="md">合同条款审查结果</Heading>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <HStack spacing={4}>
                    {['重大风险', '一般风险'].map((level) => (
                      <Badge
                        key={level}
                        variant="subtle"
                        colorScheme={level === '重大风险' ? 'red' : 'yellow'}
                        cursor="pointer"
                        onClick={() => handleRiskLevelClick(level)}
                      >
                        {level} ({allRiskCounts[level] || 0})
                      </Badge>
                    ))}
                    <Badge
                      variant="subtle"
                      colorScheme="blue"
                      cursor="pointer"
                      onClick={() => handleRiskLevelClick(null)}
                    >
                      所有风险 ({filteredResults.length})
                    </Badge>
                  </HStack>
                  {filteredResults.map((result: any, index: number) => (
                    <Box
                      key={index}
                      w="100%"
                      bg="white"
                      p={4}
                      borderRadius="md"
                      boxShadow="md"
                      cursor="pointer"
                      onClick={() => toggleCollapse(index)}
                      _hover={{ bg: 'gray.100' }}
                      _active={{ bg: 'gray.200' }}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        left={0}
                        top={0}
                        bottom={0}
                        width="4px"
                        bg={result.riskName === '重大风险' ? 'red.500' : 'yellow.500'}
                      />
                      <Box ml={6}>
                        <Text fontWeight="bold">{result.ruleName}</Text>
                        <Text color="gray.500">{result.riskName}</Text>
                        <Collapse in={!collapsedItems[index]}>
                          <Box mt={2} whiteSpace="pre-wrap">
                            {result.markdownResult}
                          </Box>
                        </Collapse>
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </VStack>
          </Box>
        </Flex>
        <UploadModal isOpen={isOpen} onClose={onClose} onConfirm={handleFileUpload} />
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
