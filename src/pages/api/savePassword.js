import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password, words } = req.body;

    // Define the path to the files
    const passwordFilePath = path.join(process.cwd(), 'pass.generator');
    const wordsFilePath = path.join(process.cwd(), 'words.encrypt');

    // Save the password to the pass.generator file
    fs.writeFileSync(passwordFilePath, password);

    // Encrypt the words and save them to the words.encrypt file
    const encryptedWords = CryptoJS.AES.encrypt(JSON.stringify(words), process.env.PRIVATE_KEY).toString();
    fs.writeFileSync(wordsFilePath, encryptedWords);

    res.status(200).json({ message: 'Password and words saved successfully' });
  } else {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}