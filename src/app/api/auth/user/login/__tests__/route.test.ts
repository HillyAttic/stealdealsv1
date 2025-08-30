import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock dependencies
jest.mock('@/lib/validations/auth', () => ({
  loginSchema: {
    safeParse: jest.fn()
  }
}))

jest.mock('@/lib/auth/password', () => ({
  verifyPassword: jest.fn()
}))

jest.mock('@/lib/database/mock-users', () => ({
  getUserByEmail: jest.fn(),
  updateUser: jest.fn()
}))

jest.mock('@/lib/auth/session', () => ({
  createSession: jest.fn()
}))

jest.mock('@/lib/api/error-handler', () => ({
  withErrorHandling: jest.fn((handler) => handler),
  validateRequestBody: jest.fn(),
  createSuccessResponse: jest.fn(),
  logApiRequest: jest.fn()
}))

jest.mock('@/lib/errors/auth-errors', () => ({
  AuthError: class AuthError extends Error {
    constructor(public code: string, message?: string) {
      super(message || code)
      this.name = 'AuthError'
    }
  }
}))

jest.mock('@/lib/security/csrf', () => ({
  withCSRFProtection: jest.fn((handler) => handler)
}))

jest.mock('@/lib/security/rate-limit', () => ({
  applyAuthRateLimit: jest.fn()
}))

jest.mock('@/lib/security/sanitization', () => ({
  sanitizeLoginData: jest.fn()
}))

jest.mock('@/lib/security/cookies', () => ({
  setSessionCookies: jest.fn()
}))

jest.mock('@/lib/security/session-timeout', () => ({
  updateSessionActivity: jest.fn()
}))

describe('/api/auth/user/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login user with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })

    // Mock request body validation
    const { validateRequestBody } = await import('@/lib/api/error-handler')
    jest.mocked(validateRequestBody).mockResolvedValue(loginData)

    // Mock sanitization
    const { sanitizeLoginData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeLoginData).mockReturnValue(loginData)

    // Mock user exists and is active
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: loginData.email,
      password: 'hashed-password',
      provider: 'email',
      role: 'user',
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
    }

    const { getUserByEmail, updateUser } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(mockUser)
    jest.mocked(updateUser).mockResolvedValue({
      ...mockUser,
      lastLoginAt: new Date()
    })

    // Mock password verification
    const { verifyPassword } = await import('@/lib/auth/password')
    jest.mocked(verifyPassword).mockResolvedValue(true)

    // Mock session creation
    const { createSession } = await import('@/lib/auth/session')
    jest.mocked(createSession).mockReturnValue('jwt-token')

    // Mock success response
    const { createSuccessResponse } = await import('@/lib/api/error-handler')
    const mockResponse = new Response(JSON.stringify({
      success: true,
      data: {
        token: 'jwt-token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          createdAt: mockUser.createdAt,
          lastLoginAt: mockUser.lastLoginAt,
          preferences: mockUser.preferences
        }
      },
      message: 'Login successful'
    }))
    jest.mocked(createSuccessResponse).mockReturnValue(mockResponse)

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe(loginData.email)
    expect(data.data.token).toBe('jwt-token')
    expect(verifyPassword).toHaveBeenCalledWith(loginData.password, mockUser.password)
    expect(updateUser).toHaveBeenCalledWith(mockUser.id, {
      lastLoginAt: expect.any(Date)
    })
  })

  it('should reject login with invalid email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })

    // Mock request body validation
    const { validateRequestBody } = await import('@/lib/api/error-handler')
    jest.mocked(validateRequestBody).mockResolvedValue(loginData)

    // Mock sanitization
    const { sanitizeLoginData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeLoginData).mockReturnValue(loginData)

    // Mock user doesn't exist
    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    // Should throw AuthError which will be handled by withErrorHandling
    const { AuthError } = await import('@/lib/errors/auth-errors')
    await expect(POST(request)).rejects.toThrow(AuthError)
  })

  it('should reject login with wrong password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'WrongPassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })

    // Mock request body validation
    const { validateRequestBody } = await import('@/lib/api/error-handler')
    jest.mocked(validateRequestBody).mockResolvedValue(loginData)

    // Mock sanitization
    const { sanitizeLoginData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeLoginData).mockReturnValue(loginData)

    // Mock user exists
    const mockUser = {
      id: 'user-123',
      email: loginData.email,
      password: 'hashed-password',
      isActive: true
    }

    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(mockUser as any)

    // Mock password verification fails
    const { verifyPassword } = await import('@/lib/auth/password')
    jest.mocked(verifyPassword).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    // Should throw AuthError
    const { AuthError } = await import('@/lib/errors/auth-errors')
    await expect(POST(request)).rejects.toThrow(AuthError)
  })

  it('should reject login for inactive user', async () => {
    const loginData = {
      email: 'inactive@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })

    // Mock request body validation
    const { validateRequestBody } = await import('@/lib/api/error-handler')
    jest.mocked(validateRequestBody).mockResolvedValue(loginData)

    // Mock sanitization
    const { sanitizeLoginData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeLoginData).mockReturnValue(loginData)

    // Mock inactive user
    const mockUser = {
      id: 'user-123',
      email: loginData.email,
      password: 'hashed-password',
      isActive: false
    }

    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    // Should throw AuthError
    const { AuthError } = await import('@/lib/errors/auth-errors')
    await expect(POST(request)).rejects.toThrow(AuthError)
  })

  it('should reject login for OAuth user without password', async () => {
    const loginData = {
      email: 'oauth@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })

    // Mock request body validation
    const { validateRequestBody } = await import('@/lib/api/error-handler')
    jest.mocked(validateRequestBody).mockResolvedValue(loginData)

    // Mock sanitization
    const { sanitizeLoginData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeLoginData).mockReturnValue(loginData)

    // Mock OAuth user (no password)
    const mockUser = {
      id: 'user-123',
      email: loginData.email,
      password: null,
      provider: 'google',
      isActive: true
    }

    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(mockUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    // Should throw AuthError
    const { AuthError } = await import('@/lib/errors/auth-errors')
    await expect(POST(request)).rejects.toThrow(AuthError)
  })

  it('should apply rate limiting', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting blocks request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60000,
      retryAfter: 60
    })

    const request = new NextRequest('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Too many login attempts')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(response.headers.get('Retry-After')).toBe('60')
  })
})