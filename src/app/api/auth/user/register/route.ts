import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { createUser, getUserByEmail } from '@/lib/database/mock-users';
import { createSession } from '@/lib/auth/session';
import { User } from '@/types/auth';
import { withCSRFProtection } from '@/lib/security/csrf';
import { applyAuthRateLimit } from '@/lib/security/rate-limit';
import { sanitizeRegistrationData } from '@/lib/security/sanitization';
import { setSessionCookies } from '@/lib/security/cookies';
import { updateSessionActivity } from '@/lib/security/session-timeout';
import { withErrorHandling } from '@/lib/api/error-handler';

async function registerHandler(request: NextRequest) {
  // Enhanced rate limiting
  const rateLimitResult = applyAuthRateLimit(request, 'register');
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: 'Too many registration attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimitResult.retryAfter
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '3');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
    
    return response;
  }

  const body = await request.json();
  
  // Validate request data
  const validationResult = registerSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      },
      { status: 400 }
    );
  }
  
  // Sanitize input data
  const { name, email, password } = sanitizeRegistrationData(validationResult.data);
    
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Email already exists',
        field: 'email'
      },
      { status: 409 }
    );
  }
    
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user data
  const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    provider: 'email',
    role: 'user',
    isActive: true,
    emailVerified: false,
    lastLoginAt: new Date(),
    preferences: {
      propertyTypes: [],
      priceRange: {
        min: 0,
        max: 10000000
      },
      locations: [],
      notifications: {
        email: true,
        push: false,
        newProperties: true,
        priceAlerts: true
      }
    }
  };
  
  // Create user in database
  const newUser = await createUser(userData);
  
  // Create response
  const response = NextResponse.json({
    success: true,
    token: '', // Will be set by createSession
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
      preferences: newUser.preferences
    }
  });
  
  // Create session and set secure cookies
  const token = createSession(newUser, response);
  
  // Set enhanced secure cookies
  setSessionCookies(response, token, newUser, false);
  
  // Update session activity tracking
  updateSessionActivity(newUser.id, token);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '3');
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  // Update response with token
  const responseData = await response.json();
  responseData.token = token;
  
  return NextResponse.json(responseData);
}

export const POST = withErrorHandling(withCSRFProtection(registerHandler));