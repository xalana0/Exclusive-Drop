// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/*
          Aqui é onde você adiciona as tags <link> para as suas fontes do Google Fonts.
          Substitua os URLs pelos URLs exatos que você obtém do Google Fonts.
          Visite fonts.google.com, selecione Carattere e Roboto Mono,
          e copie o <link> fornecido na seção "Use on the web".
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Carattere&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Se você tiver outros links no <head>, mantenha-os aqui */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}