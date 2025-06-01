// lib/firebase-admin.js
import admin from 'firebase-admin';

// Certifique-se de que a variável de ambiente está formatada como uma string JSON
const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Adicione a URL do seu Database (se você tiver Realtime Database)
      // databaseURL: "https://your-project-id.firebaseio.com",
    });
  } else {
    console.warn("FIREBASE_ADMIN_CREDENTIALS not found. Firebase Admin SDK might not be initialized correctly.");
    // Em produção, você pode querer lançar um erro aqui
  }
}

const dbAdmin = admin.firestore();

export { dbAdmin };