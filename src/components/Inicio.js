'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BackgroundAnimation from '@/components/Background'; // Importa o componente do GIF

function Welcome() {
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef(null);

  const handleEntrarClick = () => {
    setShowOptions(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      // Este código será executado apenas após a primeira renderização
    }
  }, []);

  const gifUrl = "https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif";

  return (
    <>
      <BackgroundAnimation gifUrl={gifUrl} /> {/* Usa o componente de fundo com o GIF */}

      {/* Removido: <img src="/images/logo.gif" alt="Logo Exclusive Drop" className="inicio-logo-gif" /> */}

      <div className="container" ref={containerRef}>
        <h2 className="nome">Exclusive Drop</h2> {/* Título com floating aqui */}

        {!showOptions ? (
          <button
            onClick={handleEntrarClick}
            className="btn btn-primary"
          >
            Entrar
          </button>
        ) : (

          <div className="options-container">
            <Link href="/login" className="btn btn-secondary">
              LOGIN
            </Link>
            <Link href="/register" className="btn btn-secondary">
              REGISTO
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Welcome;
