/**
 * Security configuration for the application
 */

export const SECURITY_CONFIG = {
  // CSRF Protection
  csrf: {
    enabled: true,
    secret: process.env.CSRF_SECRET || 'default_csrf_secret_change_in_production',
    cookieName: 'csrf_token',
    headerName: 'x-csrf-token',
    skipPaths: [
      '/api/auth/google/callback',
      '/api/auth/check',
      '/api/auth/csrf'
    ]
  },

  // Rate Limiting
  rateLimit: {
    // Authentication endpoints
    auth: {
      login: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
      },
      register: {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
      },
      passwordReset: {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 60 * 60 * 1000, // 1 hour
      }
    },
    // General API endpoints
    api: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
    },
    // Admin endpoints
    admin: {
      maxRequests: 50,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    }
  },

  // Session Management
  session: {
    // Default session configuration
    default: {
      maxIdleTime: 30 * 60 * 1000, // 30 minutes
      maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
      warningTime: 5 * 60 * 1000, // 5 minutes before expiry
      extendOnActivity: true
    },
    // Strict session configuration for sensitive operations
    strict: {
      maxIdleTime: 15 * 60 * 1000, // 15 minutes
      maxSessionTime: 2 * 60 * 60 * 1000, // 2 hours
      warningTime: 2 * 60 * 1000, // 2 minutes before expiry
      extendOnActivity: false
    },
    // Remember me configuration
    rememberMe: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      enabled: true
    }
  },

  // Cookie Security
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
    // Session cookies
    session: {
      name: 'auth_session',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    },
    // User info cookies (readable by client)
    user: {
      name: 'auth_user',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      httpOnly: false
    },
    // CSRF token cookies
    csrf: {
      name: 'csrf_token',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    },
    // Remember me cookies
    rememberMe: {
      name: 'remember_token',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    }
  },

  // Input Sanitization
  sanitization: {
    // Maximum lengths for various inputs
    maxLengths: {
      name: 100,
      email: 254,
      password: 128,
      url: 2048,
      text: 1000,
      phoneNumber: 20
    },
    // Allowed HTML tags for rich text
    allowedHtmlTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedHtmlAttributes: ['href'],
    // SQL injection prevention
    sqlEscapeChars: ["'", ';', '--', '/*', '*/'],
    // NoSQL injection prevention
    allowedMongoOperators: ['$eq', '$ne', '$in', '$nin', '$gt', '$gte', '$lt', '$lte']
  },

  // Security Headers
  headers: {
    // Content Security Policy
    csp: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'", 'https://api.github.com', 'https://accounts.google.com'],
        'frame-src': ["'self'", 'https://accounts.google.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      }
    },
    // Other security headers
    frameOptions: 'DENY',
    contentTypeOptions: 'nosniff',
    xssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()'
  },

  // Password Security
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxLength: 128,
    // bcrypt rounds
    saltRounds: 12
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
    expiresIn: '24h',
    issuer: 'stealdeals-app',
    audience: 'stealdeals-users',
    algorithm: 'HS256' as const
  },

  // Environment-specific settings
  development: {
    // Less strict settings for development
    rateLimit: {
      enabled: false
    },
    csrf: {
      enabled: false
    },
    session: {
      secure: false
    }
  },

  production: {
    // Strict settings for production
    rateLimit: {
      enabled: true
    },
    csrf: {
      enabled: true
    },
    session: {
      secure: true
    },
    // Additional production security
    requireHttps: true,
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  }
} as const;

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const baseConfig = SECURITY_CONFIG;
  const envConfig = process.env.NODE_ENV === 'production' 
    ? SECURITY_CONFIG.production 
    : SECURITY_CONFIG.development;

  return {
    ...baseConfig,
    ...envConfig
  };
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const config = getSecurityConfig();

  // Check JWT secret
  if (config.jwt.secret === 'fallback_jwt_secret_for_development' && process.env.NODE_ENV === 'production') {
    issues.push('JWT_SECRET must be set in production');
  }

  // Check CSRF secret
  if ('secret' in config.csrf && config.csrf.secret === 'default_csrf_secret_change_in_production' && process.env.NODE_ENV === 'production') {
    issues.push('CSRF_SECRET must be set in production');
  }

  // Check HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
      issues.push('HTTPS must be used in production');
    }
  }

  // Check cookie security
  if (process.env.NODE_ENV === 'production' && !config.cookies.secure) {
    issues.push('Secure cookies must be enabled in production');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Security middleware configuration
 */
export const SECURITY_MIDDLEWARE_CONFIG = {
  // Paths that require CSRF protection
  csrfProtectedPaths: [
    '/api/auth/user/login',
    '/api/auth/user/register',
    '/api/auth/google',
    '/api/user',
    '/api/wishlist',
    '/api/admin'
  ],

  // Paths that require rate limiting
  rateLimitedPaths: [
    { path: '/api/auth/user/login', config: 'login' },
    { path: '/api/auth/user/register', config: 'register' },
    { path: '/api/auth/google', config: 'login' },
    { path: '/api/admin', config: 'admin' },
    { path: '/api', config: 'api' }
  ],

  // Paths that require session timeout monitoring
  sessionTimeoutPaths: [
    '/api/user',
    '/api/wishlist',
    '/api/admin',
    '/wishlist',
    '/profile'
  ]
};