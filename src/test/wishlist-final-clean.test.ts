import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';
import { clearWishlist } from '@/lib/database/wishlist';
import { getPropertyById } from '@/lib/firebase';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn(),
  database: {}
}));

// Mock Firebase Realtime Database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({ key: 'mock-ref' })),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null, forEach: jest.fn() })),
  push: jest.fn(() => ({ key: 'mock-key' })),
  remove: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  query: jest.fn(() => ({ key: 'mock-query' })),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn()
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const requestWithUser = { ...request, user: mockUser };
    return handler(requestWithUser);
  })
}));

const mockGetPropertyById = jest.mocked(getPropertyById);

describe('Final Wishlist Integration Test', () => {
  const userId = 'user-1';
  
  const testProperties = [
    {
      id: '1',
      title: 'SAFDARJUNG ENCLAVE Industrial Property',
      location: 'Safdarjung Enclave, Delhi',
      category: 'Industrial',
      propertyType: 'Vacant',
      price: 5000000,
      image: '/property1.jpg'
    },
    {
      id: '2',
      title: 'DEFENCE COLONY High-Street Property',
      location: 'Defence Colony, Delhi',
      category: 'High-Street',
      propertyType: 'Vacant',
      price: 3500000,
      image: '/property2.jpg'
    }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearWishlist(userId);
    
    mockGetPropertyById.mockImplementation((id) => {
      const property = testProperties.find(p => p.id === id);
      return Promise.resolve(property || null);
    });
  });

  describe('Complete User Journey', () => {
    it('should handle the exact user scenario: Dashboard shows count, Wishlist shows properties', async () => {
      console.log('=== FINAL TEST: Complete User Journey ===');
      
      // Step 1: User adds property to wishlist
      console.log('Step 1: User adds property 2 to wishlist');
      const addResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '2', action: 'add', notes: 'Looks good!' })
      }));
      
      const addData = await addResponse.json();
      console.log('Add result:', { status: addResponse.status, success: addData.success });
      expect(addResponse.status).toBe(200);
      expect(addData.success).toBe(true);
      
      // Step 2: Dashboard stats check
      console.log('Step 2: Check dashboard stats');
      const dashboardResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist?stats=true'));
      const dashboardData = await dashboardResponse.json();
      
      console.log('Dashboard stats:', { total: dashboardData.stats.total });
      expect(dashboardData.stats.total).toBe(1);
      
      // Step 3: Wishlist page check
      console.log('Step 3: Check wishlist page');
      const wishlistResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));
      const wishlistData = await wishlistResponse.json();
      
      console.log('Wishlist data:', {
        total: wishlistData.total,
        propertiesCount: wishlistData.properties?.length,
        firstPropertyTitle: wishlistData.properties?.[0]?.title
      });
      
      expect(wishlistData.total).toBe(1);
      expect(wishlistData.properties).toHaveLength(1);
      expect(wishlistData.properties[0].id).toBe('2');
      expect(wishlistData.properties[0].title).toBe('DEFENCE COLONY High-Street Property');
      
      // Step 4: Remove property
      console.log('Step 4: Remove property from wishlist');
      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '2', action: 'remove' })
      }));
      
      const removeData = await removeResponse.json();
      console.log('Remove result:', { status: removeResponse.status, success: removeData.success });
      expect(removeResponse.status).toBe(200);
      expect(removeData.success).toBe(true);
      
      // Step 5: Verify empty
      console.log('Step 5: Verify empty wishlist');
      const finalResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));
      const finalData = await finalResponse.json();
      
      console.log('Final state:', { total: finalData.total });
      expect(finalData.total).toBe(0);
      expect(finalData.properties).toHaveLength(0);
      
      console.log('USER JOURNEY TEST PASSED!');
    });

    it('should handle error scenarios correctly', async () => {
      console.log('=== FINAL TEST: Error Scenarios ===');
      
      // Remove non-existent property
      console.log('Testing removal of non-existent property');
      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: 'non-existent', action: 'remove' })
      }));
      
      const removeData = await removeResponse.json();
      console.log('Remove non-existent result:', {
        status: removeResponse.status,
        error: removeData.error
      });
      
      expect(removeResponse.status).toBe(404);
      expect(removeData.success).toBe(false);
      expect(removeData.error).toBe('Property not found in wishlist');
      
      // Add duplicate property
      console.log('Testing duplicate add');
      await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'add' })
      }));
      
      const duplicateResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'add' })
      }));
      
      const duplicateData = await duplicateResponse.json();
      console.log('Duplicate add result:', {
        status: duplicateResponse.status,
        error: duplicateData.error
      });
      
      expect(duplicateResponse.status).toBe(400);
      expect(duplicateData.success).toBe(false);
      expect(duplicateData.error).toBe('Property already in wishlist');
      
      console.log('ERROR SCENARIOS TEST PASSED!');
    });
  });
});