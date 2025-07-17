// src/components/cartcontext.js

'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState('');
  const { data: session, status } = useSession();

  // Efeito para limpar a notificação após alguns segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- ALTERAÇÃO/CORREÇÃO ---
  // Este useEffect agora gere a carga, gravação e limpeza do carrinho
  // com base na sessão do utilizador, corrigindo o problema do F5 e do carrinho partilhado.
  useEffect(() => {
    // Não faz nada enquanto a sessão está a ser carregada
    if (status === 'loading') {
      return;
    }

    const currentUserId = session?.user?.id;
    const storedCart = localStorage.getItem('cartItems');
    const storedUserId = localStorage.getItem('cartUserId');

    // Se existe um utilizador com sessão iniciada
    if (currentUserId) {
      // Se o utilizador atual é o mesmo que o dono do carrinho guardado
      if (currentUserId === storedUserId && storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (error) {
          console.error("Falha ao ler o carrinho do localStorage:", error);
          setCartItems([]);
        }
      } else {
        // Se o utilizador é diferente (ou não há carrinho para este user), limpa tudo
        setCartItems([]);
        localStorage.setItem('cartUserId', currentUserId); // Define o novo dono do carrinho
        localStorage.setItem('cartItems', '[]');
      }
    } else {
      // Se não há sessão (utilizador fez logout ou é convidado), limpa tudo
      setCartItems([]);
      localStorage.removeItem('cartUserId');
      localStorage.removeItem('cartItems');
    }
  }, [session, status]);


  // Efeito para guardar o carrinho no localStorage sempre que os itens mudam
  useEffect(() => {
    // Só guarda se houver um utilizador autenticado
    if (status === 'authenticated' && session?.user?.id) {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('cartUserId', session.user.id);
        } catch (error) {
            console.error("Falha ao guardar o carrinho no localStorage:", error);
        }
    }
  }, [cartItems, session, status]);


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