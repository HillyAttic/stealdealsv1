import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';

// Mock Firebase and database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  push: jest.fn(),
  child: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));

jest.mock('@/lib/database/wishlist', () => ({
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  getUserWishlist: jest.fn(),
  getRawWishlistItems: jest.fn(),
  clearWishlist: jest.fn(),
  getUserWishlistRef: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn(),
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn((request, handler) => handler(request)),
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-1' })),
}));

describe('Wishlist API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/user/wishlist', () => {
    it('should return user wishlist successfully', async () => {
      const { getUserWishlist } = await import('@/lib/database/wishlist');
      const { getPropertyById } = await import('@/lib/firebase');
      
      const mockWishlistItems = [
        {
          id: 'wishlist-1',
          userId: 'test-user-1',
          propertyId: 'property-1',
          addedAt: new Date(),
          notes: 'Great location',
          priority: 'high' as const
        }
      ];

      const mockProperty = {
        id: 'property-1',
        title: 'Test Property',
        location: 'Test Location',
        price: 100000,
        imageUrl: 'test-image.jpg',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        area: 1000
      };

      jest.mocked(getUserWishlist).mockResolvedValue(mockWishlistItems);
      jest.mocked(getPropertyById).mockResolvedValue(mockProperty);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        id: 'wishlist-1',
        propertyId: 'property-1',
        notes: 'Great location',
        priority: 'high',
        property: mockProperty
      });
    });

    it('should return wishlist stats when stats=true', async () => {
      const { getUserWishlist } = await import('@/lib/database/wishlist');
      
      const mockWishlistItems = [
        { id: '1', userId: 'test-user-1', propertyId: 'prop-1', addedAt: new Date() },
        { id: '2', userId: 'test-user-1', propertyId: 'prop-2', addedAt: new Date() }
      ];

      jest.mocked(getUserWishlist).mockResolvedValue(mockWishlistItems);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist?stats=true', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        totalItems: 2,
        recentlyAdded: expect.any(Array)
      });
    });

    it('should handle empty wishlist', async () => {
      const { getUserWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(getUserWishlist).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      const { getUserWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(getUserWishlist).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to get wishlist');
    });

    it('should handle missing property data gracefully', async () => {
      const { getUserWishlist } = await import('@/lib/database/wishlist');
      const { getPropertyById } = await import('@/lib/firebase');
      
      const mockWishlistItems = [
        {
          id: 'wishlist-1',
          userId: 'test-user-1',
          propertyId: 'non-existent-property',
          addedAt: new Date()
        }
      ];

      jest.mocked(getUserWishlist).mockResolvedValue(mockWishlistItems);
      jest.mocked(getPropertyById).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data[0].property).toMatchObject({
        id: 'non-existent-property',
        title: 'Property not found',
        location: 'Unknown',
        price: 0,
        imageUrl: '/placeholder-property.jpg',
        type: 'unknown'
      });
    });
  });

  describe('POST /api/user/wishlist', () => {
    it('should add property to wishlist successfully', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      const { getPropertyById } = await import('@/lib/firebase');
      
      const mockProperty = {
        id: 'property-1',
        title: 'Test Property',
        location: 'Test Location',
        price: 100000
      };

      jest.mocked(addToWishlist).mockResolvedValue(true);
      jest.mocked(getPropertyById).mockResolvedValue(mockProperty);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add',
          propertyId: 'property-1',
          notes: 'Interested in this property',
          priority: 'high'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('added to wishlist');
      expect(addToWishlist).toHaveBeenCalledWith(
        'test-user-1',
        'property-1',
        expect.objectContaining({
          notes: 'Interested in this property',
          priority: 'high'
        })
      );
    });

    it('should remove property from wishlist successfully', async () => {
      const { removeFromWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(removeFromWishlist).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'remove',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('removed from wishlist');
      expect(removeFromWishlist).toHaveBeenCalledWith('test-user-1', 'property-1');
    });

    it('should handle invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'invalid',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });

    it('should handle missing propertyId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Property ID is required');
    });

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request body');
    });

    it('should handle database errors during add', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to add property to wishlist');
    });

    it('should handle database errors during remove', async () => {
      const { removeFromWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(removeFromWishlist).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'remove',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to remove property from wishlist');
    });

    it('should handle non-existent property removal', async () => {
      const { removeFromWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(removeFromWishlist).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'remove',
          propertyId: 'non-existent-property'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Property not found in wishlist');
    });

    it('should validate priority values', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add',
          propertyId: 'property-1',
          priority: 'invalid-priority'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid priority value');
    });

    it('should handle duplicate additions gracefully', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(false); // Indicates already exists

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('already in wishlist');
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle concurrent requests safely', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);

      const requests = Array.from({ length: 5 }, (_, i) => 
        POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': 'test-user-1'
          },
          body: JSON.stringify({
            action: 'add',
            propertyId: `property-${i}`
          })
        }))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should sanitize input data', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          action: 'add',
          propertyId: 'property-1',
          notes: '<script>alert("xss")</script>Legitimate note',
          priority: 'high'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify that the addToWishlist was called with sanitized data
      expect(addToWishlist).toHaveBeenCalledWith(
        'test-user-1',
        'property-1',
        expect.objectContaining({
          notes: expect.not.stringContaining('<script>'),
          priority: 'high'
        })
      );
    });
  });
});