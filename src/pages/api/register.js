import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Lida com o registo de um novo utilizador de forma segura.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, email, telemovel, password } = req.body;

  if (!username || !email || !password || !telemovel) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A password deve ter pelo menos 6 caracteres.' });
  }
  // Validação simples de email
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'O formato do email é inválido.' });
  }

  try {
    const usersRef = collection(db, 'users');
    
    // Verifica se o username já existe
    const userQuery = query(usersRef, where('username', '==', username));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      return res.status(409).json({ message: 'O nome de utilizador já existe.' });
    }
    
    // Verifica se o email já existe
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await addDoc(usersRef, {
      username,
      email,
      telemovel,
      password: hashedPassword,
      isUser: true,
      isAdmin: false, // Garante que novos utilizadores não são administradores
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Utilizador registado com sucesso!' });
  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}