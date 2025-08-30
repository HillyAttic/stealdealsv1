import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';
import { clearWishlist } from '@/lib/database/wishlist';

// Mock the auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => {
    // Mock authenticated user
    const mockUser = { id: 'test-user-1', email: 'test@example.com' };
    const requestWithUser = { ...request, user: mockUser };
    return handler(requestWithUser);
  })
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn().mockResolvedValue({
    id: 'prop-123',
    title: 'Test Property',
    location: 'Test Location',
    category: 'Apartment',
    price: 1000000,
    image: 'test-image.jpg'
  })
}));

describe('Wishlist API Routes', () => {
  const testUserId = 'test-user-1';
  const testPropertyId = 'prop-123';

  beforeEach(async () => {
    // Clear wishlist before each test
    await clearWishlist(testUserId);
  });

  describe('GET /api/user/wishlist', () => {
    it('should return empty wishlist for new user', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        properties: [],
        total: 0,
        user: 'authenticated'
      });
    });

    it('should return wishlist stats when requested', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist?stats=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        stats: {
          total: 0,
          byPriority: { low: 0, medium: 0, high: 0 },
          byType: {}
        }
      });
    });
  });

  describe('POST /api/user/wishlist', () => {
    it('should add property to wishlist', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add',
          notes: 'Test notes',
          priority: 'high'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        message: 'Property added to wishlist',
        item: {
          propertyId: testPropertyId,
          userId: testUserId,
          notes: 'Test notes',
          priority: 'high'
        }
      });
    });

    it('should not add duplicate property', async () => {
      // Add property first
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add'
        })
      });
      await POST(addRequest);

      // Try to add same property again
      const duplicateRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add'
        })
      });

      const response = await POST(duplicateRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: 'Property already in wishlist'
      });
    });

    it('should remove property from wishlist', async () => {
      // Add property first
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add'
        })
      });
      await POST(addRequest);

      // Remove property
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'remove'
        })
      });

      const response = await POST(removeRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        message: 'Property removed from wishlist'
      });
    });

    it('should return error for removing non-existing property', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'non-existing',
          action: 'remove'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toMatchObject({
        success: false,
        error: 'Property not found in wishlist'
      });
    });

    it('should return error for invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'invalid'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: 'Invalid action. Use "add" or "remove"'
      });
    });

    it('should return error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add'
          // Missing propertyId
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: 'Property ID and action are required'
      });
    });
  });

  describe('Integration Test - Full Wishlist Flow', () => {
    it('should complete add -> get -> remove -> get flow', async () => {
      // 1. Add property
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add',
          notes: 'Integration test property',
          priority: 'high'
        })
      });
      const addResponse = await POST(addRequest);
      expect(addResponse.status).toBe(200);

      // 2. Get wishlist - should contain the property
      const getRequest1 = new NextRequest('http://localhost:3000/api/user/wishlist');
      const getResponse1 = await GET(getRequest1);
      const getData1 = await getResponse1.json();

      expect(getResponse1.status).toBe(200);
      expect(getData1.success).toBe(true);
      expect(getData1.properties).toHaveLength(1);
      expect(getData1.properties[0]).toMatchObject({
        id: testPropertyId,
        title: 'Test Property',
        notes: 'Integration test property',
        priority: 'high'
      });

      // 3. Remove property
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'remove'
        })
      });
      const removeResponse = await POST(removeRequest);
      expect(removeResponse.status).toBe(200);

      // 4. Get wishlist - should be empty
      const getRequest2 = new NextRequest('http://localhost:3000/api/user/wishlist');
      const getResponse2 = await GET(getRequest2);
      const getData2 = await getResponse2.json();

      expect(getResponse2.status).toBe(200);
      expect(getData2.success).toBe(true);
      expect(getData2.properties).toHaveLength(0);
      expect(getData2.total).toBe(0);
    });
  });
});