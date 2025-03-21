import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'login.encrypt');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read user file' });
    }

    try {
      const users = JSON.parse(data);
      const usernames = users.map((user) => user.username);

      // Disable caching headers
      res.setHeader('Cache-Control', 'no-store'); // Prevent client from caching
      res.setHeader('Pragma', 'no-cache'); // For older HTTP/1.0 clients

      return res.status(200).json({ usernames });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: 'Failed to parse user data' });
    }
  });
}