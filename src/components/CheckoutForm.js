// components/CheckoutForm.js
'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/components/cartcontext';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, subtotal, clearCart } = useCart();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const router = useRouter();

  const totalAmount = subtotal * 100;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    // Garante que userName e userEmail não são undefined
    const currentUserName = session?.user?.name || null; // Se undefined, será null
    const currentUserEmail = session?.user?.email || null; // Se undefined, será null

    // 1. Chame sua API Route (backend) para criar um PaymentIntent E DECREMENTAR O STOCK
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalAmount,
        cartItems: cartItems,
        userId: session?.user?.id || 'guest_user', // Forneça um ID de fallback para usuários não logados, se permitido
        userName: currentUserName, // Usando o valor tratado
        userEmail: currentUserEmail, // Usando o valor tratado
      }),
    });

    const { clientSecret, error: backendError } = await response.json();

    if (backendError) {
      setErrorMessage(backendError.message);
      setLoading(false);
      return;
    }

    // 2. Confirme o pagamento no frontend usando o clientSecret do PaymentIntent
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: currentUserName || 'Cliente Desconhecido', // Use o valor tratado
          email: currentUserEmail || 'email@desconhecido.com', // Use o valor tratado
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setLoading(false);
      clearCart(); // Limpa o carrinho após a compra

      // Redireciona para uma página de sucesso
      router.push('/success-page');
    } else {
      setErrorMessage("O pagamento falhou ou foi cancelado.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'rgba(0,0,0,0.7)',
      borderRadius: '10px',
      color: 'white',
      fontFamily: '"Roboto Mono", serif'
    }}>
      <h2>Finalizar Compra</h2>
      <p style={{marginBottom: '1.5rem'}}>Total a pagar: €{subtotal?.toFixed(2)}</p>

      <div style={{ marginBottom: '1.5rem', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <label htmlFor="card-element" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Detalhes do Cartão (Teste)
        </label>
        <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || succeeded || subtotal <= 0}
        style={{
          padding: '12px 20px',
          backgroundColor: subtotal <= 0 ? '#555' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: subtotal <= 0 ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          width: '100%',
          opacity: (loading || succeeded || subtotal <= 0) ? 0.7 : 1,
          transition: 'background-color 0.3s ease, opacity 0.3s ease'
        }}
      >
        {loading ? 'Processando...' : succeeded ? 'Pagamento Aprovado!' : 'Pagar'}
      </button>

      {errorMessage && <div style={{ color: '#fa755a', marginTop: '1rem', textAlign: 'center' }}>{errorMessage}</div>}
      {succeeded && <div style={{ color: 'lightgreen', marginTop: '1rem', textAlign: 'center' }}>Pagamento realizado com sucesso!</div>}
      {subtotal <= 0 && !succeeded && <div style={{ color: '#ffeb3b', marginTop: '1rem', textAlign: 'center' }}>Adicione produtos ao carrinho para prosseguir.</div>}
    </form>
  );
}

export default CheckoutForm;