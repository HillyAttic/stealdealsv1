import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionFromRequest, clearSession } from '../session';
import { generateToken, verifyToken } from '../jwt';
import { User } from '@/types/auth';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn()
  }))
}));

describe('Session Management', () => {
  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    provider: 'email',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    preferences: {
      propertyTypes: [],
      priceRange: { min: 0, max: 10000000 },
      locations: [],
      notifications: {
        email: true,
        push: false,
        newProperties: true,
        priceAlerts: true
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSession', () => {
    it('should create a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const payload = verifyToken(token);
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
    });

    it('should create session with response object', () => {
      const mockResponse = {
        cookies: {
          set: vi.fn()
        }
      } as any;

      const token = createSession(mockUser, mockResponse);
      
      expect(token).toBeDefined();
      expect(mockResponse.cookies.set).toHaveBeenCalledTimes(2);
      
      // Check session cookie
      expect(mockResponse.cookies.set).toHaveBeenCalledWith({
        name: 'auth_session',
        value: token,
        httpOnly: true,
        secure: false, // NODE_ENV is not production in tests
        sameSite: 'strict',
        maxAge: 86400, // 24 hours
        path: '/'
      });
      
      // Check user cookie
      expect(mockResponse.cookies.set).toHaveBeenCalledWith({
        name: 'auth_user',
        value: expect.stringContaining(mockUser.id),
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
        maxAge: 86400,
        path: '/'
      });
    });
  });

  describe('getSessionFromRequest', () => {
    it('should extract session from cookies', () => {
      const token = generateToken(mockUser);
      const userCookie = JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });

      const mockRequest = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'auth_session') return { value: token };
            if (name === 'auth_user') return { value: userCookie };
            return undefined;
          })
        },
        headers: {
          get: vi.fn()
        }
      } as any;

      const session = getSessionFromRequest(mockRequest);
      
      expect(session).toBeDefined();
      expect(session?.user.id).toBe(mockUser.id);
      expect(session?.user.email).toBe(mockUser.email);
      expect(session?.token).toBe(token);
    });

    it('should extract session from Authorization header', () => {
      const token = generateToken(mockUser);

      const mockRequest = {
        cookies: {
          get: vi.fn(() => undefined)
        },
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'Authorization') return `Bearer ${token}`;
            return null;
          })
        }
      } as any;

      const session = getSessionFromRequest(mockRequest);
      
      expect(session).toBeDefined();
      expect(session?.user.id).toBe(mockUser.id);
      expect(session?.token).toBe(token);
    });

    it('should return null for invalid token', () => {
      const mockRequest = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'auth_session') return { value: 'invalid-token' };
            if (name === 'auth_user') return { value: '{}' };
            return undefined;
          })
        },
        headers: {
          get: vi.fn()
        }
      } as any;

      const session = getSessionFromRequest(mockRequest);
      expect(session).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear session cookies', () => {
      const mockResponse = {
        cookies: {
          set: vi.fn()
        }
      } as any;

      clearSession(mockResponse);

      expect(mockResponse.cookies.set).toHaveBeenCalledTimes(2);
      
      // Check session cookie is cleared
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'auth_session',
        '',
        expect.objectContaining({
          maxAge: 0,
          path: '/'
        })
      );
      
      // Check user cookie is cleared
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'auth_user',
        '',
        expect.objectContaining({
          maxAge: 0,
          path: '/',
          httpOnly: false
        })
      );
    });
  });

  describe('Token expiration', () => {
    it('should handle expired tokens', () => {
      // Create a token that expires immediately
      const expiredToken = generateToken(mockUser);
      
      // Mock the JWT to be expired
      vi.mock('../jwt', () => ({
        verifyToken: vi.fn(() => null), // Simulate expired token
        generateToken: vi.fn(() => expiredToken)
      }));

      const mockRequest = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'auth_session') return { value: expiredToken };
            return undefined;
          })
        },
        headers: {
          get: vi.fn()
        }
      } as any;

      const session = getSessionFromRequest(mockRequest);
      expect(session).toBeNull();
    });
  });
});

describe('JWT Token Management', () => {
  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    provider: 'email',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    preferences: {
      propertyTypes: [],
      priceRange: { min: 0, max: 10000000 },
      locations: [],
      notifications: {
        email: true,
        push: false,
        newProperties: true,
        priceAlerts: true
      }
    }
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = verifyToken('not.a.jwt');
      expect(payload).toBeNull();
    });
  });
});