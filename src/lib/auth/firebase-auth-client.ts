// Client-side Firebase Auth operations
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth as firebaseAuthInstance } from './firebase-auth';

export const firebaseAuth = firebaseAuthInstance || getAuth();

/**
 * Email/Password sign in
 */
export async function signInWithEmail(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

/**
 * Email/Password sign up
 */
export async function signUpWithEmail(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

/**
 * Google OAuth sign in
 */
export async function signInWithGoogle() {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(firebaseAuth, provider);
}

/**
 * Sign out
 */
export async function firebaseSignOut() {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  return signOut(firebaseAuth);
}

/**
 * Password reset
 */
export async function resetPassword(email: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  return sendPasswordResetEmail(firebaseAuth, email);
}

/**
 * Email verification
 */
export async function sendVerificationEmail() {
  if (!firebaseAuth || !firebaseAuth.currentUser) {
    throw new Error('No user logged in');
  }
  return sendEmailVerification(firebaseAuth.currentUser);
}

/**
 * Verify email with code
 */
export async function verifyEmailCode(code: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized');
  }
  return applyActionCode(firebaseAuth, code);
}

/**
 * Auth state listener
 */
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  if (!firebaseAuth) {
    console.warn('Firebase Auth not initialized, auth state changes will not be tracked');
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  if (!firebaseAuth) {
    return null;
  }
  return firebaseAuth.currentUser;
}

/**
 * Get ID token for current user
 */
export async function getIdToken(): Promise<string | null> {
  if (!firebaseAuth || !firebaseAuth.currentUser) {
    return null;
  }
  return firebaseAuth.currentUser.getIdToken();
}

export type { FirebaseUser };
