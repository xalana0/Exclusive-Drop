// src/components/Register.js

import { useRouter } from 'next/router';
// --- ALTERAÇÃO ---
import { useState } from 'react';
import BackgroundAnimation from '@/components/Background';
import Link from 'next/link';
// --- ALTERAÇÃO ---
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  // --- ALTERAÇÃO ---
  // Estados para controlar a visibilidade de cada campo de palavra-passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As palavras-passe não correspondem!');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Por favor, insira um email válido.');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, telemovel, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro ao registar.');
      }

      setIsRegistered(true);

    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const gifUrl = "https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif";

  return (
    <>
      <BackgroundAnimation gifUrl={gifUrl} />
      
      <div className="container">
        <h2 className="nome">Exclusive Drop</h2>

        <div className="card">
          {!isRegistered ? (
            <form onSubmit={handleRegister}>
              <div className="input-container">
                <label>Utilizador</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Telemóvel</label>
                <input type="tel" value={telemovel} onChange={(e) => setTelemovel(e.target.value)} required />
              </div>
              {/* --- ALTERAÇÃO --- */}
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
              {/* --- ALTERAÇÃO --- */}
              <div className="input-container">
                <label>Confirmar Palavra-passe</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                 <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <button type="submit" className="button">Registar</button>
            </form>
          ) : (
            <div className="success-section">
              <p className="success-msg">Registo concluído com sucesso!</p>
              <Link href="/login" passHref>
                <button className="button2">Ir para o Login</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;