import { useRouter } from 'next/router';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { useState } from 'react';
import BackgroundAnimation from './Background';
import bcrypt from 'bcryptjs'; // Importe bcrypt

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As passwords não correspondem!');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const usernameQuery = query(usersRef, where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        setErrorMessage('Username já existe');
        return;
      }

      // Hash da password antes de armazenar
      const hashedPassword = await bcrypt.hash(password, 10);

      await addDoc(collection(db, 'users'), {
        username,
        email,
        telemovel,
        password: hashedPassword, // Armazene a password hasheada
        isUser: true,
        isAdmin: false,
      });

      setIsRegistered(true);
    } catch (err) {
      setErrorMessage(err.message || 'Registo falhou.');
    }
  };

  return (
    <>
      <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
      <div className="container">
        <h2 className="nome">Exclusive Drop</h2>

        <div className="card">
          {!isRegistered ? (
            <form onSubmit={handleRegister}>
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
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <label>Telemóvel</label>
                <input
                  type="text"
                  value={telemovel}
                  onChange={(e) => setTelemovel(e.target.value)}
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
              <div className="input-container">
                <label>Confirmar Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <button type="submit" className="button">Registar</button>
            </form>
          ) : (
            <div className="success-section">
              <p className="success-msg">Registo concluído com sucesso!</p>
              <button className="button2" onClick={() => router.push('/home')}>
                Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;