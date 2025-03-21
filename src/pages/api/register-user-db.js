import CryptoJS from 'crypto-js';
import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }

      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        console.error('Missing PRIVATE_KEY in environment variables.');
        return res.status(500).json({ message: 'Internal server error.' });
      }

      const encryptedPassword = CryptoJS.AES.encrypt(password, privateKey).toString();

      // Check if the username already exists
      const [existingUser] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already taken.' });
      }

      // Insert the new user
      const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, encryptedPassword]
      );

      if (result.affectedRows > 0) {
        return res.status(201).json({ message: 'User registered successfully.' });
      } else {
        return res.status(500).json({ message: 'Failed to register user.' });
      }
    } catch (error) {
      console.error('Error in registration handler:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}