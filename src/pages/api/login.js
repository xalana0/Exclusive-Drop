import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Secure environment variable usage
    const privateKey = process.env.PRIVATE_KEY; // Avoid NEXT_PUBLIC_
    const jwtSecret = process.env.JWT_SECRET;

    if (!privateKey || !jwtSecret) {
      console.error('Missing encryption keys or JWT secret.');
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // Define file path
    const filePath = path.join(process.cwd(), 'login.encrypt');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'No registered users found.' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContent);

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(404).json({ message: 'Invalid username or password.' });
    }

    // Decrypt the stored password
    try {
      const decryptedPassword = CryptoJS.AES.decrypt(user.password, privateKey).toString(CryptoJS.enc.Utf8);

      // Securely compare passwords
      if (password !== decryptedPassword) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      // Generate JWT token
      const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
      console.error('Error decrypting password:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
