import '../styles/add-product-inline.css';
import '../styles/Inicio.css';
import '../styles/LoginRegister.css';
import '../styles/ProductModal.css';
import '../styles/cart.css';
import '../styles/page.css';
import '../styles/account.css';
import { CartProvider } from '@/components/cartcontext';
import { SessionProvider } from 'next-auth/react';

// Componente principal da aplicação que envolve todas as páginas.
function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;