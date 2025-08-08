import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: vi.fn()
}))

vi.mock('@/lib/database/wishlist', () => ({
  getUserWishlist: vi.fn(),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  getWishlistStats: vi.fn(),
  isInWishlist: vi.fn()
}))

describe('/api/user/wishlist', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  }

  const mockAuthenticatedRequest = {
    user: mockUser,
    request: {} as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/user/wishlist', () => {
    it('should get user wishlist successfully', async () => {
      const mockWishlistProperties = [
        {
          id: 'wishlist-1',
          propertyId: 'property-1',
          title: 'Test Property 1',
          price: 250000,
          location: 'Test City',
          images: ['image1.jpg'],
          type: 'apartment',
          addedAt: new Date(),
          notes: 'Nice property',
          priority: 'high'
        },
        {
          id: 'wishlist-2',
          propertyId: 'property-2',
          title: 'Test Property 2',
          price: 350000,
          location: 'Test City 2',
          images: ['image2.jpg'],
          type: 'house',
          addedAt: new Date(),
          notes: null,
          priority: 'medium'
        }
      ]

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock wishlist data
      const { getUserWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(getUserWishlist).mockResolvedValue(mockWishlistProperties)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.properties).toHaveLength(2)
      expect(data.total).toBe(2)
      expect(data.properties[0].title).toBe('Test Property 1')
      expect(getUserWishlist).toHaveBeenCalledWith(mockUser.id)
    })

    it('should get wishlist stats when stats=true', async () => {
      const mockStats = {
        totalProperties: 5,
        averagePrice: 300000,
        propertyTypes: {
          apartment: 3,
          house: 2
        },
        locations: {
          'New York': 3,
          'Los Angeles': 2
        }
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock wishlist stats
      const { getWishlistStats } = await import('@/lib/database/wishlist')
      vi.mocked(getWishlistStats).mockResolvedValue(mockStats)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist?stats=true', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stats).toEqual(mockStats)
      expect(getWishlistStats).toHaveBeenCalledWith(mockUser.id)
    })

    it('should handle empty wishlist', async () => {
      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock empty wishlist
      const { getUserWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(getUserWishlist).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.properties).toHaveLength(0)
      expect(data.total).toBe(0)
    })

    it('should handle database errors', async () => {
      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock database error
      const { getUserWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(getUserWishlist).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to get wishlist')
    })
  })

  describe('POST /api/user/wishlist', () => {
    it('should add property to wishlist successfully', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'add',
        notes: 'Great property!',
        priority: 'high'
      }

      const mockWishlistItem = {
        id: 'wishlist-123',
        userId: mockUser.id,
        propertyId: requestBody.propertyId,
        addedAt: new Date(),
        notes: requestBody.notes,
        priority: requestBody.priority
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property not in wishlist
      const { isInWishlist, addToWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(isInWishlist).mockResolvedValue(false)
      vi.mocked(addToWishlist).mockResolvedValue(mockWishlistItem)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Property added to wishlist')
      expect(data.item).toEqual(mockWishlistItem)
      expect(addToWishlist).toHaveBeenCalledWith(
        mockUser.id,
        requestBody.propertyId,
        requestBody.notes,
        requestBody.priority
      )
    })

    it('should remove property from wishlist successfully', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'remove'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock successful removal
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(removeFromWishlist).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Property removed from wishlist')
      expect(removeFromWishlist).toHaveBeenCalledWith(mockUser.id, requestBody.propertyId)
    })

    it('should reject adding property already in wishlist', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'add'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property already in wishlist
      const { isInWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(isInWishlist).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property already in wishlist')
    })

    it('should handle removing non-existent property', async () => {
      const requestBody = {
        propertyId: 'non-existent-property',
        action: 'remove'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock removal failure (property not found)
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(removeFromWishlist).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property not found in wishlist')
    })

    it('should validate required fields', async () => {
      const requestBody = {
        // Missing propertyId and action
        notes: 'Some notes'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property ID and action are required')
    })

    it('should reject invalid action', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'invalid-action'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid action. Use "add" or "remove"')
    })

    it('should use default priority when not specified', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'add'
        // No priority specified
      }

      const mockWishlistItem = {
        id: 'wishlist-123',
        userId: mockUser.id,
        propertyId: requestBody.propertyId,
        addedAt: new Date(),
        notes: undefined,
        priority: 'medium'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property not in wishlist
      const { isInWishlist, addToWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(isInWishlist).mockResolvedValue(false)
      vi.mocked(addToWishlist).mockResolvedValue(mockWishlistItem)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(addToWishlist).toHaveBeenCalledWith(
        mockUser.id,
        requestBody.propertyId,
        undefined,
        'medium' // Default priority
      )
    })

    it('should handle database errors during add operation', async () => {
      const requestBody = {
        propertyId: 'property-123',
        action: 'add'
      }

      // Mock auth middleware
      const { requireAuth } = await import('@/lib/auth/middleware')
      vi.mocked(requireAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock property not in wishlist but add operation fails
      const { isInWishlist, addToWishlist } = await import('@/lib/database/wishlist')
      vi.mocked(isInWishlist).mockResolvedValue(false)
      vi.mocked(addToWishlist).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })
  })
})