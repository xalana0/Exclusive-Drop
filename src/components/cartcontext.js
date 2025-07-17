'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState('');
  const { data: session, status } = useSession();

  // Limpa a notificação após alguns segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Carrega o carrinho do localStorage quando a aplicação inicia
  useEffect(() => {
    try {
      const storedCartItems = localStorage.getItem('cartItems');
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  // Guarda o carrinho no localStorage sempre que ele é alterado
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  // O useEffect problemático que limpava o carrinho foi REMOVIDO daqui.

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.size === product.size
      );
      
      const price = parseFloat(product.price) || 0;

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, price: price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size))
    );
  };

  const increaseQuantity = (productId, size) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId && item.size === size) {
          if (item.stock && item.quantity < item.stock[size]) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            setNotification(`Apenas ${item.stock ? item.stock[size] : 0} unidades disponíveis para este tamanho.`);
            return item;
          }
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (productId, size) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.size === size && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    subtotal,
    notification,
    setNotification,
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}