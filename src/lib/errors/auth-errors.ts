import { AuthErrorCodes } from '@/types/auth';

// Re-export AuthErrorCodes for easier importing
export { AuthErrorCodes };

export interface AuthErrorDetails {
  code: AuthErrorCodes;
  message: string;
  userMessage: string;
  field?: string;
  retryable: boolean;
  statusCode: number;
}

// Map of error codes to user-friendly messages and metadata
export const AUTH_ERROR_MAP: Record<AuthErrorCodes, Omit<AuthErrorDetails, 'code'>> = {
  [AuthErrorCodes.INVALID_CREDENTIALS]: {
    message: 'Invalid email or password provided',
    userMessage: 'Invalid email or password. Please check your credentials and try again.',
    retryable: true,
    statusCode: 401
  },
  [AuthErrorCodes.EMAIL_ALREADY_EXISTS]: {
    message: 'An account with this email already exists',
    userMessage: 'An account with this email already exists. Please sign in instead or use a different email.',
    field: 'email',
    retryable: false,
    statusCode: 409
  },
  [AuthErrorCodes.WEAK_PASSWORD]: {
    message: 'Password does not meet security requirements',
    userMessage: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
    field: 'password',
    retryable: true,
    statusCode: 400
  },
  [AuthErrorCodes.GOOGLE_AUTH_FAILED]: {
    message: 'Google authentication failed',
    userMessage: 'Google sign-in failed. Please try again or use email/password.',
    retryable: true,
    statusCode: 401
  },
  [AuthErrorCodes.TOKEN_EXPIRED]: {
    message: 'Authentication token has expired',
    userMessage: 'Your session has expired. Please sign in again.',
    retryable: false,
    statusCode: 401
  },
  [AuthErrorCodes.UNAUTHORIZED]: {
    message: 'User is not authorized to perform this action',
    userMessage: 'You are not authorized to perform this action. Please sign in.',
    retryable: false,
    statusCode: 403
  }
};

export class AuthError extends Error {
  public readonly code: AuthErrorCodes;
  public readonly userMessage: string;
  public readonly field?: string;
  public readonly retryable: boolean;
  public readonly statusCode: number;

  constructor(code: AuthErrorCodes, customMessage?: string, field?: string) {
    const errorDetails = AUTH_ERROR_MAP[code];
    const message = customMessage || errorDetails.message;
    
    super(message);
    
    this.name = 'AuthError';
    this.code = code;
    this.userMessage = customMessage || errorDetails.userMessage;
    this.field = field || errorDetails.field;
    this.retryable = errorDetails.retryable;
    this.statusCode = errorDetails.statusCode;
  }

  static fromApiError(error: any): AuthError {
    // Handle abort errors
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Request was cancelled. Please try again.'
      );
    }

    // Handle API response errors
    if (error.code && Object.values(AuthErrorCodes).includes(error.code)) {
      return new AuthError(error.code, error.message, error.field);
    }

    // Handle HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 401:
          return new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
        case 403:
          return new AuthError(AuthErrorCodes.UNAUTHORIZED);
        case 409:
          return new AuthError(AuthErrorCodes.EMAIL_ALREADY_EXISTS);
        default:
          return new AuthError(AuthErrorCodes.INVALID_CREDENTIALS, error.message);
      }
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS, 
        'Network error. Please check your connection and try again.'
      );
    }

    // Default fallback
    return new AuthError(
      AuthErrorCodes.INVALID_CREDENTIALS, 
      error.message || 'An unexpected error occurred. Please try again.'
    );
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      field: this.field,
      retryable: this.retryable,
      statusCode: this.statusCode
    };
  }
}

// Utility function to check if an error is retryable
export const isRetryableError = (error: any): boolean => {
  if (error instanceof AuthError) {
    return error.retryable;
  }
  
  // Network errors are generally retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (error.status >= 500) {
    return true;
  }
  
  return false;
};

// Utility function to get user-friendly error message
export const getUserErrorMessage = (error: any): string => {
  if (error instanceof AuthError) {
    return error.userMessage;
  }
  
  if (error.code && AUTH_ERROR_MAP[error.code as AuthErrorCodes]) {
    return AUTH_ERROR_MAP[error.code as AuthErrorCodes].userMessage;
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};