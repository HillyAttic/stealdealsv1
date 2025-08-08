import { isRetryableError } from '@/lib/errors/auth-errors';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: any) => isRetryableError(error),
  onRetry: () => {}
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Check if we should retry this error
      if (!opts.retryCondition(error, attempt)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      // Call retry callback
      opts.onRetry(error, attempt);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts
  };
}

/**
 * Retry specifically for API calls with authentication
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const result = await withRetry(async () => {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).code = errorData.code;
      (error as any).field = errorData.field;
      throw error;
    }
    
    return response.json();
  }, {
    ...options,
    retryCondition: (error: any, attempt: number) => {
      // Don't retry client errors (4xx) except for specific cases
      if (error.status >= 400 && error.status < 500) {
        // Retry on 408 (timeout), 429 (rate limit), and network errors
        return error.status === 408 || error.status === 429 || !error.status;
      }
      
      // Retry server errors (5xx) and network errors
      return error.status >= 500 || !error.status;
    }
  });
  
  return result;
}

/**
 * Create a retry wrapper for a function
 */
export function createRetryWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return async (...args: T): Promise<RetryResult<R>> => {
    return withRetry(() => fn(...args), options);
  };
}