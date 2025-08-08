import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create CSRF token hash for validation
 */
function hashCSRFToken(token: string, secret: string): string {
  return createHash('sha256').update(token + secret).digest('hex');
}

/**
 * Get CSRF secret from environment or generate one
 */
function getCSRFSecret(): string {
  return process.env.CSRF_SECRET || 'default_csrf_secret_change_in_production';
}

/**
 * Set CSRF token in response cookies
 */
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  const secret = getCSRFSecret();
  const hashedToken = hashCSRFToken(token, secret);
  
  // Set HTTP-only cookie with the hashed token
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: hashedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  });
  
  // Return the plain token to be used in forms/headers
  return token;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  try {
    // Get token from header or body
    const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME);
    let tokenFromBody = null;
    
    // For form data, we might need to parse the body
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // For JSON requests, token should be in header
      if (!tokenFromHeader) {
        return false;
      }
    }
    
    const token = tokenFromHeader || tokenFromBody;
    if (!token) {
      return false;
    }
    
    // Get hashed token from cookie
    const hashedTokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (!hashedTokenFromCookie) {
      return false;
    }
    
    // Hash the provided token and compare
    const secret = getCSRFSecret();
    const expectedHash = hashCSRFToken(token, secret);
    
    return hashedTokenFromCookie === expectedHash;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF for GET requests (they should be safe)
    if (request.method === 'GET') {
      return handler(request);
    }
    
    // Skip CSRF for OAuth callbacks and other safe endpoints
    const pathname = new URL(request.url).pathname;
    const skipCSRFPaths = [
      '/api/auth/google/callback',
      '/api/auth/check'
    ];
    
    if (skipCSRFPaths.some(path => pathname.includes(path))) {
      return handler(request);
    }
    
    // In development mode, be more lenient with CSRF
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSRF protection bypassed in development mode');
    } else {
      // Validate CSRF token in production
      if (!validateCSRFToken(request)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID'
          },
          { status: 403 }
        );
      }
    }
    
    return handler(request);
  };
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFTokenForClient(): Promise<string> {
  try {
    const response = await fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
}