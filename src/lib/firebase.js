// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
    apiKey: "AIzaSyAfIN0TZ5UFPsW6rYCHjb7PsZ0UmOhF9xI",
    authDomain: "exclusive-drop.firebaseapp.com",
    projectId: "exclusive-drop",
    storageBucket: "exclusive-drop.firebasestorage.app",
    messagingSenderId: "622902313111",
    appId: "1:622902313111:web:1137e1da4d94bfe04ee9d2"
  };
  

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

