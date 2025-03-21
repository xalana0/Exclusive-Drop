import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'O nome de utilizador é obrigatório.' });
    }

    try {
      const [result] = await pool.query('DELETE FROM users WHERE username = ?', [username]);

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Utilizador apagado com sucesso.' });
      } else {
        return res.status(404).json({ message: 'Utilizador não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao apagar utilizador:', error);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
