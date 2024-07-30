// projects\app\src\web\support\pdf\api.ts
import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import axios from 'axios';

export const getContractAnalyzeResult = async ({
  templateName,
  commentRiskLevel,
  file
}: {
  templateName: string;
  commentRiskLevel: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('templateName', templateName);
  formData.append('commentRiskLevel', commentRiskLevel);
  formData.append('file', file);

  try {
    const response = await axios.post('/api/support/pdf/contract_analyze_with_result', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('请求错误:', error);
    throw error;
  }
};
// export const getBaiduAccessToken = () => GET('/support/pdf/access_token');

// export const getContractAnalyzeId = (data: {
//   templateName: string;
//   commentRiskLevel: string;
//   file?: File;
//   fileURLList?: string[];
// }) => POST('/support/pdf/contract_analyze', data);
