import { useEffect, useState } from 'react';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import '../styles/Menu.css'; // Use the new CSS file

const Menu = () => {
  const [authStatus, setAuthStatus] = useState({
    message: 'Checking authentication...',
    color: 'black',
  });

  const [dbStatus, setDbStatus] = useState({
    message: 'Checking database...',
    color: 'black',
  });

  const router = useRouter();

  const checkToken = () => {
    const token = localStorage.getItem('token');
    let authMessage = 'NOT AUTHORIZED';
    let authColor = 'red';

    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.username) {
          authMessage = 'USER Authentication : ' + decoded.username;
          authColor = 'green';
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    setAuthStatus({ message: authMessage, color: authColor });
  };

  const checkDbConnection = async () => {
    try {
      const response = await fetch('/api/check-db-connection');
      const data = await response.json();

      if (response.ok) {
        setDbStatus({ message: 'Database ONLINE', color: 'green' });
      } else {
        setDbStatus({ message: 'Database OFFLINE', color: 'red' });
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
      setDbStatus({ message: 'Database OFFLINE', color: 'red' });
    }
  };

  useEffect(() => {
    checkToken();
    checkDbConnection();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthStatus({ message: 'NOT AUTHORIZED', color: 'red' });
    router.push('/');
  };

  return (
    <div className="menuContainer">
      <header className="menuHeader">
        {/* Logo */}
        <img src="/next.svg" alt="Logo" className="logoSmall" />
        <h1>DATABASE CONNECTION SYSTEM</h1>
        {/* Status Messages */}
        <div className="statusContainer">
          <p className="authStatus" style={{ color: authStatus.color }}>
            {authStatus.message}
          </p>
          <p className="dbStatus" style={{ color: dbStatus.color }}>
            {dbStatus.message}
          </p>
        </div>
      </header>

      <div className="menuCard">
        {/* Menu Items */}
        <Link href="/login" className="menuButton">
          LOGIN (SELECT)
        </Link>
        <Link href="/register" className="menuButton">
          REGISTER (INSERT)
        </Link>
        <Link href="/showauthusernames" className="menuButton">
          SHOW USERNAMES (SELECT)
        </Link>
        <Link href="/updateusernames" className="menuButton">
          UPDATE USERNAMES (UPDATE)
        </Link>
        <Link href="/deleteusernames" className="menuButton">
          DELETE USERNAMES (DELETE)
        </Link>
        <Link href="/welcome" className="menuButton">
          PROTECTED WELCOME PAGE (OPEN PAGE)
        </Link>
        <Link href="/protected-example" className="menuButton">
          OTHER PROTECTED PAGE (OPEN PAGE)
        </Link>
        {/* Logout button */}
        <button onClick={handleLogout} className="menuButton">
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Menu;
