import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, verifyToken, generateToken } from './jwt';
import { User } from '@/types/auth';
import { setSessionCookies, clearAuthCookies } from '@/lib/security/cookies';
import { updateSessionActivity, isSessionExpired } from '@/lib/security/session-timeout';

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  };
  token: string;
  expiresAt: Date;
}

const SESSION_COOKIE_NAME = 'auth_session';
const USER_COOKIE_NAME = 'auth_user';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Create a session for a user with enhanced security
 */
export function createSession(user: User, response?: NextResponse, rememberMe = false): string {
  const token = generateToken(user);
  
  const sessionData = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    token,
    expiresAt: new Date(Date.now() + COOKIE_MAX_AGE * 1000)
  };

  // Set secure cookies if response is provided
  if (response) {
    setSessionCookies(response, token, user, rememberMe);
  }

  // Initialize session activity tracking
  updateSessionActivity(user.id, token);

  return token;
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const userCookie = cookieStore.get(USER_COOKIE_NAME)?.value;

    if (!token || !userCookie) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const userData = JSON.parse(userCookie);
    
    return {
      user: userData,
      token,
      expiresAt: new Date(payload.exp! * 1000)
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get session from request (for API routes)
 */
export function getSessionFromRequest(request: NextRequest): SessionData | null {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userCookie = request.cookies.get(USER_COOKIE_NAME)?.value;

    if (!token || !userCookie) {
      // Try to get token from Authorization header as fallback
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        const payload = verifyToken(headerToken);
        if (payload) {
          return {
            user: {
              id: payload.userId,
              email: payload.email,
              name: '', // Will need to be fetched from database
              role: payload.role
            },
            token: headerToken,
            expiresAt: new Date(payload.exp! * 1000)
          };
        }
      }
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const userData = JSON.parse(userCookie);
    
    return {
      user: userData,
      token,
      expiresAt: new Date(payload.exp! * 1000)
    };
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Clear session cookies with enhanced security
 */
export function clearSession(response?: NextResponse) {
  if (response) {
    clearAuthCookies(response);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.expiresAt > new Date();
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.user.role === 'admin';
}

/**
 * Require authentication middleware
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session || session.expiresAt <= new Date()) {
    throw new Error('Authentication required');
  }
  
  return session;
}

/**
 * Require admin authentication middleware
 */
export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth();
  
  if (session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return session;
}

/**
 * Check if token needs refresh (within 5 minutes of expiry)
 */
export function shouldRefreshToken(session: SessionData): boolean {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return session.expiresAt <= fiveMinutesFromNow;
}

/**
 * Refresh session token automatically
 */
export async function refreshSessionIfNeeded(session: SessionData): Promise<SessionData | null> {
  if (!shouldRefreshToken(session)) {
    return session; // No refresh needed
  }
  
  try {
    const response = await fetch('/api/auth/user/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('Token refresh failed:', data.error);
      return null;
    }
    
    // Return updated session data
    return {
      user: data.user,
      token: data.token,
      expiresAt: new Date(Date.now() + COOKIE_MAX_AGE * 1000)
    };
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Get session with automatic refresh and timeout checking
 */
export async function getSessionWithRefresh(): Promise<SessionData | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  // Check if session is expired due to timeout
  const timeoutCheck = isSessionExpired(session.token);
  if (timeoutCheck.expired) {
    return null;
  }
  
  // Check if session is expired due to JWT expiry
  if (session.expiresAt <= new Date()) {
    return null;
  }
  
  // Update activity for this check
  updateSessionActivity(session.user.id, session.token);
  
  // Try to refresh if needed
  return await refreshSessionIfNeeded(session);
}