import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react'; // Importe signIn
import '../styles/LoginRegister.css';
import BackgroundAnimation from './Background';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const result = await signIn('credentials', { // Use o nome do seu provider 'credentials'
      redirect: false, // Não redirecionar automaticamente
      username: username,
      password: password,
    });

    if (result?.error) {
      setErrorMessage(result.error);
    } else {
      router.push('/home'); // Redirecionar para a página principal após o login bem-sucedido
    }
  };

  return (
    <>
      <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
      <div className="container">
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
            Não tem uma conta? <a href="/register">Registar</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;