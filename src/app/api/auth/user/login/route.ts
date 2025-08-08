import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { getUserByEmail, updateUser } from '@/lib/database/mock-users';
import { createSession } from '@/lib/auth/session';
import { 
  withErrorHandling, 
  validateRequestBody, 
  createSuccessResponse,
  checkRateLimit,
  getClientIP,
  logApiRequest
} from '@/lib/api/error-handler';
import { AuthError } from '@/lib/errors/auth-errors';
import { AuthErrorCodes } from '@/types/auth';
import { withCSRFProtection } from '@/lib/security/csrf';
import { applyAuthRateLimit } from '@/lib/security/rate-limit';
import { sanitizeLoginData } from '@/lib/security/sanitization';
import { setSessionCookies } from '@/lib/security/cookies';
import { updateSessionActivity } from '@/lib/security/session-timeout';

async function loginHandler(request: NextRequest) {
  const startTime = Date.now();
  
  // Enhanced rate limiting
  const rateLimitResult = applyAuthRateLimit(request, 'login');
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please try again later.',
        code: AuthErrorCodes.INVALID_CREDENTIALS,
        retryAfter: rateLimitResult.retryAfter
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
    
    return response;
  }
  
  // Validate and sanitize request body
  const rawData = await validateRequestBody(request, loginSchema);
  const { email, password } = sanitizeLoginData(rawData as { email: string; password: string });
  
  // Find user by email
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AuthError(
      AuthErrorCodes.UNAUTHORIZED,
      'Account is deactivated. Please contact support.'
    );
  }
  
  // Verify password
  if (!user.password) {
    throw new AuthError(
      AuthErrorCodes.INVALID_CREDENTIALS,
      'Invalid credentials. Please use Google sign-in for this account.'
    );
  }
  
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorCodes.INVALID_CREDENTIALS);
  }
  
  // Update last login time
  const updatedUser = await updateUser(user.id, {
    lastLoginAt: new Date()
  });
  
  // Create response data
  const responseData = {
    token: '', // Will be set by createSession
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      lastLoginAt: updatedUser.lastLoginAt,
      preferences: updatedUser.preferences
    }
  };
  
  // Create response
  const response = createSuccessResponse(responseData, 'Login successful');
  
  // Create session and set secure cookies
  const token = createSession(updatedUser, response);
  
  // Set enhanced secure cookies
  setSessionCookies(response, token, updatedUser, false);
  
  // Update session activity tracking
  updateSessionActivity(updatedUser.id, token);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '5');
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  // Update response with token
  const finalResponseData = await response.json();
  finalResponseData.data.token = token;
  
  // Log successful request
  logApiRequest('POST', '/api/auth/user/login', 200, Date.now() - startTime);
  
  return NextResponse.json(finalResponseData);
}

export const POST = withErrorHandling(withCSRFProtection(loginHandler));