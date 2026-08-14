// Firebase Admin SDK initialization
// Delegates to firebase-server-admin.ts which has correct service-account.json loading
import admin from '@/lib/firebase-server-admin';
export { auth, db, database } from '@/lib/firebase-server-admin';
export { admin };

/**
 * Get Firebase Admin instance
 */
export function getFirebaseAdmin(): admin.app.App | null {
  return admin.apps.length > 0 ? admin.apps[0] : null;
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAdminAuth(): admin.auth.Auth | null {
  return admin.apps.length > 0 ? admin.auth() : null;
}

export { isAdminInitialized, getAdminInitStatus } from '@/lib/firebase-server-admin';
