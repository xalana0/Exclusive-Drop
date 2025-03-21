import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'pass.generator');

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      const password = fs.readFileSync(filePath, 'utf8');
      res.status(200).json({ password });
    } else {
      res.status(404).json({ message: 'Password file not found' });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
