import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { oldUsername, newUsername } = req.body;

    if (!oldUsername || !newUsername) {
      return res.status(400).json({ message: 'Ambos os nomes de utilizador são obrigatórios.' });
    }

    try {
      const [result] = await pool.query(
        'UPDATE users SET username = ? WHERE username = ?',
        [newUsername, oldUsername]
      );

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Utilizador atualizado com sucesso.' });
      } else {
        return res.status(404).json({ message: 'Utilizador não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
