'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import BackgroundAnimation from '../components/Background' // Ajuste o caminho se necessário
import { useCart } from '@/components/cartcontext';
import Link from 'next/link';

// Certifique-se de que NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY está no seu .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
    const { cartItems } = useCart();

    // Redireciona ou exibe uma mensagem se o carrinho estiver vazio
    if (cartItems.length === 0) {
        return (
            <>
                <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
                <div style={{
                    color: 'white',
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: '"Roboto Mono", serif',
                    zIndex: 2,
                    position: 'relative'
                }}>
                    <h1>Seu carrinho está vazio!</h1>
                    <p>Adicione produtos antes de finalizar a compra.</p>
                    <Link href="/home" style={{ color: '#007bff', textDecoration: 'underline', marginTop: '1rem', fontSize: '1.1rem' }}>
                        Voltar para a Loja
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
            <div style={{ zIndex: 2, position: 'relative' }}>
                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            </div>
        </>
    );
}