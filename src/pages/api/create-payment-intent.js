// pages/api/create-payment-intent.js
import Stripe from 'stripe';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { amount, cartItems, userId, userName, userEmail } = req.body; 

  // --- MELHORIA DE VALIDAÇÃO ---
  // Validação forte no servidor para garantir que todos os dados essenciais existem
  if (!amount || amount <= 0 || !cartItems || cartItems.length === 0 || !userId) {
    return res.status(400).json({ error: { message: 'Dados do pedido inválidos ou incompletos. O ID do utilizador é obrigatório.' } });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        userName,
        userEmail,
        cart_summary: JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.quantity, size: item.size })))
      },
    });

    // --- CORREÇÃO FINAL CONFIRMADA ---
    // Criação dos dados do pedido para guardar no Firestore
    const orderData = {
      userId,
      userName,
      userEmail,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image || null // Usa a propriedade 'image' singular
      })),
      totalAmount: amount / 100,
      paymentIntentId: paymentIntent.id,
      status: 'pending', // O status será atualizado pelo webhook do Stripe
      orderDate: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Pedido criado com ID: ', orderRef.id);

    // Atualização de stock (esta parte estava correta)
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.id);
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error(`Produto com ID ${item.id} não encontrado.`);
        
        const currentStock = productDoc.data().stock || {};
        const newStock = { ...currentStock };
        const availableStock = newStock[item.size] || 0;

        if (availableStock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.name} (Tamanho: ${item.size}).`);
        }
        
        newStock[item.size] = availableStock - item.quantity;
        transaction.update(productRef, { stock: newStock });
      });
    }

    console.log('Stock dos produtos atualizado com sucesso.');
    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Erro no processo de pagamento/stock:', error);
    res.status(500).json({ error: { message: error.message || 'Erro interno do servidor.' } });
  }
}