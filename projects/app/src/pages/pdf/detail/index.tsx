import React, { useEffect, useMemo, useState } from 'react';
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
  Heading,
  Divider
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
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>({ textreviewResult: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsedItems, setCollapsedItems] = useState<boolean[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string | null>(null);
  const toast = useToast();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const base64ToFile = (base64: string, name: string, type: string): File => {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || '';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new File([array], name, { type: mime });
  };

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    Promise.all(storedFiles.map(async (fileData: any) => {
      const file = base64ToFile(fileData.base64, fileData.name, fileData.type);
      return file;
    })).then(files => setUploadedFiles(files));
  }, []);

  useEffect(() => {
    const fileObjects = uploadedFiles.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        name: file.name,
        type: file.type,
        base64
      };
    });
    Promise.all(fileObjects).then((fileObjects) => {
      localStorage.setItem('uploadedFiles', JSON.stringify(fileObjects));
    });
  }, [uploadedFiles]);

  const saveAnalysisResultToLocalStorage = (fileName: string, result: any) => {
    const storedResults = JSON.parse(localStorage.getItem('analysisResults') || '{}');
    storedResults[fileName] = result;
    localStorage.setItem('analysisResults', JSON.stringify(storedResults));
  };

  const getAnalysisResultFromLocalStorage = (fileName: string) => {
    const storedResults = JSON.parse(localStorage.getItem('analysisResults') || '{}');
    return storedResults[fileName] || null;
  };

  const handleFileUpload = async (result: any, file: File) => {
    setFile(file);
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
    setAnalysisResult(result.result || { textreviewResult: [] });
    saveAnalysisResultToLocalStorage(file.name, result.result || { textreviewResult: [] });
  };

  const handleFileClick = (file: File) => {
    setFile(file);
    const cachedResult = getAnalysisResultFromLocalStorage(file.name);
    if (cachedResult) {
      setAnalysisResult(cachedResult);
    }
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

  const allRiskCounts = (analysisResult.textreviewResult || [])
    .flatMap((doc: any) => doc.chatContents)
    .reduce((acc: any, item: any) => {
      acc[item.riskName] = (acc[item.riskName] || 0) + 1;
      return acc;
    }, {});

  const filteredResults = useMemo(() =>
    (analysisResult.textreviewResult || [])
      .flatMap((doc: any) => doc.chatContents)
      .filter((item: any) => !selectedRiskLevel || item.riskName === selectedRiskLevel),
    [analysisResult.textreviewResult, selectedRiskLevel]
  );

  useEffect(() => {
    console.log('Filtered results:', filteredResults);
    setCollapsedItems(new Array(filteredResults.length).fill(true));
  }, [filteredResults]);

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
            <PDFPreview file={file} />
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
                      borderLeft={`4px solid ${result.riskName === '重大风险' ? 'red' : 'yellow'}`}
                    >
                      <Flex justifyContent="space-between" mb={2}>
                        <Text fontWeight="bold">{result.ruleName}</Text>
                        <Text color="gray.600" onClick={() => toggleCollapse(index)}>
                          {collapsedItems[index] ? '展开' : '收起'}
                        </Text>
                      </Flex>
                      <Collapse in={!collapsedItems[index]}>
                        <Text whiteSpace="pre-wrap">{result.markdownResult}</Text>
                      </Collapse>
                    </Box>
                  ))}
                </>
              )}
            </VStack>
          </Box>
        </Flex>
      </PageContainer>
      <UploadModal isOpen={isOpen} onClose={onClose} onConfirm={handleFileUpload} />
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default PDFDetail;
