import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest, NextResponse } from 'next/server'

// Import all authentication-related test suites
import '@/test/integration/auth-flow.test'
import '@/components/auth/__tests__/AuthButton.test'
import '@/components/auth/__tests__/AuthModal.test'
import '@/components/auth/__tests__/SignInForm.test'
import '@/components/auth/__tests__/SignUpForm.test'
import '@/components/dashboard/__tests__/UserDashboard.test'
import '@/components/wishlist/__tests__/WishlistButton.test'

// Mock dependencies for comprehensive testing
jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(() => ({
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  })),
  refreshToken: jest.fn(() => 'refreshed-jwt-token')
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
  clearSession: jest.fn(),
  updateSessionExpiry: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
  genSalt: jest.fn(() => Promise.resolve('mock-salt'))
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn()
  })),
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'google-user-id',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg'
    },
    credential: {
      idToken: 'google-id-token',
      accessToken: 'google-access-token'
    }
  })),
  signOut: jest.fn(() => Promise.resolve())
}))

// Mock database operations
const mockUsers: any[] = []
const mockWishlistItems: any[] = []
const mockActivityLogs: any[] = []

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
  findUserById: jest.fn((id) => {
    return Promise.resolve(mockUsers.find(u => u.id === id) || null)
  }),
  updateUser: jest.fn((id, updates) => {
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updatedAt: new Date() }
      return Promise.resolve(mockUsers[userIndex])
    }
    return Promise.resolve(null)
  }),
  updateUserLastLogin: jest.fn((userId) => {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.lastLoginAt = new Date()
    }
    return Promise.resolve(user)
  }),
  deleteUser: jest.fn((id) => {
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex !== -1) {
      const deleted = mockUsers.splice(userIndex, 1)[0]
      return Promise.resolve(deleted)
    }
    return Promise.resolve(null)
  })
}))

jest.mock('@/lib/db/wishlist', () => ({
  addToWishlist: jest.fn((userId, propertyId) => {
    const item = {
      id: `wishlist-${Date.now()}`,
      userId,
      propertyId,
      addedAt: new Date(),
      priority: 'medium'
    }
    mockWishlistItems.push(item)
    return Promise.resolve(item)
  }),
  removeFromWishlist: jest.fn((userId, propertyId) => {
    const index = mockWishlistItems.findIndex(i => i.userId === userId && i.propertyId === propertyId)
    if (index !== -1) {
      const removed = mockWishlistItems.splice(index, 1)[0]
      return Promise.resolve(removed)
    }
    return Promise.resolve(null)
  }),
  getUserWishlist: jest.fn((userId) => {
    return Promise.resolve(mockWishlistItems.filter(i => i.userId === userId))
  }),
  isInWishlist: jest.fn((userId, propertyId) => {
    return Promise.resolve(mockWishlistItems.some(i => i.userId === userId && i.propertyId === propertyId))
  })
}))

jest.mock('@/lib/db/activity', () => ({
  logActivity: jest.fn((activityData) => {
    const activity = {
      id: `activity-${Date.now()}`,
      ...activityData,
      timestamp: new Date()
    }
    mockActivityLogs.push(activity)
    return Promise.resolve(activity)
  }),
  getUserActivity: jest.fn((userId) => {
    return Promise.resolve(mockActivityLogs.filter(a => a.userId === userId))
  }),
  getActivityStats: jest.fn((userId) => {
    const userActivity = mockActivityLogs.filter(a => a.userId === userId)
    return Promise.resolve({
      totalViews: userActivity.length,
      uniqueProperties: [...new Set(userActivity.map(a => a.propertyId))].length,
      activityByDay: {}
    })
  })
}))

