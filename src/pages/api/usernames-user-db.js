import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Fetch all usernames from the database
    const [rows] = await pool.query('SELECT username FROM users');

    // Extract usernames from the query result
    const usernames = rows.map((row) => row.username);

    // Disable caching headers
    res.setHeader('Cache-Control', 'no-store'); // Prevent client-side caching
    res.setHeader('Pragma', 'no-cache'); // For older HTTP/1.0 clients

    return res.status(200).json({ usernames });
  } catch (error) {
    console.error('Error retrieving users from database:', error);
    return res.status(500).json({ error: 'Failed to retrieve user data' });
  }
}