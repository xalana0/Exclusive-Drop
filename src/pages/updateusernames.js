import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import '../styles/Usernames.css';

const UpdateUser = () => {
  const [oldUsername, setOldUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Verificação de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Precisa de estar autenticado para aceder a esta página.');
      router.push('/login');
      return;
    }

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.username) {
        throw new Error('Token inválido.');
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      alert('Precisa estar autenticado para acessar esta página.');
      router.push('/login');
    }
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/update-user-db', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldUsername, newUsername }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setOldUsername('');
        setNewUsername('');
      }
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      setMessage('Erro ao atualizar o utilizador.');
    }
  };

  return (
    <div className="modal-content">
      <h2>Atualizar Utilizador</h2>
      <form onSubmit={handleUpdate}>
        <div className="input-container">
          <label htmlFor="oldUsername">Nome de Utilizador Atual</label>
          <input
            type="text"
            id="oldUsername"
            value={oldUsername}
            onChange={(e) => setOldUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="newUsername">Novo Nome de Utilizador</label>
          <input
            type="text"
            id="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">
          Atualizar
        </button>
      </form>
      {message && <p className="error-message">{message}</p>}
      <button onClick={() => router.push('/')} className="button mt-20">
        Voltar ao Menu Principal
      </button>
    </div>
  );
};

export default UpdateUser;

