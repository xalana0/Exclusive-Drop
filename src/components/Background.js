'use client';

import React from 'react';

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
        zIndex: 0, // Garante que o GIF fica no fundo
        pointerEvents: 'none', // Permite que cliques passem para elementos abaixo
      }}
    >
      <img
        src={gifUrl}
        alt="Animação de Fundo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Cobre a área total, cortando se necessário
          filter: 'brightness(0.6) contrast(1.2)', // Ajusta brilho/contraste para melhor leitura do texto
        }}
      />
    </div>
  );
}

export default BackgroundAnimation;
