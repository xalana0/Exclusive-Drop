'use client'

import { useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import styles from "../styles/page.module.css"
import DigitalClock from "./DigitalClock"
import { useCart } from "@/components/cartcontext"
import ProductModal from "@/components/ProductModal" // 🆕 Importa o modal

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Home() {
  const { cartItems, addToCart } = useCart()

  // 🆕 Gerenciamento do modal
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleOpenModal = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    setSelectedProduct(null)
  }

  const products = [
    {
      id: 1,
      name: "Air Force 1 [WHITE]",
      price: 120.00,
      image: "https://i.postimg.cc/vm5yZ58g/af1.webp",
    },
    {
      id: 2,
      name: "Jordan 4 Retro - Midnight Navy",
     price: 385.00 ,
      image: "https://i.postimg.cc/6qfC8d6h/aj4-midnightnavy-back-removebg-preview.png",
    },
    {
      id: 3,
      name: "Air Jordan 3 Retro Green Glow",
      price: 200.00,
      image: "https://i.postimg.cc/W4qrGRbz/zapatilla-jordan-air-jordan-3-retro-green-glow-black-green-glow-wolf-grey-white-0-removebg-preview.png",
    },
   
  ]

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <img src="https://i.postimg.cc/LXPRwz4v/3dgifmaker25228.gif" alt="Store Logo" className={styles.logoImage} />
          </div>

          <div className={styles.headerLinks}>
            <main>
              <DigitalClock />
            </main>

            <Link href="/cartpage" className={styles.cartLink}>
              <span>🛒</span> Carrinho ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              
            </Link>

            

            <ClerkProvider>
              <header className="flex justify-end items-center p-4 gap-4 h-16">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
            </ClerkProvider>
          </div>
        </header>

        <div className={styles.mainContent}>
          <nav className={styles.sidebar}>
            <ul className={styles.navList}>
              {[
                "Roupas", "Ténis"
              ].map((item, index) => (
                <li key={index}>
                  <Link href="#" className={styles.navLink}>{item}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.productsContainer}>
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <div key={product.id}>
                  <ProductCard name={product.name} price={product.price} image={product.image} />
                  <button
                    className={styles.addToCartBtn}
                    onClick={() => handleOpenModal(product)}
                  >
                    Abrir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 Modal de Produto */}
      <ProductModal
        product={selectedProduct}
        onClose={handleCloseModal}
        onAdd={handleAddToCart}
      />
    </main>
  )
}
