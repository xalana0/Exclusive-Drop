"use client";
import { useCart } from "@/components/cartcontext";
import Link from "next/link";
import { useSession } from 'next-auth/react';

// Componente que renderiza a página do carrinho de compras.
export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    subtotal,
    notification,
  } = useCart();
  const { data: session } = useSession();

  return (
    <>
      <div className="cart-container">
        <h1 className="cart-title">Carrinho</h1>

        {notification && <div className="cart-notification">{notification}</div>}

        <div className="cart-grid">
          <div className="cart-items-list">
            {cartItems.length === 0 ? (
              <>
                <p className="no-items-message">O seu carrinho está vazio. Comece a explorar os nossos produtos!</p>
                <Link href="/home" style={{display: 'block', textAlign: 'center'}}>
                  <button className="cart-continue-btn">Continuar a Comprar</button>
                </Link>
              </>
            ) : (
              cartItems.map((item) => (
                <div key={item.id + item.size} className="cart-item">
                  <img 
                    src={item.images && item.images[0] ? item.images[0] : '/placeholder.svg'} 
                    alt={item.name} 
                    className="cart-item-image" 
                  />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Tamanho: {item.size}</p>
                    <p>Preço: €{item.price ? item.price.toFixed(2) : '0.00'}</p>
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
            <hr style={{borderColor: '#555555', margin: '1rem 0'}}/>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout">
              <button
                  className="checkout-btn"
                  disabled={cartItems.length === 0}
              >
                  Ir para o Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
