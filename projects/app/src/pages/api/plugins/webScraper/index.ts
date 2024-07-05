import { NextApiRequest, NextApiResponse } from 'next';

// pages/api/scrape.js
import { spawn } from 'child_process';
import { URL } from 'url'; // Node.js URL module for validation

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;
    // Handle POST request logic here
    res.status(200).json({ message: `POST request received with URL: ${url}` });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { url } = req.body;

  console.log('Received URL:', url);

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  // Validate URL using Node.js URL module
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Sanitize URL to prevent command injection
  const sanitizedUrl = url.replace(/["';`]/g, ''); // Remove potentially dangerous characters
  console.log('Sanitized URL:', sanitizedUrl);

  const pythonProcess = spawn('python', [
    'packages/service/support/webScrapers/dummy.py',
    sanitizedUrl
  ]);

  let scrapedData = '';

  pythonProcess.stdout.on('data', (data) => {
    scrapedData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
    res.status(500).json({ error: 'Failed to scrape the website' });
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.status(200).json({ data: scrapedData });
    } else {
      res.status(500).json({ error: 'Failed to scrape the website' });
    }
  });
}
