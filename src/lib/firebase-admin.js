// lib/firebase-admin.js
import admin from 'firebase-admin';


const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      
    });
  } else {
    console.warn("FIREBASE_ADMIN_CREDENTIALS not found. Firebase Admin SDK might not be initialized correctly.");
  
  }
}

const dbAdmin = admin.firestore();

export { dbAdmin };