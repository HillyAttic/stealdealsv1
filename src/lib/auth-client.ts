// Firebase Auth client instance
import { getAuth } from 'firebase/auth';
import { firestoreApp } from './firestore';

export const auth = getAuth(firestoreApp);
