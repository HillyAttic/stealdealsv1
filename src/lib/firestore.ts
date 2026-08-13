// Firestore client SDK initialization for StealDeals app
// Phase 1.1: RTDB → Firestore migration — new Firestore instance alongside existing RTDB
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Same Firebase project config — Firestore shares the project with RTDB
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Reuse the existing app instance if already initialized (singleton pattern)
const firestoreApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const firestoreDb: Firestore = getFirestore(firestoreApp);
const firestoreAuth = getAuth(firestoreApp);
const firestoreStorage = getStorage(firestoreApp);

export { firestoreApp, firestoreDb, firestoreAuth, firestoreStorage };
export default firestoreDb;
