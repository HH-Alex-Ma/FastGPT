export const fetchAuthToken = async (): Promise<string> => {
  const response = await fetch('/api/pdf/auth', { method: 'POST' });
  const data = await response.json();
  return data.access_token;
};

export const analyzeContract = async (file: File): Promise<any> => {
  const accessToken = await fetchAuthToken();
  const formData = new FormData();
  formData.append('templateName', 'TechDev_PartyA');
  formData.append('commentRiskLevel', 'all');
  formData.append('file', file);

  const response = await fetch(`/api/pdf/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  return response.json();
};

export const getContractReviewResult = async (taskId: string): Promise<any> => {
  const accessToken = await fetchAuthToken();
  const response = await fetch(`/api/pdf/result`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ taskId })
  });

  return response.json();
};