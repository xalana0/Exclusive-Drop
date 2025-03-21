import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/Usernames.css';

function Usernames() {
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUsernames = async () => {
      try {
        const response = await fetch('/api/usernames-user-db');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        if (isMounted) {
          setUsernames(data.usernames || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching usernames:', err);
        if (isMounted) {
          setError('Failed to load usernames. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchUsernames();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="modal-content">
      <img src="/next.svg" alt="Logo" className="logo" />
      <h2>Registered Usernames</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <ul>
          {usernames.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      )}
      <button onClick={() => router.push('/')} className="button">
      RETURN TO MAIN MENU
      </button>
    </div>
  );
}

export default Usernames;
