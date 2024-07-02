const DocumentIntelligence = require('@azure-rest/ai-document-intelligence').default;
const { getLongRunningPoller, isUnexpected } = require('@azure-rest/ai-document-intelligence');
const { AzureKeyCredential } = require('@azure/core-auth');
const { setLogLevel } = require('@azure/logger');
import { ReadFileByBufferParams, ReadFileResponse } from './type';

setLogLevel('info');

const key =
  process.env['AZURE_DOCUMENT_INTELLIGENCE_API_KEY'] || 'f94c6e3f035f4246ac76aa059d31f364';
const endpoint =
  process.env['AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT'] ||
  'https://ai-hmaiaistudio386313581894.cognitiveservices.azure.com/';

// 替换原有的readPdfFile函数
export const readPdfFile = async ({
  buffer
}: ReadFileByBufferParams): Promise<ReadFileResponse> => {
  // 初始化Azure文档智能服务客户端
  const client = DocumentIntelligence(endpoint, new AzureKeyCredential(key, key));

  // 发送PDF文件进行分析
  const initialResponse = await client
    .path('/documentModels/{modelId}:analyze', 'prebuilt-read')
    .post({
      body: buffer,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  if (isUnexpected(initialResponse)) {
    throw initialResponse.body.error;
  }

  const poller = await getLongRunningPoller(client, initialResponse);
  const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;

  // // 在analyzeResult之后立即添加日志记录
  // console.log('Analyze Result:', JSON.stringify(analyzeResult, null, 2));

  // const documents = analyzeResult?.documents;
  // if (!documents || documents.length === 0) {
  //   console.error(
  //     'No documents found in the analysis result. Analyze Result:',
  //     JSON.stringify(analyzeResult, null, 2)
  //   );
  //   throw new Error('No documents found in the analysis result.');
  // }

  // const document = documents && documents[0];
  // if (!document) {
  //   throw new Error('Expected at least one document in the result.');
  // }

  // console.log(
  //   'Extracted document:',
  //   document.docType,
  //   `(confidence: ${document.confidence || '<undefined>'})`
  // );
  // console.log('Fields:', document.fields);

  // 直接使用analyzeResult中的content字段
  const rawText = analyzeResult.content || '';

  console.log('Extracted Content:', rawText);

  return {
    rawText,
    metadata: analyzeResult
  };
};
