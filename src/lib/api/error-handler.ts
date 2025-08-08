import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@/lib/errors/auth-errors';
import { AuthErrorCodes } from '@/types/auth';

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  field?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    },
    { status }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status = 500,
  code?: string,
  field?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      field,
      details,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    },
    { status }
  );
}

/**
 * Handle different types of errors and convert them to standardized responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle AuthError
  if (error instanceof AuthError) {
    return createErrorResponse(
      error.userMessage,
      error.statusCode,
      error.code,
      error.field
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return createErrorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      firstError?.path?.[0]?.toString(),
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    );
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('fetch')) {
      return createErrorResponse(
        'Network error occurred',
        503,
        'NETWORK_ERROR'
      );
    }

    if (error.message.includes('timeout')) {
      return createErrorResponse(
        'Request timed out',
        408,
        'TIMEOUT_ERROR'
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return createErrorResponse(
        'Authentication required',
        401,
        AuthErrorCodes.UNAUTHORIZED
      );
    }

    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return createErrorResponse(
        'Access denied',
        403,
        AuthErrorCodes.UNAUTHORIZED
      );
    }

    // Generic error
    return createErrorResponse(
      error.message || 'An unexpected error occurred',
      500,
      'INTERNAL_ERROR'
    );
  }

  // Handle unknown errors
  return createErrorResponse(
    'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  );
}

/**
 * Wrapper for API route handlers to provide consistent error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: any
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Rate limiting helper (basic implementation) - DEPRECATED
 * Use the enhanced rate limiting from @/lib/security/rate-limit instead
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): boolean {
  console.warn('checkRateLimit is deprecated. Use applyAuthRateLimit from @/lib/security/rate-limit instead');
  
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  method: string,
  url: string,
  status: number,
  duration: number,
  error?: any
) {
  const logData = {
    method,
    url,
    status,
    duration,
    timestamp: new Date().toISOString(),
    error: error ? {
      message: error.message,
      stack: error.stack,
      code: error.code
    } : undefined
  };

  // In production, this would go to a proper logging service
  console.log('API Request:', JSON.stringify(logData));
}