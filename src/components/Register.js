import React, { useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/LoginRegister.css'; // Use the same Login.css file
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
const Register = () => {
  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Match variable name with Login.js
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset errors



    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('/api/register-user-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('Registration successful!');
      router.push('/home');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (

    <div className="container">
      <h2 className='nome'>Exclusive Drop</h2>

      <div className="card">

        <ClerkProvider>
          <header >
            <SignedOut >
              <div  >
                <SignInButton className="button" />
                <SignUpButton className="button" />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
              <a href="/home" className="button2">
                Entrar
              </a>
            </SignedIn>

          </header>
        </ClerkProvider>




      </div>
    </div>
  );

};


export default Register;