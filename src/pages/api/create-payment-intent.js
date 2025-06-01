// pages/api/create-payment-intent.js
import Stripe from 'stripe';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { amount, cartItems, userId, userName, userEmail } = req.body; // userName e userEmail já virão como null, se necessário

    if (!amount || amount <= 0 || !cartItems || cartItems.length === 0 || !userId) {
      return res.status(400).json({ error: { message: 'Dados do pedido inválidos ou incompletos.' } });
    }

    try {
      // 1. Crie o PaymentIntent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
            userId: userId,
            userName: userName || 'N/A', // Fallback para string se ainda for null por algum motivo
            userEmail: userEmail || 'N/A', // Fallback para string se ainda for null por algum motivo
            cart_summary: JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.quantity, size: item.size })))
        },
      });

      // 2. Salve o pedido no Firestore (status inicial 'pending')
      const orderData = {
        userId: userId,
        userName: userName, // Este já deve ser null ou string
        userEmail: userEmail, // Este já deve ser null ou string
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image
        })),
        totalAmount: amount / 100,
        paymentIntentId: paymentIntent.id,
        status: 'pending',
        orderDate: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('Pedido criado com ID: ', orderRef.id, ' e status pending.');

      // 3. Decrementar o stock dos produtos no Firebase usando uma transação
      const stockUpdatePromises = cartItems.map(async (item) => {
        const productRef = doc(db, 'products', item.id);
        await runTransaction(db, async (transaction) => {
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw new Error(`Produto com ID ${item.id} não encontrado.`);
          }

          const currentStock = productDoc.data().stock || {};
          const newStock = { ...currentStock };

          if (typeof newStock[item.size] === 'undefined' || newStock[item.size] < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name} (Tamanho: ${item.size}). Disponível: ${newStock[item.size] || 0}, Necessário: ${item.quantity}`);
          }

          newStock[item.size] -= item.quantity;

          transaction.update(productRef, { stock: newStock });
        });
      });

      await Promise.all(stockUpdatePromises);
      console.log('Stock dos produtos atualizado com sucesso.');

      res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
      console.error('Erro no processo de pagamento/stock:', error);
      res.status(500).json({ error: { message: error.message || 'Erro interno do servidor.' } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}