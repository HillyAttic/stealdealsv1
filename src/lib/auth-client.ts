// Firebase Auth client instance
// IMPORTANT: Must use the SAME app instance as firebase.ts to ensure
// consistent auth state. Both files use getApps() singleton pattern.
import { getAuth } from 'firebase/auth';
import { getApps } from 'firebase/app';
import { firestoreApp } from './firestore';

// Ensure we're using the exact same app instance that firebase.ts uses.
// Using different app instances causes auth state to be split.
const app = getApps().length > 0 ? getApps()[0] : firestoreApp;
export const auth = getAuth(app);
