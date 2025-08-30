import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn()
}))

// Mock dependencies
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => handler(request))
}))

jest.mock('@/lib/database/wishlist', () => ({
  isInWishlist: jest.fn()
}))

describe('GET /api/user/wishlist/check', () => {
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

  it('should check if property is in wishlist successfully', async () => {
    const propertyId = 'property-123'

    // Mock auth middleware
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(mockAuthenticatedRequest)
    })

    // Mock property is in wishlist
    const { isInWishlist } = await import('@/lib/database/wishlist')
    jest.mocked(isInWishlist).mockResolvedValue(true)

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.inWishlist).toBe(true)
    expect(data.propertyId).toBe(propertyId)
    expect(data.metadata).toBeDefined()
    expect(data.metadata.requestId).toBeDefined()
    expect(data.metadata.timestamp).toBeDefined()
    expect(data.metadata.duration).toBeDefined()
    expect(isInWishlist).toHaveBeenCalledWith(mockUser.id, propertyId)
  })

  it('should check if property is not in wishlist', async () => {
    const propertyId = 'property-456'

    // Mock auth middleware
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(mockAuthenticatedRequest)
    })

    // Mock property is not in wishlist
    const { isInWishlist } = await import('@/lib/database/wishlist')
    jest.mocked(isInWishlist).mockResolvedValue(false)

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.inWishlist).toBe(false)
    expect(data.propertyId).toBe(propertyId)
    expect(isInWishlist).toHaveBeenCalledWith(mockUser.id, propertyId)
  })

  it('should validate required propertyId parameter', async () => {
    // Mock auth middleware
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(mockAuthenticatedRequest)
    })

    const request = new NextRequest('http://localhost:3000/api/user/wishlist/check', {
      method: 'GET'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Property ID is required as a query parameter')
    expect(data.code).toBe('MISSING_PROPERTY_ID')
  })

  it('should validate propertyId format', async () => {
    const propertyId = '' // Empty string

    // Mock auth middleware
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(mockAuthenticatedRequest)
    })

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET'
    })

    const response = await GET(request)
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
    const { isInWishlist } = await import('@/lib/database/wishlist')
    jest.mocked(isInWishlist).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to check wishlist status')
    expect(data.code).toBe('WISHLIST_CHECK_FAILED')
  })

  it('should handle user identification failure', async () => {
    const propertyId = 'property-123'

    // Mock auth middleware with no user
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(request) // No user attached
    })

    // Mock Clerk returning no user
    const { currentUser } = await import('@clerk/nextjs/server')
    jest.mocked(currentUser).mockRejectedValue(new Error('Database connection failed'))

    // Mock database error for isInWishlist to simulate the error path
    const { isInWishlist } = await import('@/lib/database/wishlist')
    jest.mocked(isInWishlist).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET',
      headers: {} // No mock headers, should use development fallback but then fail on database
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unable to identify user')
    expect(data.code).toBe('USER_IDENTIFICATION_FAILED')
  })

  it('should use development fallback when no user is found', async () => {
    const propertyId = 'property-123'

    // Mock auth middleware with no user
    const { optionalAuth } = await import('@/lib/auth/middleware')
    jest.mocked(optionalAuth).mockImplementation(async (request, handler) => {
      return handler(request) // No user attached
    })

    // Mock Clerk returning no user
    const { currentUser } = await import('@clerk/nextjs/server')
    jest.mocked(currentUser).mockResolvedValue(null)

    // Mock property check
    const { isInWishlist } = await import('@/lib/database/wishlist')
    jest.mocked(isInWishlist).mockResolvedValue(false)

    const request = new NextRequest(`http://localhost:3000/api/user/wishlist/check?propertyId=${propertyId}`, {
      method: 'GET',
      headers: {} // No mock headers, should use development fallback
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.inWishlist).toBe(false)
    expect(isInWishlist).toHaveBeenCalledWith('user-1', propertyId) // Development fallback user
  })
})