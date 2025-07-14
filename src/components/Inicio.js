'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BackgroundAnimation from '@/components/Background';

// Componente da página de boas-vindas com opções de login e registo.
function Welcome() {
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef(null);

  const handleEntrarClick = () => {
    setShowOptions(true);
  };

  useEffect(() => {
    if (containerRef.current) {
    }
  }, []);

  const gifUrl = "https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif";

  return (
    <>
      <BackgroundAnimation gifUrl={gifUrl} />
      <div className="container" ref={containerRef}>
        <h2 className="nome">Exclusive Drop</h2>

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