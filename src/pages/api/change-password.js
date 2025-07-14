import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Lida com a alteração de palavra-passe do utilizador.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const user = userDocSnap.data();

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'A palavra-passe atual está incorreta.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await updateDoc(userDocRef, {
      password: hashedNewPassword,
    });

    return res.status(200).json({ message: 'Palavra-passe alterada com sucesso.' });
  } catch (error) {
    console.error("Erro ao alterar palavra-passe:", error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}