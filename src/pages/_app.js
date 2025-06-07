// pages/_app.js
// Importe TODOS os seus ficheiros CSS globais aqui e APENAS aqui.

import '../styles/add-product-inline.css';
import '../styles/Inicio.css';
import '../styles/LoginRegister.css';
import '../styles/ProductModal.css';
import '../styles/cart.css';
import '../styles/page.css';
import '../styles/account.css';
import { CartProvider } from '@/components/cartcontext'; // Já está importado


import { SessionProvider } from 'next-auth/react'; // Mantenha se estiver a usar next-auth

function MyApp({ Component, pageProps }) {
  // Envolva a sua aplicação com providers
  return (
    <SessionProvider session={pageProps.session}>
      {/* AGORA ENVOLVA O COMPONENTE DA PÁGINA COM O CARTPROVIDER */}
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;