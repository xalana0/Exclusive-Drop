'use client';

import React from 'react';

// Componente para renderizar uma animação de fundo com um GIF.
function BackgroundAnimation({ gifUrl }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <img
        src={gifUrl}
        alt="Animação de Fundo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.6) contrast(1.2)',
        }}
      />
    </div>
  );
}

export default BackgroundAnimation;