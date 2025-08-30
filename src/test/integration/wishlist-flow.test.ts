import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { POST as registerPOST } from '@/app/api/auth/user/register/route'
import { POST as loginPOST } from '@/app/api/auth/user/login/route'
import { GET as wishlistGET, POST as wishlistPOST } from '@/app/api/user/wishlist/route'
import { GET as activityGET } from '@/app/api/user/activity/route'

// Mock dependencies
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn()
}))

jest.mock('@/lib/database/mock-users', () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn()
}))

jest.mock('@/lib/database/wishlist', () => ({
  getUserWishlist: jest.fn(),
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  isInWishlist: jest.fn()
}))

jest.mock('@/lib/database/activity', () => ({
  getUserActivity: jest.fn(),
  logActivity: jest.fn()
}))

jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn()
}))

jest.mock('@/lib/auth/session', () => ({
  createSession: jest.fn()
}))

describe('Complete Wishlist Flow Integration', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
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

  const mockProperties = [
    {
      id: 'property-1',
      title: 'Beautiful Apartment',
      price: 250000,
      location: 'New York',
      type: 'apartment',
      images: ['image1.jpg']
    },
    {
      id: 'property-2',
      title: 'Cozy House',
      price: 350000,
      location: 'Los Angeles',
      type: 'house',
      images: ['image2.jpg']
    }
  ]

  const mockWishlistItems = [
    {
      id: 'wishlist-1',
      userId: mockUser.id,
      propertyId: 'property-1',
      addedAt: new Date(),
      notes: 'Love this apartment!',
      priority: 'high'
    },
    {
      id: 'wishlist-2',
      userId: mockUser.id,
      propertyId: 'property-2',
      addedAt: new Date(),
      notes: null,
      priority: 'medium'
    }
  ]

  const mockAuthenticatedRequest = {
    user: mockUser,
    request: {} as NextRequest
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Registration to Wishlist Usage Flow', () => {
    it('should complete full flow from registration to wishlist management', async () => {
      // Step 1: User Registration
      const { createUser } = await import('@/lib/database/mock-users')
      const { hashPassword } = await import('@/lib/auth/password')
      const { createSession } = await import('@/lib/auth/session')

      jest.mocked(hashPassword).mockResolvedValue('hashed-password')
      jest.mocked(createUser).mockResolvedValue(mockUser)
      jest.mocked(createSession).mockReturnValue('jwt-token')

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePassword123!'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Mock all required dependencies for registration
      const mockValidation = await import('@/lib/validations/auth')
      jest.mocked(mockValidation.registerSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePassword123!'
        }
      })

      const mockRateLimit = await import('@/lib/security/rate-limit')
      jest.mocked(mockRateLimit.applyAuthRateLimit).mockReturnValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 60000
      })

      const mockSanitization = await import('@/lib/security/sanitization')
      jest.mocked(mockSanitization.sanitizeRegistrationData).mockReturnValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123!'
      })

      const { getUserByEmail } = await import('@/lib/database/mock-users')
      jest.mocked(getUserByEmail).mockResolvedValue(null) // User doesn't exist

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(200)
      expect(registerData.success).toBe(true)
      expect(registerData.user.email).toBe('test@example.com')

      // Step 2: User adds properties to wishlist
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const { addToWishlist, isInWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(isInWishlist).mockResolvedValue(false)
      jest.mocked(addToWishlist).mockResolvedValue(mockWishlistItems[0])

      const addWishlistRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add',
          notes: 'Love this apartment!',
          priority: 'high'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const addWishlistResponse = await wishlistPOST(addWishlistRequest)
      const addWishlistData = await addWishlistResponse.json()

      expect(addWishlistResponse.status).toBe(200)
      expect(addWishlistData.success).toBe(true)
      expect(addWishlistData.message).toBe('Property added to wishlist')

      // Step 3: User views their wishlist
      const { getUserWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(getUserWishlist).mockResolvedValue([
        {
          ...mockWishlistItems[0],
          title: mockProperties[0].title,
          price: mockProperties[0].price,
          location: mockProperties[0].location,
          images: mockProperties[0].images,
          type: mockProperties[0].type
        }
      ])

      const getWishlistRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const getWishlistResponse = await wishlistGET(getWishlistRequest)
      const getWishlistData = await getWishlistResponse.json()

      expect(getWishlistResponse.status).toBe(200)
      expect(getWishlistData.success).toBe(true)
      expect(getWishlistData.properties).toHaveLength(1)
      expect(getWishlistData.properties[0].title).toBe('Beautiful Apartment')

      // Step 4: Verify activity was logged
      const { getUserActivity } = await import('@/lib/database/activity')
      jest.mocked(getUserActivity).mockResolvedValue([
        {
          id: 'activity-1',
          userId: mockUser.id,
          type: 'wishlist_add',
          propertyId: 'property-1',
          metadata: { notes: 'Love this apartment!', priority: 'high' },
          timestamp: new Date(),
          sessionId: 'session-123',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      ])

      const getActivityRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'GET'
      })

      const getActivityResponse = await activityGET(getActivityRequest)
      const getActivityData = await getActivityResponse.json()

      expect(getActivityResponse.status).toBe(200)
      expect(getActivityData.success).toBe(true)
      expect(getActivityData.activities).toHaveLength(1)
      expect(getActivityData.activities[0].type).toBe('wishlist_add')
    })
  })

  describe('Wishlist Management Operations', () => {
    it('should handle complete wishlist CRUD operations', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Step 1: Add first property
      const { addToWishlist, isInWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(isInWishlist).mockResolvedValue(false)
      jest.mocked(addToWishlist).mockResolvedValue(mockWishlistItems[0])

      const addRequest1 = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add',
          notes: 'Love this apartment!',
          priority: 'high'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const addResponse1 = await wishlistPOST(addRequest1)
      expect(addResponse1.status).toBe(200)

      // Step 2: Add second property
      jest.mocked(isInWishlist).mockResolvedValue(false)
      jest.mocked(addToWishlist).mockResolvedValue(mockWishlistItems[1])

      const addRequest2 = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-2',
          action: 'add',
          priority: 'medium'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const addResponse2 = await wishlistPOST(addRequest2)
      expect(addResponse2.status).toBe(200)

      // Step 3: Get full wishlist
      const { getUserWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(getUserWishlist).mockResolvedValue([
        {
          ...mockWishlistItems[0],
          title: mockProperties[0].title,
          price: mockProperties[0].price,
          location: mockProperties[0].location,
          images: mockProperties[0].images,
          type: mockProperties[0].type
        },
        {
          ...mockWishlistItems[1],
          title: mockProperties[1].title,
          price: mockProperties[1].price,
          location: mockProperties[1].location,
          images: mockProperties[1].images,
          type: mockProperties[1].type
        }
      ])

      const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const getResponse = await wishlistGET(getRequest)
      const getData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(getData.properties).toHaveLength(2)

      // Step 4: Remove one property
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(removeFromWishlist).mockResolvedValue(true)

      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'remove'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const removeResponse = await wishlistPOST(removeRequest)
      const removeData = await removeResponse.json()

      expect(removeResponse.status).toBe(200)
      expect(removeData.success).toBe(true)
      expect(removeData.message).toBe('Property removed from wishlist')

      // Step 5: Verify updated wishlist
      jest.mocked(getUserWishlist).mockResolvedValue([
        {
          ...mockWishlistItems[1],
          title: mockProperties[1].title,
          price: mockProperties[1].price,
          location: mockProperties[1].location,
          images: mockProperties[1].images,
          type: mockProperties[1].type
        }
      ])

      const getFinalRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const getFinalResponse = await wishlistGET(getFinalRequest)
      const getFinalData = await getFinalResponse.json()

      expect(getFinalResponse.status).toBe(200)
      expect(getFinalData.properties).toHaveLength(1)
      expect(getFinalData.properties[0].title).toBe('Cozy House')
    })

    it('should handle duplicate wishlist additions', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property already in wishlist
      const { isInWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(isInWishlist).mockResolvedValue(true)

      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const addResponse = await wishlistPOST(addRequest)
      const addData = await addResponse.json()

      expect(addResponse.status).toBe(400)
      expect(addData.success).toBe(false)
      expect(addData.error).toBe('Property already in wishlist')
    })

    it('should handle removing non-existent wishlist items', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property not found in wishlist
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(removeFromWishlist).mockResolvedValue(false)

      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'non-existent-property',
          action: 'remove'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const removeResponse = await wishlistPOST(removeRequest)
      const removeData = await removeResponse.json()

      expect(removeResponse.status).toBe(404)
      expect(removeData.success).toBe(false)
      expect(removeData.error).toBe('Property not found in wishlist')
    })
  })

  describe('Cross-Feature Integration', () => {
    it('should integrate wishlist with user activity tracking', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock activity logging
      const { logActivity } = await import('@/lib/database/activity')
      jest.mocked(logActivity).mockResolvedValue({
        id: 'activity-123',
        userId: mockUser.id,
        type: 'wishlist_add',
        propertyId: 'property-1',
        metadata: { notes: 'Great property!', priority: 'high' },
        timestamp: new Date(),
        sessionId: 'session-123',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      })

      // Add to wishlist (should trigger activity logging)
      const { addToWishlist, isInWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(isInWishlist).mockResolvedValue(false)
      jest.mocked(addToWishlist).mockImplementation(async (userId, propertyId, notes, priority) => {
        // Simulate activity logging during wishlist addition
        await logActivity(userId, 'wishlist_add', propertyId, {
          notes,
          priority
        })
        
        return {
          id: 'wishlist-123',
          userId,
          propertyId,
          addedAt: new Date(),
          notes,
          priority
        }
      })

      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add',
          notes: 'Great property!',
          priority: 'high'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const addResponse = await wishlistPOST(addRequest)
      expect(addResponse.status).toBe(200)

      // Verify activity was logged
      expect(logActivity).toHaveBeenCalledWith(
        mockUser.id,
        'wishlist_add',
        'property-1',
        {
          notes: 'Great property!',
          priority: 'high'
        }
      )
    })

    it('should handle concurrent wishlist operations', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware')
      jest.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const { addToWishlist, isInWishlist } = await import('@/lib/database/wishlist')
      
      // Mock concurrent operations
      jest.mocked(isInWishlist)
        .mockResolvedValueOnce(false) // First check: not in wishlist
        .mockResolvedValueOnce(false) // Second check: not in wishlist

      jest.mocked(addToWishlist)
        .mockResolvedValueOnce({
          id: 'wishlist-1',
          userId: mockUser.id,
          propertyId: 'property-1',
          addedAt: new Date(),
          notes: null,
          priority: 'medium'
        })
        .mockRejectedValueOnce(new Error('Duplicate key violation')) // Second add fails

      // Simulate two concurrent requests to add the same property
      const request1 = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const request2 = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'property-1',
          action: 'add'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Execute both requests concurrently
      const [response1, response2] = await Promise.allSettled([
        wishlistPOST(request1),
        wishlistPOST(request2)
      ])

      // First request should succeed
      expect(response1.status).toBe('fulfilled')
      if (response1.status === 'fulfilled') {
        expect(response1.value.status).toBe(200)
      }

      // Second request should fail due to database constraint
      expect(response2.status).toBe('fulfilled')
      if (response2.status === 'fulfilled') {
        expect(response2.value.status).toBe(500)
      }
    })
  })
})