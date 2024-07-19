import axios from 'axios';

async function getAccessToken() {
  const clientId = process.env.BAIDU_CLIENT_ID;
  const clientSecret = process.env.BAIDU_CLIENT_SECRET;

  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret);

  const url = '/api/oauth/2.0/token'; // This should match your Next.js rewrite settings

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId || '',
    client_secret: clientSecret || ''
  });

  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      }
    });
    console.log('Access token response:', response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
}

async function analyzeContract(file: File) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to get access token');
    return null;
  }

  const url = `/api/file/2.0/brain/online/v1/textreview/task?access_token=${accessToken}`;

  const formData = new FormData();
  formData.append('templateName', 'TechDev_PartyA');
  formData.append('commentRiskLevel', 'all');
  formData.append('file', file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Contract review response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing contract:', error);
    return null;
  }
}

async function getContractReviewResult(taskId: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token.');
    return null;
  }

  const url = `/api/file/2.0/brain/online/v1/textreview/task/query?access_token=${accessToken}`;

  const formData = new FormData();
  formData.append('taskId', taskId);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Contract review result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract review result:', error);
    return null;
  }
}

export { analyzeContract, getContractReviewResult };
