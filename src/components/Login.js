// src/components/Login.js

// --- ALTERAÇÃO ---
// Adicionado o useState e os ícones
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import BackgroundAnimation from '@/components/Background';
// --- ALTERAÇÃO ---
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // --- ALTERAÇÃO ---
  // Estado para controlar a visibilidade da palavra-passe
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const result = await signIn('credentials', {
      redirect: false,
      username: username,
      password: password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        setErrorMessage('Nome de utilizador ou palavra-passe incorretos.');
      } else {
        setErrorMessage(result.error);
      }
    } else {
      router.push('/home');
    }
  };

  const gifUrl = "https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif";

  return (
    <>
      <BackgroundAnimation gifUrl={gifUrl} />
      
      <div className="container">
        <h2 className="nome">Exclusive Drop</h2> 
        <div className="card">
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <label>Utilizador</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            {/* --- ALTERAÇÃO --- */}
            {/* O campo da palavra-passe agora tem um ícone para alternar a visibilidade */}
            <div className="input-container">
              <label>Palavra-passe</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="button">Entrar</button>
          </form>
          <p className="register-link">
            Ainda não tem conta? <Link href="/register">Registe-se</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;