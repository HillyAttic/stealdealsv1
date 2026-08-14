// Server-side authentication utilities
// Drop-in replacements for Clerk's auth() and currentUser() functions
import { cookies } from 'next/headers';
import { auth as adminAuth } from '@/lib/firebase-server-admin';
import { getUserByUid } from '@/lib/database/firestore-users';
import { User } from '@/types/auth';

const SESSION_COOKIE_NAME = 'firebase-token';

/**
 * Get current authenticated user from Firebase ID token in cookie
 * Drop-in replacement for Clerk's `auth()` function
 *
 * @returns Object with userId and sessionId (both are the Firebase UID)
 */
export async function auth(): Promise<{ userId: string | null; sessionId: string | null }> {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!idToken) {
      return { userId: null, sessionId: null };
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    return {
      userId: decodedToken.uid,
      sessionId: decodedToken.uid,
    };
  } catch (error) {
    console.error('Error in auth():', error);
    return { userId: null, sessionId: null };
  }
}

/**
 * Get full user object from Firebase session
 * Drop-in replacement for Clerk's `currentUser()` function
 *
 * @returns User object or null if not authenticated
 */
export async function currentUser(): Promise<User | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await getUserByUid(userId);
    return user;
  } catch (error) {
    console.error('Error in currentUser():', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return userId !== null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<{ userId: string; sessionId: string }> {
  const { userId, sessionId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  return { userId, sessionId };
}
