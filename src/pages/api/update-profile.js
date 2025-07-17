import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getToken } from 'next-auth/jwt';

// Lida com a atualização do perfil de um utilizador autenticado.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const { username, email } = req.body;
  const userId = token.id;

  // --- MELHORIA DE VALIDAÇÃO ---
  const finalUsername = username ? username.trim() : '';
  const finalEmail = email ? email.trim() : '';

  if (!finalUsername || !finalEmail) {
    return res.status(400).json({ message: 'Nome de utilizador e email são obrigatórios.' });
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      username: finalUsername,
      email: finalEmail,
    });
    res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}