import { NextResponse } from 'next/server';

export interface SecureCookieOptions {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

/**
 * Default secure cookie configuration
 */
export const DEFAULT_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours
};

/**
 * Session cookie configuration
 */
export const SESSION_COOKIE_CONFIG = {
  ...DEFAULT_COOKIE_CONFIG,
  name: 'auth_session',
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

/**
 * User info cookie configuration (readable by client)
 */
export const USER_COOKIE_CONFIG = {
  ...DEFAULT_COOKIE_CONFIG,
  name: 'auth_user',
  httpOnly: false, // Needs to be readable by client
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

/**
 * CSRF token cookie configuration
 */
export const CSRF_COOKIE_CONFIG = {
  ...DEFAULT_COOKIE_CONFIG,
  name: 'csrf_token',
  maxAge: 60 * 60 * 24 // 24 hours
};

/**
 * Remember me cookie configuration
 */
export const REMEMBER_ME_COOKIE_CONFIG = {
  ...DEFAULT_COOKIE_CONFIG,
  name: 'remember_token',
  maxAge: 60 * 60 * 24 * 30 // 30 days
};

/**
 * Set a secure cookie with proper configuration
 */
export function setSecureCookie(
  response: NextResponse,
  options: SecureCookieOptions
): void {
  const config = {
    ...DEFAULT_COOKIE_CONFIG,
    ...options
  };
  
  response.cookies.set(config);
}

/**
 * Set session cookies with enhanced security
 */
export function setSessionCookies(
  response: NextResponse,
  sessionToken: string,
  userData: any,
  rememberMe = false
): void {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days vs 7 days
  
  // Set session token cookie (HTTP-only)
  setSecureCookie(response, {
    name: SESSION_COOKIE_CONFIG.name,
    value: sessionToken,
    maxAge,
    httpOnly: true
  });
  
  // Set user info cookie (readable by client)
  setSecureCookie(response, {
    name: USER_COOKIE_CONFIG.name,
    value: JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar
    }),
    maxAge,
    httpOnly: false
  });
  
  // Set remember me token if requested
  if (rememberMe) {
    setSecureCookie(response, {
      name: REMEMBER_ME_COOKIE_CONFIG.name,
      value: sessionToken,
      maxAge: REMEMBER_ME_COOKIE_CONFIG.maxAge
    });
  }
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(response: NextResponse): void {
  const cookieNames = [
    SESSION_COOKIE_CONFIG.name,
    USER_COOKIE_CONFIG.name,
    REMEMBER_ME_COOKIE_CONFIG.name,
    CSRF_COOKIE_CONFIG.name
  ];
  
  cookieNames.forEach(name => {
    response.cookies.set({
      name,
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  });
}

/**
 * Validate cookie security settings
 */
export function validateCookieSecurity(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Ensure secure flag is set in production
    if (!DEFAULT_COOKIE_CONFIG.secure) {
      issues.push('Secure flag should be enabled in production');
    }
    
    // Check for HTTPS
    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
      issues.push('HTTPS should be used in production');
    }
  }
  
  // Check SameSite setting
  if (DEFAULT_COOKIE_CONFIG.sameSite !== 'strict') {
    issues.push('SameSite should be set to strict for maximum security');
  }
  
  // Check session duration
  if (SESSION_COOKIE_CONFIG.maxAge > 60 * 60 * 24 * 7) {
    issues.push('Session duration should not exceed 7 days');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Cookie security headers
 */
export const COOKIE_SECURITY_HEADERS = {
  'Set-Cookie': [
    'HttpOnly',
    'Secure',
    'SameSite=Strict'
  ].join('; ')
};

/**
 * Generate secure cookie signature
 */
export function generateCookieSignature(
  value: string,
  secret: string
): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('hex');
}

/**
 * Verify cookie signature
 */
export function verifyCookieSignature(
  value: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateCookieSignature(value, secret);
  return signature === expectedSignature;
}

/**
 * Create signed cookie value
 */
export function createSignedCookie(
  value: string,
  secret: string
): string {
  const signature = generateCookieSignature(value, secret);
  return `${value}.${signature}`;
}

/**
 * Parse signed cookie value
 */
export function parseSignedCookie(
  signedValue: string,
  secret: string
): string | null {
  const lastDotIndex = signedValue.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    return null;
  }
  
  const value = signedValue.substring(0, lastDotIndex);
  const signature = signedValue.substring(lastDotIndex + 1);
  
  if (!verifyCookieSignature(value, signature, secret)) {
    return null;
  }
  
  return value;
}