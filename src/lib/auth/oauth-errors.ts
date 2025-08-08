import { AuthErrorCodes } from '@/types/auth';

export interface OAuthError {
  code: AuthErrorCodes;
  message: string;
  field?: string;
  details?: any;
}

/**
 * OAuth error types from Google
 */
export enum GoogleOAuthErrorTypes {
  ACCESS_DENIED = 'access_denied',
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope'
}

/**
 * Map Google OAuth errors to our error codes
 */
export function mapGoogleOAuthError(googleError: string): OAuthError {
  switch (googleError) {
    case GoogleOAuthErrorTypes.ACCESS_DENIED:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Access denied. Please grant permission to continue.',
      };
    
    case GoogleOAuthErrorTypes.INVALID_REQUEST:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Invalid request. Please try again.',
      };
    
    case GoogleOAuthErrorTypes.INVALID_CLIENT:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'OAuth configuration error. Please contact support.',
      };
    
    case GoogleOAuthErrorTypes.INVALID_GRANT:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Authorization code expired. Please try again.',
      };
    
    case GoogleOAuthErrorTypes.UNAUTHORIZED_CLIENT:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Unauthorized client. Please contact support.',
      };
    
    case GoogleOAuthErrorTypes.UNSUPPORTED_GRANT_TYPE:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Unsupported authentication method.',
      };
    
    case GoogleOAuthErrorTypes.INVALID_SCOPE:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Invalid permissions requested.',
      };
    
    default:
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Google authentication failed. Please try again.',
      };
  }
}

/**
 * Handle Firebase Auth errors
 */
export function mapFirebaseAuthError(error: any): OAuthError {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  switch (errorCode) {
    case 'auth/invalid-credential':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Invalid Google credentials. Please try again.',
      };
    
    case 'auth/user-disabled':
      return {
        code: AuthErrorCodes.UNAUTHORIZED,
        message: 'This Google account has been disabled.',
      };
    
    case 'auth/user-not-found':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Google account not found.',
      };
    
    case 'auth/wrong-password':
      return {
        code: AuthErrorCodes.INVALID_CREDENTIALS,
        message: 'Invalid Google credentials.',
      };
    
    case 'auth/too-many-requests':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Too many failed attempts. Please try again later.',
      };
    
    case 'auth/network-request-failed':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Network error. Please check your connection and try again.',
      };
    
    case 'auth/popup-blocked':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Popup blocked. Please allow popups and try again.',
      };
    
    case 'auth/popup-closed-by-user':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Authentication cancelled. Please try again.',
      };
    
    case 'auth/cancelled-popup-request':
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Authentication cancelled. Please try again.',
      };
    
    default:
      console.error('Unmapped Firebase Auth error:', { errorCode, errorMessage });
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Google authentication failed. Please try again.',
        details: { errorCode, errorMessage }
      };
  }
}

/**
 * Handle token exchange errors
 */
export function mapTokenExchangeError(error: any): OAuthError {
  if (error?.response?.status === 400) {
    const errorData = error.response.data;
    if (errorData?.error === 'invalid_grant') {
      return {
        code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
        message: 'Authorization code expired. Please try again.',
      };
    }
  }
  
  if (error?.response?.status === 401) {
    return {
      code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
      message: 'Invalid OAuth credentials. Please contact support.',
    };
  }
  
  return {
    code: AuthErrorCodes.GOOGLE_AUTH_FAILED,
    message: 'Failed to exchange authorization code. Please try again.',
    details: error?.message
  };
}

/**
 * Create user-friendly error message
 */
export function createUserFriendlyErrorMessage(error: OAuthError): string {
  const baseMessage = error.message;
  
  // Add helpful suggestions based on error type
  switch (error.code) {
    case AuthErrorCodes.GOOGLE_AUTH_FAILED:
      return `${baseMessage} If the problem persists, try clearing your browser cache or using a different browser.`;
    
    case AuthErrorCodes.UNAUTHORIZED:
      return `${baseMessage} Please contact support if you believe this is an error.`;
    
    case AuthErrorCodes.EMAIL_ALREADY_EXISTS:
      return `${baseMessage} You can sign in with your existing account instead.`;
    
    default:
      return baseMessage;
  }
}

/**
 * Log OAuth errors for monitoring
 */
export function logOAuthError(error: OAuthError, context: {
  userId?: string;
  email?: string;
  provider: string;
  action: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  console.error('OAuth Error:', {
    error,
    context,
    timestamp: new Date().toISOString()
  });
  
  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, etc.
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(receivedState: string | null, expectedState: string | null): boolean {
  if (!expectedState && !receivedState) {
    return true; // Both null is valid
  }
  
  if (!expectedState || !receivedState) {
    return false; // One is null, the other isn't
  }
  
  return receivedState === expectedState;
}

/**
 * Generate secure OAuth state parameter
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}