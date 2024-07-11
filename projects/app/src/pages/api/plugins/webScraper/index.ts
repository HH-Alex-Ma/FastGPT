import { NextApiRequest, NextApiResponse } from 'next';

// pages/api/scrape.js
import { spawn } from 'child_process';
import { URL } from 'url'; // Node.js URL module for validation
import { jsonRes } from '@fastgpt/service/common/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;
    // Handle POST request logic here

    console.log('Received URL:', url);

    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    // Validate URL using Node.js URL module
    try {
      new URL(url);
    } catch (error) {
      console.error('Invalid URL format:', error);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Sanitize URL to prevent command injection
    const sanitizedUrl = url.replace(/["';`]/g, ''); // Remove potentially dangerous characters
    console.log('Sanitized URL:', sanitizedUrl);

    const pythonProcess = spawn('python', ['data/webScrapers/DrissionScraper.py', sanitizedUrl]);
    console.log('Python Process Started', pythonProcess.pid);

    let scrapedData = '结果占位符';
    pythonProcess.stdout.setEncoding('utf8');

    pythonProcess.stdout.on('data', (data) => {
      scrapedData = data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res.status(500).json({ error: 'Failed to scrape the website' });
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Python Process Closed:', code);
        res.status(200).json({ data: scrapedData });
      } else {
        console.log('Python Process Closed with Error:', code);
        res.status(500).json({ error: 'Failed to scrape the website' });
      }
    });
    //res.status(200).json({ message: `POST request received with URL: ${url}` });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
