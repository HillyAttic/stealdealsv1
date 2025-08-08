import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration - using values from next.config.mjs env section
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCVT3Fv_tWM8FuZ9hHnsdGmdfhp-uow_bg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "stealdeals-e89ab.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "stealdeals-e89ab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stealdeals-e89ab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "836598569233",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:836598569233:web:a46668a6e140493d6f14b0",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-71EPMH0ZW9"
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key_here") {
  console.warn('Firebase configuration is using default values. Authentication may not work properly.');
}

// Initialize Firebase app with error handling
let app;
let auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock objects to prevent runtime errors
  auth = null;
}

export { auth };

