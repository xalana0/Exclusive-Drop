"use client";
import { useCart } from "@/components/cartcontext";
import Link from "next/link";
import BackgroundAnimation from './Background'; // Importe o BackgroundAnimation
import { useSession } from 'next-auth/react'; // Para obter o ID do utilizador
// Removidas as importações do Firestore e useRouter relacionadas ao pagamento falso
// import { db } from '../lib/firebase';
// import { collection, addDoc, doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
// import { useRouter } from 'next/router';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    subtotal // Certifique-se de que subtotal é importado do contexto
  } = useCart();
  const { data: session } = useSession(); // Obter a sessão do usuário
  // const router = useRouter(); // Não mais necessário se handleFakeCheckout for removido

  // Remove a função handleFakeCheckout, pois vamos usar o Stripe
  // const handleFakeCheckout = async () => { ... }

  return (
    <>
      <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />

      <div className="cart-container">
        <h1 className="cart-title">Carrinho</h1>

        <div className="cart-grid">
          <div>
            {cartItems.length === 0 ? (
              <>
                <p style={{color: 'white', textAlign: 'center', fontSize: '1.1rem', marginBottom: '1.5rem'}}>O seu carrinho está vazio. Comece a explorar os nossos produtos!</p>
                <Link href="/home" style={{display: 'block', textAlign: 'center'}}>
                  <button className="cart-continue-btn">Continuar a Comprar</button>
                </Link>
              </>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Tamanho: {item.size}</p>
                    <p>Preço: €{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => decreaseQuantity(item.id, item.size)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id, item.size)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id, item.size)}>Remover</button>
                  </div>
                </div>
              ))
            )}

            {cartItems.length > 0 && (
              <div className="cart-controls">
                <button className="cart-clear-btn" onClick={clearCart}>Limpar Carrinho</button>
                <Link href="/home">
                  <button className="cart-continue-btn">Continuar a Comprar</button>
                </Link>
              </div>
            )}
          </div>

          <div className="cart-summary">
            <h2>Resumo da Compra</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envio</span>
              <span>Calculado no checkout</span>
            </div>
            <div className="summary-row">
              <span>IVA</span>
              <span>Calculado no checkout</span>
            </div>
            <hr style={{borderColor: 'rgba(255,255,255,0.2)', margin: '1rem 0'}}/>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {/* Botão de checkout que leva para a página real do Stripe */}
            <Link href="/checkout">
              <button
                  className="checkout-btn"
                  disabled={cartItems.length === 0} // Desabilita se o carrinho estiver vazio
              >
                  Ir para Checkout (Stripe)
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}