import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Protected = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Hook for navigation

  useEffect(() => {
    const fetchProtectedData = async () => {
      setError('');
      setData('');

      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        if (!token) {
          setError('Token is missing. Please log in.');
          return;
        }

        const response = await fetch('/api/protected', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Error fetching protected data:', err);
        setError(err.message || 'Failed to fetch data.');
      }
    };

    fetchProtectedData(); // Fetch data when the component mounts
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Protected API Call Example</h2>
      {data && <p style={{ color: 'green', marginTop: '10px' }}>{data}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      <button onClick={() => router.push('/')} className="menuButton">
        RETURN TO MAIN MENU
      </button>
    </div>
  );
};

export default Protected;
