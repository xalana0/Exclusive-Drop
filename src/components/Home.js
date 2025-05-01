'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import DigitalClock from "./DigitalClock";
import { useCart } from "@/components/cartcontext";
import ProductModal from "@/components/ProductModal";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const { cartItems, addToCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const querySnapshot = await getDocs(productsCollection);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao buscar produtos: ', error);
      }
    };

    fetchProducts();
  }, []); // Executa apenas uma vez ao montar o componente

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setSelectedProduct(null);
  };

  const handleLogout = async () => {
    await signOut({ redirect: '/login' });
  };

  if (status === 'loading') {
    return <p>A carregar...</p>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <main className="main">
      <div className="content">
        <header className="header">
          <div className="logo">
            <img src="https://i.postimg.cc/LXPRwz4v/3dgifmaker25228.gif" alt="Store Logo" className="logoImage" />
          </div>

          <div className="headerLinks">
            <main>
              <DigitalClock />
            </main>

            <Link href="/cartpage" className="cartLink">
              <span>🛒</span> Carrinho ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
            <Link href="/conta" className="cartLink">
              <span>👤</span> Conta
            </Link>

            <button onClick={handleLogout} className="button2">Logout</button>
          </div>
        </header>

        <div className="mainContent">
          <nav className="sidebar">
            <ul className="navList">
              {[
                "Roupas", "Ténis"
              ].map((item, index) => (
                <li key={index}>
                  <Link href="#" className="navLink">{item}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="productsContainer">
            <div className="productsGrid">
              {products.map((product) => (
                <div key={product.id} className="productWrapper">
                  <ProductCard
                    name={product.name}
                    price={product.price}
                    image={product.image}
                  />
                  <button
                    className="addToCartBtn"
                    onClick={() => handleOpenModal(product)}
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAdd={handleAddToCart}
        />
      )}
    </main>
  );
}