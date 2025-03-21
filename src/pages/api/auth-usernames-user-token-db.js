import jwt from 'jsonwebtoken';
import pool from '../../lib/db';

export default async function handler(req, res) {
  // Check for Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and extract the username
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username; // Extract the username from the token payload
    console.log('Authenticated user:', username);

    // Check for method type
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Fetch the authenticated user's data from the database
    const [rows] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return the authenticated user's username
    return res.status(200).json({ username: rows[0].username });
  } catch (error) {
    console.error('Token verification or database error:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
}
