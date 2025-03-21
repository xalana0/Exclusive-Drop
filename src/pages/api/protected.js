import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Token missing or invalid.' });
  }

  const token = authorization.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.status(200).json({ data: `Hello, ${decoded.username}. This is protected data.` });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
