import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import pool from '../../lib/db'; // Ensure this is a connection pool

export default async function handler(req, res) {
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

    try {
      // Retrieve user data by username
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Invalid username or password.' });
      }

      const user = rows[0];

      // Decrypt the stored password
      const decryptedPassword = CryptoJS.AES.decrypt(user.password, privateKey).toString(CryptoJS.enc.Utf8);

      // Compare passwords securely
      if (password !== decryptedPassword) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      // Generate JWT token
      const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
      console.error('Error handling login:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}