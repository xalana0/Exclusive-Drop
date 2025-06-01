import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import BackgroundAnimation from '@/components/Background'; // Importa o componente do GIF

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const containerRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const result = await signIn('credentials', {
      redirect: false,
      username: username,
      password: password,
    });

    if (result?.error) {
      setErrorMessage(result.error);
    } else {
      router.push('/home');
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      // Este código será executado após a primeira renderização
    }
  }, []);

  const gifUrl = "https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif";

  return (
    <>
      <BackgroundAnimation gifUrl={gifUrl} /> {/* Usa o componente de fundo com o GIF */}
      
      <div className="container" ref={containerRef}>
      <h2 className="nome">Exclusive Drop</h2> 
        <div className="card">
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="button">Entrar</button>
          </form>
          <p className="register-link">
            Ainda não tem conta? <Link href="/register">Registar</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
