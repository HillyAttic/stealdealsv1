import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { POST as registerPOST } from '@/app/api/auth/user/register/route'
import { POST as loginPOST } from '@/app/api/auth/user/login/route'
import { POST as logoutPOST } from '@/app/api/auth/user/logout/route'
import { GET as sessionGET } from '@/app/api/auth/session-status/route'

// Mock dependencies
jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(() => ({
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  }))
}))

jest.mock('@/lib/auth/session', () => ({
  createSession: jest.fn(() => 'mock-session-token'),
  getSessionFromRequest: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    },
    token: 'mock-token'
  })),
  clearSession: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true))
}))

// Mock user storage
const mockUsers: any[] = []

jest.mock('@/lib/db/users', () => ({
  createUser: jest.fn((userData) => {
    const user = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      emailVerified: false,
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
    mockUsers.push(user)
    return Promise.resolve(user)
  }),
  findUserByEmail: jest.fn((email) => {
    return Promise.resolve(mockUsers.find(u => u.email === email) || null)
  }),
  updateUserLastLogin: jest.fn((userId) => {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.lastLoginAt = new Date()
    }
    return Promise.resolve(user)
  })
}))

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsers.length = 0
  })

  describe('Complete Registration and Login Flow', () => {
    it('should complete full user registration and login flow', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'SecurePassword123!'
      }

      // Step 1: Register new user
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(201)
      expect(registerData.success).toBe(true)
      expect(registerData.user.email).toBe(userData.email)
      expect(registerData.token).toBeDefined()

      // Verify user was created
      expect(mockUsers).toHaveLength(1)
      expect(mockUsers[0].email).toBe(userData.email)

      // Step 2: Login with the same credentials
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.success).toBe(true)
      expect(loginData.user.email).toBe(userData.email)
      expect(loginData.token).toBeDefined()

      // Step 3: Check session status
      const sessionRequest = new NextRequest('http://localhost:3000/api/auth/session-status', {
        method: 'GET',
        headers: {
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const sessionResponse = await sessionGET(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.authenticated).toBe(true)
      expect(sessionData.user).toBeDefined()
      expect(sessionData.user.email).toBe(userData.email)
    })

    it('should prevent duplicate registration with same email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'SecurePassword123!'
      }

      // First registration
      const firstRegisterRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      })

      const firstResponse = await registerPOST(firstRegisterRequest)
      expect(firstResponse.status).toBe(201)

      // Second registration with same email
      const secondRegisterRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          name: 'Different Name'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondResponse = await registerPOST(secondRegisterRequest)
      const secondData = await secondResponse.json()

      expect(secondResponse.status).toBe(409)
      expect(secondData.success).toBe(false)
      expect(secondData.error).toContain('already exists')
    })

    it('should handle login with wrong password', async () => {
      const userData = {
        name: 'Test User',
        email: 'wrongpassword@example.com',
        password: 'CorrectPassword123!'
      }

      // Register user first
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      })

      await registerPOST(registerRequest)

      // Mock bcrypt to return false for wrong password
      jest.mocked(await import('bcryptjs')).compare.mockResolvedValueOnce(false)

      // Try to login with wrong password
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: 'WrongPassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(401)
      expect(loginData.success).toBe(false)
      expect(loginData.error).toContain('Invalid credentials')
    })

    it('should complete logout flow', async () => {
      // Mock session for logout
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/user/logout', {
        method: 'POST',
        headers: {
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const logoutResponse = await logoutPOST(logoutRequest)
      const logoutData = await logoutResponse.json()

      expect(logoutResponse.status).toBe(200)
      expect(logoutData.success).toBe(true)
      expect(logoutData.message).toContain('Logged out successfully')

      // Verify session is cleared
      const clearSession = jest.mocked(await import('@/lib/auth/session')).clearSession
      expect(clearSession).toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('should maintain session across requests', async () => {
      // Mock authenticated session
      const sessionRequest1 = new NextRequest('http://localhost:3000/api/auth/session-status', {
        method: 'GET',
        headers: {
          'Cookie': 'auth_session=valid-token'
        }
      })

      const sessionResponse1 = await sessionGET(sessionRequest1)
      const sessionData1 = await sessionResponse1.json()

      expect(sessionResponse1.status).toBe(200)
      expect(sessionData1.authenticated).toBe(true)

      // Second request with same session
      const sessionRequest2 = new NextRequest('http://localhost:3000/api/auth/session-status', {
        method: 'GET',
        headers: {
          'Cookie': 'auth_session=valid-token'
        }
      })

      const sessionResponse2 = await sessionGET(sessionRequest2)
      const sessionData2 = await sessionResponse2.json()

      expect(sessionResponse2.status).toBe(200)
      expect(sessionData2.authenticated).toBe(true)
      expect(sessionData2.user.id).toBe(sessionData1.user.id)
    })

    it('should handle invalid session tokens', async () => {
      // Mock invalid session
      jest.mocked(await import('@/lib/auth/session')).getSessionFromRequest.mockReturnValueOnce(null)

      const sessionRequest = new NextRequest('http://localhost:3000/api/auth/session-status', {
        method: 'GET',
        headers: {
          'Cookie': 'auth_session=invalid-token'
        }
      })

      const sessionResponse = await sessionGET(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.authenticated).toBe(false)
      expect(sessionData.user).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors during registration', async () => {
      // Mock database error
      jest.mocked(await import('@/lib/db/users')).createUser.mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const userData = {
        name: 'Test User',
        email: 'dberror@example.com',
        password: 'SecurePassword123!'
      }

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(500)
      expect(registerData.success).toBe(false)
      expect(registerData.error).toContain('Registration failed')
    })

    it('should handle database errors during login', async () => {
      // Mock database error
      jest.mocked(await import('@/lib/db/users')).findUserByEmail.mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(500)
      expect(loginData.success).toBe(false)
      expect(loginData.error).toContain('Login failed')
    })
  })
})