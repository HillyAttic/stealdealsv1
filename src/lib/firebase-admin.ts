import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase - reuse existing app if already initialized
let app;
let database;

try {
  // Reuse existing app instance (singleton pattern) to prevent duplicate apps
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  database = getDatabase(app);
  console.log("[Firebase Admin] ✅ Initialized using app:", app.name || "[DEFAULT]");
} catch (error) {
  console.error("[Firebase Admin] Error initializing Firebase:", error);
}

export { app, database }; 