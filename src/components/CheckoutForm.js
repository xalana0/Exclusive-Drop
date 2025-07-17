'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/components/cartcontext';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore'; 
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
  // --- ALTERAÇÃO AQUI ---
  // Apanha também o 'status' da sessão para validação
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // --- MELHORIA DE VALIDAÇÃO ---
    // Verifica se o Stripe carregou, se o carrinho não está vazio
    // E, crucialmente, se a sessão está autenticada e tem um ID de utilizador.
    if (!stripe || !elements || subtotal <= 0 || sessionStatus !== 'authenticated' || !session?.user?.id) {
      setErrorMessage("Não é possível processar o pagamento. Verifique a sua sessão ou o carrinho.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      console.log('PaymentMethod:', paymentMethod);

      try {
        const userId = session.user.id;
        const userEmail = session.user.email || 'guest@example.com';
        // --- ALTERAÇÃO AQUI ---
        // Passa 'username' em vez de 'name' para corresponder ao objeto da sessão
        const userName = session.user.username || 'Utilizador Convidado';

        // --- CORREÇÃO IMPORTANTE ---
        // Aqui chamamos a nossa API de backend que agora tem a lógica de criação de pedido
        const res = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(subtotal * 100), // Envia o valor em cêntimos
                cartItems: cartItems,
                userId: userId,
                userName: userName,
                userEmail: userEmail
            }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error.message);
        }

        const { clientSecret } = data;

        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);

        if (stripeError) {
            throw new Error(stripeError.message);
        }

        setSucceeded(true);
        clearCart();
        router.push('/success-page');

      } catch (e) {
        console.error("Erro ao processar o pedido ou atualizar o stock: ", e);
        setErrorMessage(`Erro: ${e.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}`);
        setSucceeded(false);
      } finally {
        setLoading(false);
      }
    }
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
        // --- ALTERAÇÃO AQUI ---
        // O botão também fica desativado se a sessão não estiver pronta
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