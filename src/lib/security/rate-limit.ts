import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest, prefix = ''): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  
  if (cfConnectingIP) {
    ip = cfConnectingIP;
  } else if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIP) {
    ip = realIP;
  }
  
  return `${prefix}:${ip}`;
}

/**
 * Enhanced rate limiting with progressive penalties
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // Check if currently blocked
  if (record?.blocked && record.blockUntil && now < record.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.blockUntil - now) / 1000)
    };
  }
  
  // Reset or create new record
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false
    };
    rateLimitStore.set(identifier, newRecord);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime
    };
  }
  
  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    // Apply progressive blocking
    const blockDuration = config.blockDurationMs || config.windowMs * 2;
    record.blocked = true;
    record.blockUntil = now + blockDuration;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil(blockDuration / 1000)
    };
  }
  
  // Increment counter
  record.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Rate limiting configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  // Strict limits for authentication endpoints
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block after limit
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours block
  },
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  // More lenient for general API usage
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },
  // Very strict for admin endpoints
  admin: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  }
} as const;

/**
 * Apply rate limiting to authentication endpoints
 */
export function applyAuthRateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  // In development mode, be more lenient with rate limiting
  if (process.env.NODE_ENV === 'development') {
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000
    };
  }
  
  const identifier = getClientIdentifier(request, endpoint);
  const config = RATE_LIMIT_CONFIGS[endpoint];
  
  return checkRateLimit(identifier, config);
}

/**
 * Clean up expired rate limit records (should be called periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    // Remove expired records
    if (now > record.resetTime && (!record.blockUntil || now > record.blockUntil)) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(
  identifier: string
): { count: number; remaining: number; resetTime: number; blocked: boolean } | null {
  const record = rateLimitStore.get(identifier);
  
  if (!record) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if record is expired
  if (now > record.resetTime && (!record.blockUntil || now > record.blockUntil)) {
    rateLimitStore.delete(identifier);
    return null;
  }
  
  return {
    count: record.count,
    remaining: Math.max(0, 100 - record.count), // Assuming default max of 100
    resetTime: record.resetTime,
    blocked: record.blocked && record.blockUntil ? now < record.blockUntil : false
  };
}

// Cleanup expired records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}