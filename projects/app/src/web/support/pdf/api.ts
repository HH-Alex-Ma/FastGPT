// projects\app\src\web\support\pdf\api.ts
import { GET, POST, PUT, DELETE } from '@/web/common/api/request';

export const getBaiduAccessToken = () => GET('/support/pdf/access_token');

export const getContractAnalyzeId = (data: {
  templateName: string;
  commentRiskLevel: string;
  file?: File;
  fileURLList?: string[];
}) => POST('/support/pdf/contract_analyze', data);

export const getContractAnalyzeResult = (params: {
  templateName: string;
  commentRiskLevel: string;
  file?: File;
  fileURLList?: string[];
}) => POST('/support/pdf/contract_analyze_with_result', params);
