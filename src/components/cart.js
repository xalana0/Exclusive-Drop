"use client";
import { useCart } from "@/components/cartcontext";
import Link from "next/link";
import "../styles/cart.css";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h1 className="cart-title">Crrinho</h1>

      <div className="cart-grid">
        <div>
          {cartItems.length === 0 ? (
            <><p>O seu carrinho está vazio.</p><Link href="/home">
              <button className="cart-continue-btn">Continuar a Comprar</button>
            </Link></>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-info">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div>
                    <h2>{item.name}</h2>
                    <p>€{Number(item.price).toFixed(2)}</p>
                    <p><strong>Size:</strong> {item.size}</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button className="cart-btn" onClick={() => decreaseQuantity(item.id, item.size)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="cart-btn" onClick={() => increaseQuantity(item.id, item.size)}>+</button>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id, item.size)}>🗑️</button>
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
          <h2>Compra</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>Calculado no checkout</span>
          </div>
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn">Ir para checkout</button>
        </div>
      </div>
    </div>
  );
}
