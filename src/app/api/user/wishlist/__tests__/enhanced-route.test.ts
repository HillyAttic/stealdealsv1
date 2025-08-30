import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { PUT, DELETE } from '../route'

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn()
}))

// Mock dependencies
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => handler(request))
}))

jest.mock('@/lib/database/wishlist', () => ({
  updateWishlistItem: jest.fn(),
  removeFromWishlist: jest.fn()
}))

describe('Enhanced Wishlist API Endpoints', () => {
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
    jest.clearAllMocks()
  })

  describe('PUT /api/user/wishlist', () => {
    it('should update wishlist item metadata successfully', async () => {
      const requestBody = {
        propertyId: 'property-123',
        notes: 'Updated notes',
        priority: 'high'
      }

      const mockUpdatedItem = {
        id: 'wishlist-123',
        userId: mockUser.id,
        propertyId: requestBody.propertyId,
        addedAt: new Date(),
        notes: requestBody.notes,
        priority: requestBody.priority
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock successful update
      const { updateWishlistItem } = await import('@/lib/database/wishlist')
      jest.mocked(updateWishlistItem).mockResolvedValue(mockUpdatedItem)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Wishlist item metadata updated')
      expect(data.item).toEqual({
        ...mockUpdatedItem,
        addedAt: mockUpdatedItem.addedAt.toISOString()
      })
      expect(updateWishlistItem).toHaveBeenCalledWith(
        mockUser.id,
        requestBody.propertyId,
        { notes: requestBody.notes, priority: requestBody.priority }
      )
    })

    it('should update only notes when priority not provided', async () => {
      const requestBody = {
        propertyId: 'property-123',
        notes: 'Updated notes only'
      }

      const mockUpdatedItem = {
        id: 'wishlist-123',
        userId: mockUser.id,
        propertyId: requestBody.propertyId,
        addedAt: new Date(),
        notes: requestBody.notes,
        priority: 'medium'
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock successful update
      const { updateWishlistItem } = await import('@/lib/database/wishlist')
      jest.mocked(updateWishlistItem).mockResolvedValue(mockUpdatedItem)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(updateWishlistItem).toHaveBeenCalledWith(
        mockUser.id,
        requestBody.propertyId,
        { notes: requestBody.notes, priority: undefined }
      )
    })

    it('should handle property not found in wishlist', async () => {
      const requestBody = {
        propertyId: 'non-existent-property',
        notes: 'Updated notes'
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock update failure (property not found)
      const { updateWishlistItem } = await import('@/lib/database/wishlist')
      jest.mocked(updateWishlistItem).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property not found in wishlist')
      expect(data.code).toBe('PROPERTY_NOT_IN_WISHLIST')
    })

    it('should validate required propertyId', async () => {
      const requestBody = {
        notes: 'Updated notes'
        // Missing propertyId
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property ID is required and must be a string')
      expect(data.code).toBe('INVALID_PROPERTY_ID')
    })

    it('should validate that at least one field is provided for update', async () => {
      const requestBody = {
        propertyId: 'property-123'
        // No notes or priority
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('At least one field (notes or priority) must be provided for update')
      expect(data.code).toBe('NO_UPDATE_FIELDS')
    })

    it('should validate priority values', async () => {
      const requestBody = {
        propertyId: 'property-123',
        priority: 'invalid-priority'
      }

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Priority must be one of: low, medium, high')
      expect(data.code).toBe('INVALID_PRIORITY')
    })
  })

  describe('DELETE /api/user/wishlist', () => {
    it('should remove property from wishlist successfully', async () => {
      const propertyId = 'property-123'

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock successful removal
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(removeFromWishlist).mockResolvedValue(true)

      const request = new NextRequest(`http://localhost:3000/api/user/wishlist?propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Property removed from wishlist')
      expect(removeFromWishlist).toHaveBeenCalledWith(mockUser.id, propertyId)
    })

    it('should handle property not found in wishlist', async () => {
      const propertyId = 'non-existent-property'

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock removal failure (property not found)
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(removeFromWishlist).mockResolvedValue(false)

      const request = new NextRequest(`http://localhost:3000/api/user/wishlist?propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property not found in wishlist')
      expect(data.code).toBe('PROPERTY_NOT_IN_WISHLIST')
    })

    it('should validate required propertyId parameter', async () => {
      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Property ID is required as a query parameter')
      expect(data.code).toBe('MISSING_PROPERTY_ID')
    })

    it('should handle database errors', async () => {
      const propertyId = 'property-123'

      // Mock auth middleware
      const { optionalAuth } = await import('@/lib/auth/middleware')
      jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
        return handler(mockAuthenticatedRequest)
      })

      // Mock database error
      const { removeFromWishlist } = await import('@/lib/database/wishlist')
      jest.mocked(removeFromWishlist).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest(`http://localhost:3000/api/user/wishlist?propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to remove property from wishlist')
      expect(data.code).toBe('WISHLIST_DELETE_FAILED')
    })
  })
})