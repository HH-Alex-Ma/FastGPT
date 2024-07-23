import type { NextApiRequest, NextApiResponse } from 'next';
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason
} from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';

const KEY = process.env.MS_COG_SERVICE_SPEECH_KEY;
const REGION = process.env.MS_COG_SERVICE_SPEECH_REGION;
if (!KEY || !REGION) {
  throw new Error('Missing MS_COGNITIVE_SERVICES_KEY or MS_COGNITIVE_SERVICES_REGION');
}

const speechConfig = SpeechConfig.fromSubscription(KEY, REGION);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { audio } = req.body;

    // Write the audio data to a temporary file
    const tempAudioPath = path.join(process.cwd(), 'public', 'temp.wav');
    fs.writeFileSync(tempAudioPath, Buffer.from(audio, 'base64'));

    // Transcribe audio file using Microsoft's Speech-to-Text
    const audioConfig = AudioConfig.fromWavFileInput(fs.readFileSync(tempAudioPath));
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    let transcript = '';
    await new Promise<void>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === ResultReason.RecognizedSpeech) {
            transcript = result.text;
          } else {
            reject(new Error(`Error recognizing speech: ${result.errorDetails}`));
          }
          recognizer.close();
          resolve();
        },
        (err) => {
          reject(err);
          recognizer.close();
        }
      );
    });

    // Clean up temporary file
    fs.unlinkSync(tempAudioPath);

    // Return the transcript
    res.status(200).json({ transcript });
  } catch (error) {
    console.error('Error processing the audio file:', error);
    res.status(500).json({ error: 'Error processing the audio file' });
  }
}
