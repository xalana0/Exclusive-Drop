//import '../styles/globals.css'; // Ensure global styles are imported here
import '../styles/LoginRegister.css';
import '../styles/ProductModal.css';
import { CartProvider } from "@/components/cartcontext";

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
