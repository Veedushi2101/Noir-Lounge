import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGm7UIjVrgu4jftcoeYcQYNMNblTx-Uk0",
  authDomain: "cafe-booking-app-4ae1f.firebaseapp.com",
  projectId: "cafe-booking-app-4ae1f",
  storageBucket: "cafe-booking-app-4ae1f.firebasestorage.app",
  messagingSenderId: "229206147320",
  appId: "1:229206147320:web:cc254b6f49e100ecebfb0d",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
