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
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Authenticated user:', decoded.username);

    // Check for method type
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Fetch all usernames from the database
    const [rows] = await pool.query('SELECT username FROM users');

    // Extract usernames from the query result
    const usernames = rows.map((row) => row.username);

    // Disable caching headers
    res.setHeader('Cache-Control', 'no-store'); // Prevent client-side caching
    res.setHeader('Pragma', 'no-cache'); // For older HTTP/1.0 clients

    return res.status(200).json({ usernames });
  } catch (error) {
    console.error('Token verification or database error:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
}