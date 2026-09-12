import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration - demo project
const firebaseConfig = {
  apiKey: "demo-key-not-for-production",
  authDomain: "busalert-demo.firebaseapp.com",
  projectId: "busalert-demo",
  storageBucket: "busalert-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890",
  measurementId: "G-ABCDEFGHIJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
export type { User } from "firebase/auth";