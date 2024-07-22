// analyze.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accessToken, file } = req.body;

    const form = new FormData();
    form.append('templateName', 'TechDev_PartyA');
    form.append('commentRiskLevel', 'all');
    form.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.BAIDU_API_URL}/file/2.0/brain/online/v1/textreview/task?access_token=${accessToken}`,
        form,
        { headers: form.getHeaders() }
      );
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error); // Log error details
      res.status(500).json({ error: 'Failed to analyze contract' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
