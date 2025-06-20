// components/CheckoutForm.js
'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/components/cartcontext';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // addDoc será usado fora da transação para simplificar o exemplo, mas a intenção era que fosse transaction.set
import { doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore'; 
import { useSession } from 'next-auth/react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#FFFFFF', // White text for card input
      fontFamily: '"Roboto Mono", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#CCCCCC', // Lighter gray placeholder text
      },
    },
    invalid: {
      color: '#FF0000', // Red for invalid input
      iconColor: '#FF0000',
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Limpar mensagens de erro anteriores

    if (!stripe || !elements || subtotal <= 0) {
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
        const userId = session?.user?.id || 'guest';
        const userEmail = session?.user?.email || 'guest@example.com';

        // INÍCIO DA LÓGICA DE ATUALIZAÇÃO DE STOCK COM TRANSAÇÃO
        await runTransaction(db, async (transaction) => {
          // PASSO 1: Realizar TODAS as leituras primeiro
          const productDocs = new Map(); // Para armazenar os snapshots dos produtos

          for (const item of cartItems) {
            const productRef = doc(db, 'products', item.id);
            const productDocSnapshot = await transaction.get(productRef); // LEITURA
            
            if (!productDocSnapshot.exists()) {
              throw new Error(`Produto com ID ${item.id} não encontrado.`);
            }
            productDocs.set(item.id, productDocSnapshot); // Armazenar o snapshot
          }

          // PASSO 2: Depois de TODAS as leituras, realizar TODAS as escritas
          for (const item of cartItems) {
            const productRef = doc(db, 'products', item.id);
            const productDocSnapshot = productDocs.get(item.id); // Obter o snapshot lido anteriormente

            const currentStock = productDocSnapshot.data().stock || {};
            const currentQuantity = currentStock[item.size] || 0;

            if (currentQuantity < item.quantity) {
              // Lançar um erro para reverter a transação se o stock for insuficiente
              throw new Error(`Stock insuficiente para o produto ${item.name} (Tamanho: ${item.size}). Stock disponível: ${currentQuantity}, Necessário: ${item.quantity}`);
            }

            const newStock = {
              ...currentStock,
              [item.size]: currentQuantity - item.quantity,
            };
            transaction.update(productRef, { stock: newStock }); // ESCRITA
          }

          // PASSO 3: Adicionar o pedido na mesma transação para garantir atomicidade
          // É importante usar transaction.set para adicionar um novo documento dentro de uma transação
          const orderRef = doc(collection(db, 'orders')); // Gera uma nova referência de documento com ID automático
          transaction.set(orderRef, {
            userId: userId,
            userEmail: userEmail,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              image: item.image,
            })),
            totalAmount: subtotal,
            orderDate: serverTimestamp(), // Usa o timestamp do servidor
            status: 'completed',
          });
        });
        // FIM DA LÓGICA DE ATUALIZAÇÃO DE STOCK COM TRANSAÇÃO

        setSucceeded(true);
        clearCart(); // Limpa o carrinho após o sucesso da transação
        router.push('/success-page'); // Redireciona para uma página de sucesso
      } catch (e) {
        console.error("Erro ao processar o pedido ou atualizar o stock: ", e);
        // O FirebaseError será e.message diretamente se for lançado na transação
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
      backgroundColor: 'rgba(10, 10, 10, 0.9)', // Dark background
      borderRadius: '15px',
      border: '1px solid #333333', // Dark gray border
      color: '#FFFFFF', // White text
      fontFamily: '"Roboto Mono", sans-serif'
    }}>
      <h2 style={{
        fontSize: '2.2rem',
        fontWeight: 'bold',
        marginBottom: '2.5rem',
        textAlign: 'center',
        color: '#FFFFFF', // White title
      }}>Checkout</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#FFFFFF' }}>Detalhes do Pedido</h3> {/* White heading */}
        {cartItems.length === 0 ? (
          <p style={{ color: '#CCCCCC', textAlign: 'center' }}>O seu carrinho está vazio.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cartItems.map((item) => (
              <li key={item.id + item.size} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.8rem 0',
                borderBottom: '1px dashed #555555', // Subtle dashed dark gray line
                fontSize: '1rem'
              }}>
                <span style={{ color: '#FFFFFF' }}>{item.name} ({item.size}) x {item.quantity}</span>
                <span style={{ color: '#FFFFFF' }}>€{(item.price * item.quantity).toFixed(2)}</span> {/* White price */}
              </li>
            ))}
          </ul>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #555555', // Dark gray border
          fontWeight: 'bold',
          fontSize: '1.3rem',
          color: '#FFFFFF' // White total
        }}>
          <span>Total</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #555555', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.4)' }}> {/* Dark gray border and background */}
        <label htmlFor="card-element" style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>
          Detalhes do Cartão (Teste)
        </label>
        <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || succeeded || subtotal <= 0}
        style={{
          padding: '15px 25px',
          backgroundColor: subtotal <= 0 ? '#333333' : '#8A2BE2', // Purple for active, dark gray for disabled
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

      {errorMessage && <div style={{ color: '#FF0000', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>{errorMessage}</div>} {/* Red error message */}
      {succeeded && <div style={{ color: '#8A2BE2', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>Pagamento processado com sucesso! Redirecionando...</div>} {/* Purple success message */}
    </form>
  );
}

export default CheckoutForm;
