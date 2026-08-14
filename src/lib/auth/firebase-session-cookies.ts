// Server-side Firebase session cookie management
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from './firebase-admin';

const SESSION_COOKIE_NAME = '__session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

export interface FirebaseUserInfo {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
  name: string | undefined;
  picture: string | undefined;
}

/**
 * Create Firebase session cookie from ID token
 * This should be called after successful Firebase Auth on client
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  const adminAuth = getFirebaseAdminAuth();
  
  if (!adminAuth) {
    throw new Error('Firebase Admin Auth not initialized');
  }

  return adminAuth.createSessionCookie(idToken, { 
    expiresIn: SESSION_MAX_AGE * 1000 
  });
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: NextResponse, sessionCookie: string) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Get and verify session cookie from request
 */
export async function verifySessionCookie(request: NextRequest): Promise<FirebaseUserInfo | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    
    if (!adminAuth) {
      console.error('Firebase Admin Auth not initialized');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get session cookie name (for testing)
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}
