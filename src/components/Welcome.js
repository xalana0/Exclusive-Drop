import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import '../styles/Welcome.css';
import { useRouter } from 'next/router';

const Welcome = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [inputWords, setInputWords] = useState({ word1: '', word2: '', word3: '', word4: '' });
  const [retrievedPassword, setRetrievedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customWords, setCustomWords] = useState({ word1: '', word2: '', word3: '', word4: '' }); // Custom words for generating password
  const router = useRouter();

  // useRef to track the input fields for both generating and revealing passwords
  const word1RefGenerate = useRef(null);
  const word2RefGenerate = useRef(null);
  const word3RefGenerate = useRef(null);
  const word4RefGenerate = useRef(null);

  const word1RefReveal = useRef(null);
  const word2RefReveal = useRef(null);
  const word3RefReveal = useRef(null);
  const word4RefReveal = useRef(null);
  const passwordBoxRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login'); // Redirect to login if token is missing
      return;
    }

    try {
      const decoded = jwt.decode(storedToken); // Decode the token
      if (!decoded || !decoded.username) {
        throw new Error('Invalid token'); // Redirect on invalid token
      }
      setUsername(decoded.username);
      setToken(storedToken);
    } catch (error) {
      console.error('Token validation error:', error);
      router.push('/login'); // Redirect on token validation error
    }
  }, [router]);

  const handleExit = () => {
    router.push('/'); // Redirect to the Menu page
  };

  // Handle input changes for custom words (for generating the password)
  const handleCustomWordChange = (e) => {
    const { name, value } = e.target;
    setCustomWords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input changes for revealing the password
  const handleWordChange = (e) => {
    const { name, value } = e.target;
    setInputWords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate a hashed password using only the 4 custom words
  const generatePassword = async () => {
    if (!token) {
      alert('You need to be logged in to access this feature.');
      return;
    }

    // Check if any of the custom words are empty and focus on the first empty input field
    if (!customWords.word1) {
      word1RefGenerate.current.focus();
      return;
    } else if (!customWords.word2) {
      word2RefGenerate.current.focus();
      return;
    } else if (!customWords.word3) {
      word3RefGenerate.current.focus();
      return;
    } else if (!customWords.word4) {
      word4RefGenerate.current.focus();
      return;
    }

    // Combine the 4 words into a single string to use as input for hashing
    const wordsCombined = `${customWords.word1}-${customWords.word2}-${customWords.word3}-${customWords.word4}`;

    // Use CryptoJS to hash the combined words
    const secret = process.env.PRIVATE_KEY || 'default-secret';
    const password = CryptoJS.HmacSHA256(wordsCombined, secret).toString(CryptoJS.enc.Hex);

    // Save the password and custom words to the server files
    const words = [customWords.word1, customWords.word2, customWords.word3, customWords.word4];

    await fetch('/api/savePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, words }),
    });

    alert('Password and words saved!'); // Confirmation message, but no display of password
  };

  // Reveal the saved password if the correct words are entered
  const handleRevealPassword = async () => {
    const { word1, word2, word3, word4 } = inputWords;

    // Check if any of the reveal words are empty and focus the first empty one
    if (!word1) {
      word1RefReveal.current.focus();
      return;
    } else if (!word2) {
      word2RefReveal.current.focus();
      return;
    } else if (!word3) {
      word3RefReveal.current.focus();
      return;
    } else if (!word4) {
      word4RefReveal.current.focus();
      return;
    }

    // Fetch the correct words from the server file
    const res = await fetch('/api/getWords');
    const data = await res.json();

    if (res.status === 200) {
      const correctWords = data.words;
      // Check if the words entered match the correct words
      if (word1 === correctWords[0] && word2 === correctWords[1] && word3 === correctWords[2] && word4 === correctWords[3]) {
        // Fetch the password from the server file
        const passwordRes = await fetch('/api/getPassword');
        const passwordData = await passwordRes.json();

        if (passwordRes.status === 200) {
          setRetrievedPassword(passwordData.password); // Show the retrieved password
          setShowPassword(true);

          // Highlight and focus the password box after showing it
          setTimeout(() => {
            if (passwordBoxRef.current) {
              passwordBoxRef.current.classList.add('highlight'); // Add the highlight class
              passwordBoxRef.current.focus(); // Focus the password box
            }
          }, 0);
        } else {
          alert('Password not found.');
          setShowPassword(false);
        }
      } else {
        alert('Incorrect words. Try again.');
        setShowPassword(false);
      }
    } else {
      alert('Words not found.');
      setShowPassword(false);
    }
  };

  // Function to copy the password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(retrievedPassword).then(() => {
      alert('Password copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="App">
      <div className="welcome-container">
        {/* Left Side: User Info and Token */}
        <div className="left-side">
          <h2>Welcome, {username}!</h2>
          <p className="intro-text">You are now logged in.</p>
          <p className="token-heading"><strong>Your Token:</strong></p>
          <div className="token-box">{token}</div>
          <button onClick={handleExit} className="button">RETURN TO MAIN MENU</button>
        </div>

        {/* Right Side: Password Generation and Validation */}
        <div className="right-side">
          <h3 className="explanation-heading">Password Generation Feature:</h3>
          <p>This feature generates a secure password using CryptoJS. You must input the correct words to reveal it.</p>

          {/* New Password and Words Generation Section */}
          <div className="custom-words-section">
            <h4>Enter your custom words to generate a new password:</h4>
            <div className="input-group">
              <input
                ref={word1RefGenerate}
                type="text"
                name="word1"
                placeholder="Word 1"
                value={customWords.word1}
                onChange={handleCustomWordChange}
              />
              <input
                ref={word2RefGenerate}
                type="text"
                name="word2"
                placeholder="Word 2"
                value={customWords.word2}
                onChange={handleCustomWordChange}
              />
              <input
                ref={word3RefGenerate}
                type="text"
                name="word3"
                placeholder="Word 3"
                value={customWords.word3}
                onChange={handleCustomWordChange}
              />
              <input
                ref={word4RefGenerate}
                type="text"
                name="word4"
                placeholder="Word 4"
                value={customWords.word4}
                onChange={handleCustomWordChange}
              />
            </div>
            <button onClick={generatePassword} className="button">
              GENERATE AND SAVE PASSWORD
            </button>
          </div>

          {/* Input fields to reveal the password */}
          <div className="password-section">
            <h4>Enter the saved words to reveal the password:</h4>
            <div className="input-group">
              <input
                ref={word1RefReveal}
                type="text"
                name="word1"
                placeholder="Word 1"
                value={inputWords.word1}
                onChange={handleWordChange}
              />
              <input
                ref={word2RefReveal}
                type="text"
                name="word2"
                placeholder="Word 2"
                value={inputWords.word2}
                onChange={handleWordChange}
              />
              <input
                ref={word3RefReveal}
                type="text"
                name="word3"
                placeholder="Word 3"
                value={inputWords.word3}
                onChange={handleWordChange}
              />
              <input
                ref={word4RefReveal}
                type="text"
                name="word4"
                placeholder="Word 4"
                value={inputWords.word4}
                onChange={handleWordChange}
              />
            </div>
          </div>

          {/* Show Encrypted Password button */}
          <button onClick={handleRevealPassword} className="button">
            SHOW ENCRYPT PASSWORD
          </button>

          {/* Conditionally show the password based on correct input */}
          {showPassword && (
            <div
              ref={passwordBoxRef}
              tabIndex={-1}
              className="password-box"
            >
              <strong>Your Encrypted Password:</strong> {retrievedPassword}
              <button onClick={copyToClipboard} className="copy-button">Copy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;