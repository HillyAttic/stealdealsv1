import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';
import { clearWishlist, addToWishlist, getUserWishlist } from '@/lib/database/wishlist';
import { getPropertyById } from '@/lib/firebase';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn()
}));

// Mock the auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => {
    // Extract user from headers if provided
    const headers = request.headers;
    const userId = headers.get?.('x-mock-user-id') || 'user-1';
    const userEmail = headers.get?.('x-mock-user-email') || 'test@example.com';
    
    const mockUser = { id: userId, email: userEmail };
    const requestWithUser = { ...request, user: mockUser };
    return handler(requestWithUser);
  })
}));

const mockGetPropertyById = jest.mocked(getPropertyById);

describe('End-to-End Wishlist Flow', () => {
  const testUserId = 'user-1';
  const testPropertyId = '2'; // This matches the property ID from the error log
  
  // Mock property that should exist in Firebase
  const mockProperty = {
    id: '2',
    title: 'Test Vacant Property',
    location: 'Test Location Delhi',
    category: 'Office',
    propertyType: 'Vacant',
    price: 2000000,
    image: 'test-image.jpg',
    state: 'Delhi',
    city: 'Delhi',
    floor: '2nd Floor',
    superArea: '1000'
  };

  beforeEach(async () => {
    // Clear all wishlists before each test
    jest.clearAllMocks();
    await clearWishlist(testUserId);
    
    // Setup default mock to return the property
    mockGetPropertyById.mockResolvedValue(mockProperty);
  });

  describe('Full Wishlist Journey - Add Property from Property Page', () => {
    it('should successfully add property to wishlist via API', async () => {
      console.log(`[E2E Test] Testing add property ${testPropertyId} to wishlist`);
      
      // 1. Verify property exists in Firebase
      const property = await getPropertyById(testPropertyId);
      expect(property).toBeTruthy();
      expect(property?.id).toBe(testPropertyId);
      console.log(`[E2E Test] Property found: ${property?.title}`);
      
      // 2. Add property to wishlist via API (simulating frontend call)
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add',
          notes: 'Added from property page',
          priority: 'medium'
        })
      });

      const addResponse = await POST(addRequest);
      const addData = await addResponse.json();
      
      console.log(`[E2E Test] Add Response:`, addData);
      expect(addResponse.status).toBe(200);
      expect(addData.success).toBe(true);
      expect(addData.item.propertyId).toBe(testPropertyId);
      
      // 3. Verify it appears in wishlist via GET API
      const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        }
      });
      
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();
      
      console.log(`[E2E Test] Get Response:`, getData);
      expect(getResponse.status).toBe(200);
      expect(getData.success).toBe(true);
      expect(getData.properties).toHaveLength(1);
      expect(getData.properties[0].id).toBe(testPropertyId);
      expect(getData.properties[0].title).toBe(mockProperty.title);
      expect(getData.total).toBe(1);
    });

    it('should handle non-existent property gracefully', async () => {
      const nonExistentId = 'non-existent-property';
      
      // Mock property not found
      mockGetPropertyById.mockImplementation((id) => {
        if (id === nonExistentId) {
          return Promise.resolve(null);
        }
        return Promise.resolve(mockProperty);
      });
      
      // Add non-existent property to wishlist
      const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        },
        body: JSON.stringify({
          propertyId: nonExistentId,
          action: 'add'
        })
      });

      const addResponse = await POST(addRequest);
      const addData = await addResponse.json();
      
      console.log(`[E2E Test] Non-existent property response:`, addData);
      expect(addResponse.status).toBe(200); // Should still add to wishlist
      expect(addData.success).toBe(true);
      
      // Get wishlist - should show the item but with "not found" properties
      const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        }
      });
      
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();
      
      console.log(`[E2E Test] Get wishlist with non-existent property:`, getData);
      expect(getResponse.status).toBe(200);
      expect(getData.properties).toHaveLength(1);
      expect(getData.properties[0].id).toBe(nonExistentId);
      expect(getData.properties[0].title).toContain('Not Found');
    });
  });

  describe('Remove Property from Wishlist', () => {
    it('should successfully remove existing property from wishlist', async () => {
      // First add the property
      await addToWishlist(testUserId, testPropertyId, 'Test property', 'high');
      
      // Verify it's in wishlist
      let wishlist = await getUserWishlist(testUserId);
      expect(wishlist).toHaveLength(1);
      console.log(`[E2E Test] Property added, wishlist count: ${wishlist.length}`);
      
      // Remove via API
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'remove'
        })
      });

      const removeResponse = await POST(removeRequest);
      const removeData = await removeResponse.json();
      
      console.log(`[E2E Test] Remove Response:`, removeData);
      expect(removeResponse.status).toBe(200);
      expect(removeData.success).toBe(true);
      
      // Verify it's removed from wishlist
      const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        }
      });
      
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();
      
      console.log(`[E2E Test] Final wishlist:`, getData);
      expect(getData.properties).toHaveLength(0);
      expect(getData.total).toBe(0);
    });

    it('should return proper error when removing non-existent property', async () => {
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        },
        body: JSON.stringify({
          propertyId: 'non-existent',
          action: 'remove'
        })
      });

      const removeResponse = await POST(removeRequest);
      const removeData = await removeResponse.json();
      
      console.log(`[E2E Test] Remove non-existent property:`, removeData);
      expect(removeResponse.status).toBe(404);
      expect(removeData.success).toBe(false);
      expect(removeData.error).toBe('Property not found in wishlist');
    });
  });

  describe('Multiple Properties Wishlist Management', () => {
    it('should handle multiple properties correctly', async () => {
      const property1Id = '1';
      const property2Id = '2';
      const property3Id = '3';
      
      // Mock multiple properties
      mockGetPropertyById.mockImplementation((id) => {
        return Promise.resolve({
          ...mockProperty,
          id,
          title: `Test Property ${id}`,
          location: `Location ${id}`
        });
      });
      
      // Add multiple properties
      for (const id of [property1Id, property2Id, property3Id]) {
        const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': testUserId,
            'x-mock-user-email': 'test@example.com'
          },
          body: JSON.stringify({
            propertyId: id,
            action: 'add',
            notes: `Property ${id} notes`,
            priority: 'medium'
          })
        });
        
        const response = await POST(addRequest);
        expect(response.status).toBe(200);
        console.log(`[E2E Test] Added property ${id}`);
      }
      
      // Get full wishlist
      const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        }
      });
      
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();
      
      console.log(`[E2E Test] Full wishlist:`, getData);
      expect(getData.properties).toHaveLength(3);
      expect(getData.total).toBe(3);
      
      // Verify each property
      const propertyIds = getData.properties.map((p: any) => p.id);
      expect(propertyIds).toContain(property1Id);
      expect(propertyIds).toContain(property2Id);
      expect(propertyIds).toContain(property3Id);
      
      // Remove middle property
      const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        },
        body: JSON.stringify({
          propertyId: property2Id,
          action: 'remove'
        })
      });
      
      const removeResponse = await POST(removeRequest);
      expect(removeResponse.status).toBe(200);
      
      // Verify updated wishlist
      const getFinalRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': testUserId,
          'x-mock-user-email': 'test@example.com'
        }
      });
      
      const getFinalResponse = await GET(getFinalRequest);
      const getFinalData = await getFinalResponse.json();
      
      console.log(`[E2E Test] Final wishlist after removal:`, getFinalData);
      expect(getFinalData.properties).toHaveLength(2);
      expect(getFinalData.total).toBe(2);
      
      const finalPropertyIds = getFinalData.properties.map((p: any) => p.id);
      expect(finalPropertyIds).toContain(property1Id);
      expect(finalPropertyIds).toContain(property3Id);
      expect(finalPropertyIds).not.toContain(property2Id);
    });
  });

  describe('User Context Switching', () => {
    it('should isolate wishlists between different users', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';
      
      // Add property to user-1 wishlist
      const addUser1Request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': user1Id,
          'x-mock-user-email': 'user1@example.com'
        },
        body: JSON.stringify({
          propertyId: testPropertyId,
          action: 'add'
        })
      });
      
      await POST(addUser1Request);
      
      // Check user-1 wishlist
      const getUser1Request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': user1Id,
          'x-mock-user-email': 'user1@example.com'
        }
      });
      
      const user1Response = await GET(getUser1Request);
      const user1Data = await user1Response.json();
      
      expect(user1Data.total).toBe(1);
      console.log(`[E2E Test] User 1 wishlist: ${user1Data.total} items`);
      
      // Check user-2 wishlist (should be empty)
      const getUser2Request = new NextRequest('http://localhost:3000/api/user/wishlist', {
        headers: {
          'x-mock-user-id': user2Id,
          'x-mock-user-email': 'user2@example.com'
        }
      });
      
      const user2Response = await GET(getUser2Request);
      const user2Data = await user2Response.json();
      
      expect(user2Data.total).toBe(0);
      console.log(`[E2E Test] User 2 wishlist: ${user2Data.total} items`);
      
      // User 1 should still have their property
      expect(user1Data.properties[0].id).toBe(testPropertyId);
    });
  });
});