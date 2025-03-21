//import '../styles/globals.css'; // Ensure global styles are imported here

import { CartProvider } from "@/components/cartcontext";

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
