'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/components/cartcontext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#FFFFFF',
      fontFamily: '"Roboto Mono", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#CCCCCC',
      },
    },
    invalid: {
      color: '#FF0000',
      iconColor: '#FF0000',
    },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, subtotal, clearCart } = useCart();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements || subtotal <= 0 || sessionStatus !== 'authenticated' || !session?.user?.id) {
      setErrorMessage("Não é possível processar o pagamento. Verifique a sua sessão ou o carrinho.");
      setLoading(false);
      return;
    }

    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(subtotal * 100),
        cartItems: cartItems,
        userId: session.user.id,
        userName: session.user.username || 'Utilizador',
        userEmail: session.user.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error.message);
      setLoading(false);
      return;
    }
    
    // --- ALTERAÇÃO APLICADA AQUI ---
    // A chamada a 'confirmCardPayment' foi simplificada.
    // Agora, apenas passamos o elemento do cartão, sem os 'billing_details'.
    // O Stripe recolhe os dados necessários diretamente do CardElement.
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
            card: elements.getElement(CardElement),
        },
    });

    if (stripeError) {
      setErrorMessage(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
        console.log('Pagamento bem-sucedido!', paymentIntent);
        setSucceeded(true);
        clearCart();
        router.push('/success-page');
    } else {
        setErrorMessage("O pagamento não foi concluído com sucesso. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '600px',
      margin: '4rem auto',
      padding: '2.5rem',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderRadius: '15px',
      border: '1px solid #333333',
      color: '#FFFFFF',
      fontFamily: '"Roboto Mono", sans-serif'
    }}>
      <h2 style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        marginBottom: '2.5rem',
        textAlign: 'center',
        color: '#FFFFFF',
      }}>Checkout</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#FFFFFF' }}>Detalhes do Pedido</h3>
        {cartItems.length === 0 ? (
          <p style={{ color: '#CCCCCC', textAlign: 'center' }}>O seu carrinho está vazio.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cartItems.map((item) => (
              <li key={item.id + item.size} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.8rem 0',
                borderBottom: '1px dashed #555555',
                fontSize: '1rem'
              }}>
                <span style={{ color: '#FFFFFF' }}>{item.name} ({item.size}) x {item.quantity}</span>
                <span style={{ color: '#FFFFFF' }}>€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #555555',
          fontWeight: 'bold',
          fontSize: '1.3rem',
          color: '#FFFFFF'
        }}>
          <span>Total</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #555555', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <label htmlFor="card-element" style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>
          Detalhes do Cartão (Teste)
        </label>
        <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || succeeded || subtotal <= 0 || sessionStatus !== 'authenticated'}
        style={{
          padding: '15px 25px',
          backgroundColor: subtotal <= 0 ? '#333333' : '#8A2BE2',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: subtotal <= 0 ? 'not-allowed' : 'pointer',
          fontSize: '1.2rem',
          width: '100%',
          opacity: (loading || succeeded || subtotal <= 0) ? 0.7 : 1,
          transition: 'background-color 0.3s ease, opacity 0.3s ease, transform 0.2s ease',
        }}
      >
        {loading ? 'Processando...' : succeeded ? 'Pagamento Aprovado!' : 'Pagar'}
      </button>

      {errorMessage && <div style={{ color: '#FF0000', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>{errorMessage}</div>}
      {succeeded && <div style={{ color: '#8A2BE2', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>Pagamento processado com sucesso! Redirecionando...</div>}
    </form>
  );
}

export default CheckoutForm;