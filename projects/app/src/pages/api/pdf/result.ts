import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accessToken, taskId } = req.body;

    if (!accessToken || !taskId) {
      return res.status(400).json({ error: 'Missing access token or task ID' });
    }

    // Create FormData instance
    const form = new FormData();
    form.append('taskId', taskId);

    try {
      const response = await axios.post(
        `https://aip.baidubce.com/file/2.0/brain/online/v1/textreview/task/query?access_token=${accessToken}`,
        form,
        { headers: { ...form.getHeaders() } }
      );
      res.status(200).json(response.data);
    } catch (error: any) {
      console.error('Error retrieving contract review result:', error.message);
      res.status(500).json({ error: 'Failed to retrieve contract review result' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
