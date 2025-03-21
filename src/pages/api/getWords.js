import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const wordsFilePath = path.join(process.cwd(), 'words.encrypt');

    // Check if the words file exists
    if (fs.existsSync(wordsFilePath)) {
      const encryptedWords = fs.readFileSync(wordsFilePath, 'utf8');
      const decryptedWords = CryptoJS.AES.decrypt(encryptedWords, process.env.PRIVATE_KEY).toString(CryptoJS.enc.Utf8);
      res.status(200).json({ words: JSON.parse(decryptedWords) });
    } else {
      res.status(404).json({ message: 'Words file not found' });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
