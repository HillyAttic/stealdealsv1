import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock dependencies
jest.mock('@/lib/validations/auth', () => ({
  registerSchema: {
    safeParse: jest.fn()
  }
}))

jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn()
}))

jest.mock('@/lib/database/mock-users', () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn()
}))

jest.mock('@/lib/auth/session', () => ({
  createSession: jest.fn()
}))

jest.mock('@/lib/security/csrf', () => ({
  withCSRFProtection: jest.fn((handler) => handler)
}))

jest.mock('@/lib/security/rate-limit', () => ({
  applyAuthRateLimit: jest.fn()
}))

jest.mock('@/lib/security/sanitization', () => ({
  sanitizeRegistrationData: jest.fn()
}))

jest.mock('@/lib/security/cookies', () => ({
  setSessionCookies: jest.fn()
}))

jest.mock('@/lib/security/session-timeout', () => ({
  updateSessionActivity: jest.fn()
}))

jest.mock('@/lib/api/error-handler', () => ({
  withErrorHandling: jest.fn((handler) => handler)
}))

describe('/api/auth/user/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    // Mock successful validation
    const { registerSchema } = await import('@/lib/validations/auth')
    jest.mocked(registerSchema.safeParse).mockReturnValue({
      success: true,
      data: userData
    })

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      resetTime: Date.now() + 60000
    })

    // Mock sanitization
    const { sanitizeRegistrationData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeRegistrationData).mockReturnValue(userData)

    // Mock user doesn't exist
    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue(null)

    // Mock password hashing
    const { hashPassword } = await import('@/lib/auth/password')
    jest.mocked(hashPassword).mockResolvedValue('hashed-password')

    // Mock user creation
    const { createUser } = await import('@/lib/database/mock-users')
    const mockUser = {
      id: 'user-123',
      name: userData.name,
      email: userData.email,
      password: 'hashed-password',
      provider: 'email',
      role: 'user',
      isActive: true,
      emailVerified: false,
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
    jest.mocked(createUser).mockResolvedValue(mockUser)

    // Mock session creation
    const { createSession } = await import('@/lib/auth/session')
    jest.mocked(createSession).mockReturnValue('jwt-token')

    const request = new NextRequest('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe(userData.email)
    expect(data.user.name).toBe(userData.name)
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: 'hashed-password',
      provider: 'email',
      role: 'user'
    }))
  })

  it('should reject registration with invalid data', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
      password: '123'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      resetTime: Date.now() + 60000
    })

    // Mock validation failure
    const { registerSchema } = await import('@/lib/validations/auth')
    jest.mocked(registerSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email format' },
          { path: ['password'], message: 'Password too weak' }
        ]
      }
    })

    const request = new NextRequest('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toHaveLength(3)
  })

  it('should reject registration when email already exists', async () => {
    const userData = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      resetTime: Date.now() + 60000
    })

    // Mock successful validation
    const { registerSchema } = await import('@/lib/validations/auth')
    jest.mocked(registerSchema.safeParse).mockReturnValue({
      success: true,
      data: userData
    })

    // Mock sanitization
    const { sanitizeRegistrationData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeRegistrationData).mockReturnValue(userData)

    // Mock existing user
    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockResolvedValue({
      id: 'existing-user',
      email: userData.email,
      name: 'Existing User'
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email already exists')
    expect(data.field).toBe('email')
  })

  it('should apply rate limiting', async () => {
    const userData = {
      name: 'Test User',
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

    const request = new NextRequest('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Too many registration attempts')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(response.headers.get('Retry-After')).toBe('60')
  })

  it('should handle database errors gracefully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    // Mock rate limiting allows request
    const { applyAuthRateLimit } = await import('@/lib/security/rate-limit')
    jest.mocked(applyAuthRateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      resetTime: Date.now() + 60000
    })

    // Mock successful validation
    const { registerSchema } = await import('@/lib/validations/auth')
    jest.mocked(registerSchema.safeParse).mockReturnValue({
      success: true,
      data: userData
    })

    // Mock sanitization
    const { sanitizeRegistrationData } = await import('@/lib/security/sanitization')
    jest.mocked(sanitizeRegistrationData).mockReturnValue(userData)

    // Mock database error
    const { getUserByEmail } = await import('@/lib/database/mock-users')
    jest.mocked(getUserByEmail).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    })

    // The error should be handled by the withErrorHandling wrapper
    await expect(POST(request)).rejects.toThrow('Database connection failed')
  })
})