import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import '../styles/Usernames.css';

const DeleteUser = () => {
  const [username, setUsername] = useState('');
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

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/delete-user-db', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setUsername('');
      }
    } catch (error) {
      console.error('Erro ao apagar utilizador:', error);
      setMessage('Erro ao apagar o utilizador.');
    }
  };

  return (
    <div className="modal-content">
      <h2>Apagar Utilizador</h2>
      <form onSubmit={handleDelete}>
        <div className="input-container">
          <label htmlFor="username">Nome de Utilizador</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">
          Apagar
        </button>
      </form>
      {message && <p className="error-message">{message}</p>}
      <button onClick={() => router.push('/')} className="button mt-20">
        Voltar ao Menu Principal
      </button>
    </div>
  );
};

export default DeleteUser;