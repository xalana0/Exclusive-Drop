import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }

      // Use a secure server-side private key
      const privateKey = process.env.PRIVATE_KEY; // Do not expose `NEXT_PUBLIC_PRIVATE_KEY`
      if (!privateKey) {
        console.error('Missing PRIVATE_KEY in environment variables.');
        return res.status(500).json({ message: 'Internal server error.' });
      }

      // Encrypt the password
      const encryptedPassword = CryptoJS.AES.encrypt(password, privateKey).toString();

      // Define the file path
      const filePath = path.join(process.cwd(), 'login.encrypt');

      // Initialize user data array
      let fileData = [];

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          fileData = fileContent ? JSON.parse(fileContent) : [];
        } catch (error) {
          console.error('Error reading or parsing file:', error);
          return res.status(500).json({ message: 'Internal server error.' });
        }
      } else {
        // Create the file if it does not exist
        fs.writeFileSync(filePath, JSON.stringify([])); // Initialize with an empty array
      }

      // Check if the username already exists
      const userExists = fileData.some((user) => user.username === username);
      if (userExists) {
        return res.status(400).json({ message: 'Username already taken.' });
      }

      // Add the new user to the file data
      const newUser = { username, password: encryptedPassword };
      fileData.push(newUser);

      // Write the updated user data back to the file
      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Error in registration handler:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}