describe('Authentication System Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsers.length = 0
    mockWishlistItems.length = 0
    mockActivityLogs.length = 0
  })

  describe('System Integration Tests', () => {
    it('should handle complete user journey from registration to wishlist management', async () => {
      // Import API routes dynamically to avoid circular dependencies
      const { POST as registerPOST } = await import('@/app/api/auth/user/register/route')
      const { POST: loginPOST } = await import('@/app/api/auth/user/login/route')
      const { POST as wishlistPOST, GET: wishlistGET } = await import('@/app/api/user/wishlist/route')

      const userData = {
        name: 'Journey Test User',
        email: 'journey@example.com',
        password: 'SecurePassword123!'
      }

      // Step 1: Register
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

      const userId = registerData.user.id

      // Step 2: Login
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

      // Step 3: Add property to wishlist
      const wishlistAddRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'test-property-1',
          action: 'add'
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const wishlistAddResponse = await wishlistPOST(wishlistAddRequest)
      const wishlistAddData = await wishlistAddResponse.json()

      expect(wishlistAddResponse.status).toBe(200)
      expect(wishlistAddData.success).toBe(true)

      // Step 4: Get wishlist
      const wishlistGetRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET',
        headers: { 
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const wishlistGetResponse = await wishlistGET(wishlistGetRequest)
      const wishlistGetData = await wishlistGetResponse.json()

      expect(wishlistGetResponse.status).toBe(200)
      expect(wishlistGetData.properties).toHaveLength(1)
      expect(wishlistGetData.properties[0].propertyId).toBe('test-property-1')
    })

    it('should enforce authentication on protected routes', async () => {
      const { GET: wishlistGET } = await import('@/app/api/user/wishlist/route')

      // Mock unauthenticated request
      jest.mocked(await import('@/lib/auth/session')).getSessionFromRequest.mockReturnValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const response = await wishlistGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should handle Google OAuth authentication flow', async () => {
      const { POST: googleAuthPOST } = await import('@/app/api/auth/google/route')

      const googleAuthRequest = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          code: 'mock-google-auth-code',
          state: 'mock-state'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const googleAuthResponse = await googleAuthPOST(googleAuthRequest)
      const googleAuthData = await googleAuthResponse.json()

      expect(googleAuthResponse.status).toBe(200)
      expect(googleAuthData.success).toBe(true)
      expect(googleAuthData.user.email).toBe('google@example.com')
      expect(googleAuthData.user.provider).toBe('google')
    })

    it('should handle password validation and security', async () => {
      const { POST: registerPOST } = await import('@/app/api/auth/user/register/route')

      // Test weak password
      const weakPasswordRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'weak@example.com',
          password: '123'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const weakPasswordResponse = await registerPOST(weakPasswordRequest)
      const weakPasswordData = await weakPasswordResponse.json()

      expect(weakPasswordResponse.status).toBe(400)
      expect(weakPasswordData.success).toBe(false)
      expect(weakPasswordData.error).toContain('password')
    })

    it('should handle session expiry and refresh', async () => {
      const { GET: sessionGET } = await import('@/app/api/auth/session-status/route')

      // Mock expired token
      jest.mocked(await import('@/lib/auth/jwt')).verifyToken.mockReturnValueOnce({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired
        iat: Math.floor(Date.now() / 1000) - 7200
      })

      const sessionRequest = new NextRequest('http://localhost:3000/api/auth/session-status', {
        method: 'GET',
        headers: {
          'Cookie': 'auth_session=expired-token'
        }
      })

      const sessionResponse = await sessionGET(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.authenticated).toBe(false)
      expect(sessionData.needsRefresh).toBe(true)
    })
  })

  describe('Security and Validation Tests', () => {
    it('should prevent SQL injection attempts', async () => {
      const { POST: loginPOST } = await import('@/app/api/auth/user/login/route')

      const sqlInjectionRequest = new NextRequest('http://localhost:3000/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: "'; DROP TABLE users; --",
          password: 'password'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await loginPOST(sqlInjectionRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid email format')
    })

    it('should prevent XSS attacks in user input', async () => {
      const { POST: registerPOST } = await import('@/app/api/auth/user/register/route')

      const xssRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>',
          email: 'xss@example.com',
          password: 'SecurePassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await registerPOST(xssRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid name format')
    })

    it('should enforce rate limiting on authentication endpoints', async () => {
      const { POST: loginPOST } = await import('@/app/api/auth/user/login/route')

      // Simulate multiple rapid login attempts
      const requests = Array.from({ length: 10 }, () => 
        new NextRequest('http://localhost:3000/api/auth/user/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'ratelimit@example.com',
            password: 'password'
          }),
          headers: { 
            'Content-Type': 'application/json',
            'X-Forwarded-For': '192.168.1.1'
          }
        })
      )

      const responses = await Promise.all(requests.map(req => loginPOST(req)))
      
      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should validate JWT token integrity', async () => {
      const { verifyToken } = await import('@/lib/auth/jwt')

      // Test with tampered token
      const result = await verifyToken('tampered.jwt.token')
      expect(result).toBeNull()
    })
  })

  describe('Performance and Scalability Tests', () => {
    it('should handle concurrent user registrations', async () => {
      const { POST: registerPOST } = await import('@/app/api/auth/user/register/route')

      const concurrentRegistrations = Array.from({ length: 5 }, (_, i) => ({
        name: `Concurrent User ${i}`,
        email: `concurrent${i}@example.com`,
        password: 'SecurePassword123!'
      }))

      const requests = concurrentRegistrations.map(userData => 
        new NextRequest('http://localhost:3000/api/auth/user/register', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: { 'Content-Type': 'application/json' }
        })
      )

      const responses = await Promise.all(requests.map(req => registerPOST(req)))
      
      // All registrations should succeed
      for (const response of responses) {
        expect(response.status).toBe(201)
        const data = await response.json()
        expect(data.success).toBe(true)
      }

      expect(mockUsers).toHaveLength(5)
    })

    it('should efficiently handle large wishlist operations', async () => {
      const { POST: wishlistPOST } = await import('@/app/api/user/wishlist/route')

      // Add multiple properties to wishlist rapidly
      const propertyIds = Array.from({ length: 20 }, (_, i) => `property-${i}`)
      
      const requests = propertyIds.map(propertyId => 
        new NextRequest('http://localhost:3000/api/user/wishlist', {
          method: 'POST',
          body: JSON.stringify({
            propertyId,
            action: 'add'
          }),
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': 'auth_session=mock-session-token'
          }
        })
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests.map(req => wishlistPOST(req)))
      const endTime = Date.now()
      
      // All operations should complete within reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000)
      
      // All operations should succeed
      for (const response of responses) {
        expect(response.status).toBe(200)
      }

      expect(mockWishlistItems).toHaveLength(20)
    })

    it('should handle database connection errors gracefully', async () => {
      const { POST: loginPOST } = await import('@/app/api/auth/user/login/route')

      // Mock database error
      jest.mocked(await import('@/lib/db/users')).findUserByEmail.mockRejectedValueOnce(
        new Error('Database connection timeout')
      )

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'db-error@example.com',
          password: 'password'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await loginPOST(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Login failed')
    })
  })

  describe('Data Integrity and Consistency Tests', () => {
    it('should maintain user data consistency across operations', async () => {
      const { POST: registerPOST } = await import('@/app/api/auth/user/register/route')
      const { GET: profileGET, PUT: profilePUT } = await import('@/app/api/user/profile/route')

      // Register user
      const userData = {
        name: 'Data Consistency User',
        email: 'consistency@example.com',
        password: 'SecurePassword123!'
      }

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()
      const userId = registerData.user.id

      // Get profile
      const profileGetRequest = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: { 'Cookie': 'auth_session=mock-session-token' }
      })

      const profileGetResponse = await profileGET(profileGetRequest)
      const profileGetData = await profileGetResponse.json()

      expect(profileGetData.user.name).toBe(userData.name)
      expect(profileGetData.user.email).toBe(userData.email)

      // Update profile
      const profileUpdateRequest = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
          preferences: {
            propertyTypes: ['apartment'],
            priceRange: { min: 200000, max: 400000 }
          }
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const profileUpdateResponse = await profilePUT(profileUpdateRequest)
      const profileUpdateData = await profileUpdateResponse.json()

      expect(profileUpdateResponse.status).toBe(200)
      expect(profileUpdateData.user.name).toBe('Updated Name')
      expect(profileUpdateData.user.preferences.propertyTypes).toContain('apartment')
    })

    it('should maintain referential integrity for wishlist items', async () => {
      const { POST: wishlistPOST, DELETE: wishlistDELETE } = await import('@/app/api/user/wishlist/route')

      const propertyId = 'ref-integrity-property'
      
      // Add to wishlist
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          action: 'add'
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const addResponse = await wishlistPOST(addRequest)
      expect(addResponse.status).toBe(200)

      // Verify item exists
      expect(mockWishlistItems.some(item => item.propertyId === propertyId)).toBe(true)

      // Remove from wishlist
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          action: 'remove'
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const removeResponse = await wishlistPOST(removeRequest)
      expect(removeResponse.status).toBe(200)

      // Verify item is removed
      expect(mockWishlistItems.some(item => item.propertyId === propertyId)).toBe(false)
    })
  })

  describe('Analytics and Monitoring Tests', () => {
    it('should track user activity accurately', async () => {
      const { POST: activityPOST } = await import('@/app/api/user/activity/route')

      const activityData = {
        type: 'property_view',
        propertyId: 'tracked-property',
        metadata: { source: 'search', duration: 30 }
      }

      const activityRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        body: JSON.stringify(activityData),
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'auth_session=mock-session-token'
        }
      })

      const activityResponse = await activityPOST(activityRequest)
      const activityResponseData = await activityResponse.json()

      expect(activityResponse.status).toBe(200)
      expect(activityResponseData.success).toBe(true)
      
      // Verify activity was logged
      expect(mockActivityLogs).toHaveLength(1)
      expect(mockActivityLogs[0].type).toBe('property_view')
      expect(mockActivityLogs[0].propertyId).toBe('tracked-property')
    })

    it('should generate user analytics correctly', async () => {
      const { GET: analyticsGET } = await import('@/app/api/user/analytics/route')

      // Pre-populate some activity data
      mockActivityLogs.push(
        {
          id: 'activity-1',
          userId: 'test-user-id',
          type: 'property_view',
          propertyId: 'property-1',
          timestamp: new Date()
        },
        {
          id: 'activity-2',
          userId: 'test-user-id',
          type: 'property_view',
          propertyId: 'property-2',
          timestamp: new Date()
        },
        {
          id: 'activity-3',
          userId: 'test-user-id',
          type: 'search',
          metadata: { query: 'apartment' },
          timestamp: new Date()
        }
      )

      const analyticsRequest = new NextRequest('http://localhost:3000/api/user/analytics', {
        method: 'GET',
        headers: { 'Cookie': 'auth_session=mock-session-token' }
      })

      const analyticsResponse = await analyticsGET(analyticsRequest)
      const analyticsData = await analyticsResponse.json()

      expect(analyticsResponse.status).toBe(200)
      expect(analyticsData.totalViews).toBe(2)
      expect(analyticsData.uniqueProperties).toBe(2)
    })
  })
})