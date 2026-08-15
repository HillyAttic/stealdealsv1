import { cookies } from 'next/headers';
import { auth as adminAuth } from '@/lib/firebase-server-admin';

export interface ServerSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Get the current user session from Firebase ID token in cookies
 * Use this in Server Components and API routes
 */
export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('firebase-token')?.value;

    if (!idToken) {
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    // Optimization: Skip getUser() call - we only need uid for wishlist operations
    // If email/displayName needed, can add optional param to fetch user profile
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}
