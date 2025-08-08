import { AuthError, AuthErrorCodes, isRetryableError, getUserErrorMessage } from '../auth-errors';

describe('AuthError', () => {
  describe('constructor', () => {
    it('should create an AuthError with correct properties', () => {
      const error = new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
      
      expect(error.name).toBe('AuthError');
      expect(error.code).toBe(AuthErrorCodes.INVALID_CREDENTIALS);
      expect(error.userMessage).toBe('Invalid email or password. Please check your credentials and try again.');
      expect(error.retryable).toBe(true);
      expect(error.statusCode).toBe(401);
    });

    it('should accept custom message and field', () => {
      const customMessage = 'Custom error message';
      const field = 'email';
      const error = new AuthError(AuthErrorCodes.EMAIL_ALREADY_EXISTS, customMessage, field);
      
      expect(error.message).toBe(customMessage);
      expect(error.userMessage).toBe(customMessage);
      expect(error.field).toBe(field);
    });
  });

  describe('fromApiError', () => {
    it('should create AuthError from API error with code', () => {
      const apiError = {
        code: AuthErrorCodes.EMAIL_ALREADY_EXISTS,
        message: 'Email exists',
        field: 'email'
      };
      
      const error = AuthError.fromApiError(apiError);
      
      expect(error.code).toBe(AuthErrorCodes.EMAIL_ALREADY_EXISTS);
      expect(error.message).toBe('Email exists');
      expect(error.field).toBe('email');
    });

    it('should handle HTTP status codes', () => {
      const httpError = { status: 401 };
      const error = AuthError.fromApiError(httpError);
      
      expect(error.code).toBe(AuthErrorCodes.INVALID_CREDENTIALS);
    });

    it('should handle network errors', () => {
      const networkError = new TypeError('fetch failed');
      const error = AuthError.fromApiError(networkError);
      
      expect(error.code).toBe(AuthErrorCodes.INVALID_CREDENTIALS);
      expect(error.message).toContain('Network error');
    });

    it('should handle unknown errors', () => {
      const unknownError = { message: 'Unknown error' };
      const error = AuthError.fromApiError(unknownError);
      
      expect(error.code).toBe(AuthErrorCodes.INVALID_CREDENTIALS);
      expect(error.message).toBe('Unknown error');
    });
  });

  describe('toJSON', () => {
    it('should serialize error correctly', () => {
      const error = new AuthError(AuthErrorCodes.WEAK_PASSWORD);
      const json = error.toJSON();
      
      expect(json).toEqual({
        name: 'AuthError',
        code: AuthErrorCodes.WEAK_PASSWORD,
        message: error.message,
        userMessage: error.userMessage,
        field: 'password',
        retryable: true,
        statusCode: 400
      });
    });
  });
});

describe('isRetryableError', () => {
  it('should return true for retryable AuthError', () => {
    const error = new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for non-retryable AuthError', () => {
    const error = new AuthError(AuthErrorCodes.EMAIL_ALREADY_EXISTS);
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for network errors', () => {
    const networkError = new TypeError('fetch failed');
    expect(isRetryableError(networkError)).toBe(true);
  });

  it('should return true for server errors', () => {
    const serverError = { status: 500 };
    expect(isRetryableError(serverError)).toBe(true);
  });

  it('should return false for client errors', () => {
    const clientError = { status: 400 };
    expect(isRetryableError(clientError)).toBe(false);
  });
});

describe('getUserErrorMessage', () => {
  it('should return user message for AuthError', () => {
    const error = new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
    const message = getUserErrorMessage(error);
    
    expect(message).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('should return user message for error with code', () => {
    const error = { code: AuthErrorCodes.GOOGLE_AUTH_FAILED };
    const message = getUserErrorMessage(error);
    
    expect(message).toBe('Google sign-in failed. Please try again or use email/password.');
  });

  it('should return generic message for unknown error', () => {
    const error = { message: 'Unknown error' };
    const message = getUserErrorMessage(error);
    
    expect(message).toBe('Unknown error');
  });

  it('should return default message for error without message', () => {
    const error = {};
    const message = getUserErrorMessage(error);
    
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});