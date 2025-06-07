'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import BackgroundAnimation from '../components/Background'; // Ajuste o caminho se necessário

export default function SuccessPage() {
  return (
    <>
      <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
      <div style={{
        color: 'white',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Roboto Mono", serif',
        zIndex: 2,
        position: 'relative',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#00cc00', marginBottom: '1rem' }}>🎉</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Obrigado pela sua compra simulada!(em modo de teste).</p>
        <Link href="/home">
          <button style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            Voltar para a Loja
          </button>
        </Link>
        <p style={{ fontSize: '0.9rem', marginTop: '2rem', color: '#ccc' }}>
          Este é um pagamento de teste.
        </p>
      </div>
    </>
  );
}