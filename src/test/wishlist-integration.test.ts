import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';

// In-memory database mock for testing
let mockDatabase: Record<string, Record<string, any>> = {};

// Mock Firebase Realtime Database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn((db: any, path?: string) => ({ 
    key: path || '', 
    path: path || '' 
  })),
  set: jest.fn((ref: any, data: any) => {
    const pathParts = ref.path.split('/');
    let current = mockDatabase;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = data;
    return Promise.resolve();
  }),
  get: jest.fn((ref: any) => {
    // Handle query objects (for orderByChild + equalTo)
    if (ref.conditions) {
      const pathParts = ref.path.split('/');
      let current = mockDatabase;
      for (const part of pathParts) {
        if (!current || !current[part]) {
          return Promise.resolve({
            exists: () => false,
            val: () => null,
            forEach: jest.fn()
          });
        }
        current = current[part];
      }
      
      // Filter results based on query conditions
      const orderBy = ref.conditions.find((c: any) => c?.type === 'orderByChild');
      const equalTo = ref.conditions.find((c: any) => c?.type === 'equalTo');
      
      if (orderBy && equalTo && typeof current === 'object') {
        const filtered: Record<string, any> = {};
        Object.entries(current).forEach(([key, value]) => {
          if (value && typeof value === 'object' && value[orderBy.field] === equalTo.value) {
            filtered[key] = value;
          }
        });
        
        return Promise.resolve({
          exists: () => Object.keys(filtered).length > 0,
          val: () => Object.keys(filtered).length > 0 ? filtered : null,
          forEach: (callback: (snapshot: any) => void) => {
            Object.entries(filtered).forEach(([key, value]) => {
              callback({
                key,
                val: () => value
              });
            });
          }
        });
      }
    }
    
    // Handle regular path references
    const pathParts = ref.path.split('/');
    let current = mockDatabase;
    for (const part of pathParts) {
      if (!current || !current[part]) {
        return Promise.resolve({
          exists: () => false,
          val: () => null,
          forEach: jest.fn()
        });
      }
      current = current[part];
    }
    
    return Promise.resolve({
      exists: () => current !== null && current !== undefined,
      val: () => current,
      forEach: (callback: (snapshot: any) => void) => {
        if (typeof current === 'object' && current !== null) {
          Object.entries(current).forEach(([key, value]) => {
            callback({
              key,
              val: () => value
            });
          });
        }
      }
    });
  }),
  push: jest.fn((ref: any) => {
    const key = `item-${Date.now()}-${Math.random()}`;
    return {
      key,
      path: `${ref.path}/${key}`
    };
  }),
  remove: jest.fn((ref: any) => {
    const pathParts = ref.path.split('/');
    let current = mockDatabase;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        return Promise.resolve();
      }
      current = current[pathParts[i]];
    }
    delete current[pathParts[pathParts.length - 1]];
    return Promise.resolve();
  }),
  update: jest.fn((ref: any, updates: any) => {
    Object.entries(updates).forEach(([path, value]) => {
      // Handle absolute paths (like "wishlists/user-1/item-id")
      let fullPath: string[];
      if (ref.path === '' || ref.path === '/') {
        // Root reference, use path as-is
        fullPath = path.split('/');
      } else {
        // Relative to ref path
        fullPath = `${ref.path}/${path}`.split('/');
      }
      
      let current = mockDatabase;
      for (let i = 0; i < fullPath.length - 1; i++) {
        if (!current[fullPath[i]]) {
          current[fullPath[i]] = {};
        }
        current = current[fullPath[i]];
      }
      if (value === null) {
        delete current[fullPath[fullPath.length - 1]];
      } else {
        current[fullPath[fullPath.length - 1]] = value;
      }
    });
    return Promise.resolve();
  }),
  query: jest.fn((ref: any, ...conditions: any[]) => ({ 
    key: `query-${ref.path}`, 
    path: ref.path,
    conditions 
  })),
  orderByChild: jest.fn((field: string) => ({ type: 'orderByChild', field })),
  equalTo: jest.fn((value: any) => ({ type: 'equalTo', value })),
  onValue: jest.fn(),
  off: jest.fn()
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn(),
  database: { mock: true }
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const requestWithUser = { ...request, user: mockUser };
    return handler(requestWithUser);
  })
}));

// Import and mock getPropertyById after the mock is set up
import { getPropertyById } from '@/lib/firebase';
const mockGetPropertyById = jest.mocked(getPropertyById);

describe('Wishlist Integration Test with Mocked Firebase', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase = {}; // Clear mock database
    
    mockGetPropertyById.mockImplementation((id) => {
      const property = testProperties.find(p => p.id === id);
      return Promise.resolve(property || null);
    });
  });

  describe('Basic Wishlist Operations', () => {
    it('should add and retrieve wishlist items correctly', async () => {
      console.log('=== TEST: Basic Add and Retrieve ===');
      
      // Add property to wishlist
      const addResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'add', notes: 'Great property!' })
      }));
      
      const addData = await addResponse.json();
      console.log('Add result:', { status: addResponse.status, success: addData.success });
      expect(addResponse.status).toBe(200);
      expect(addData.success).toBe(true);
      
      // Check mockDatabase state
      console.log('Mock database after add:', JSON.stringify(mockDatabase, null, 2));
      
      // Get wishlist
      const getResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));
      const getData = await getResponse.json();
      
      console.log('Get result:', { 
        status: getResponse.status, 
        total: getData.total,
        propertiesCount: getData.properties?.length 
      });
      
      expect(getResponse.status).toBe(200);
      expect(getData.total).toBeGreaterThan(0);
      expect(getData.properties).toBeDefined();
      
      console.log('BASIC ADD/RETRIEVE TEST PASSED!');
    });

    it('should handle duplicate additions correctly', async () => {
      console.log('=== TEST: Duplicate Addition Handling ===');
      
      // First addition
      const firstAdd = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '2', action: 'add' })
      }));
      
      const firstData = await firstAdd.json();
      console.log('First add:', { status: firstAdd.status, success: firstData.success });
      
      // Second addition (should handle duplicate)
      const secondAdd = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '2', action: 'add' })
      }));
      
      const secondData = await secondAdd.json();
      console.log('Second add:', { 
        status: secondAdd.status, 
        success: secondData.success,
        error: secondData.error 
      });
      
      // Should either return success (already exists) or error (duplicate)
      expect([200, 400]).toContain(secondAdd.status);
      
      console.log('DUPLICATE HANDLING TEST PASSED!');
    });

    it('should remove wishlist items correctly', async () => {
      console.log('=== TEST: Remove Wishlist Items ===');
      
      // First add an item
      await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'add' })
      }));
      
      // Then remove it
      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'remove' })
      }));
      
      const removeData = await removeResponse.json();
      console.log('Remove result:', { 
        status: removeResponse.status, 
        success: removeData.success 
      });
      
      // Should successfully remove
      expect(removeResponse.status).toBe(200);
      
      // Check that it's empty
      const getResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));
      const getData = await getResponse.json();
      
      console.log('After removal:', { total: getData.total });
      expect(getData.total).toBe(0);
      
      console.log('REMOVE TEST PASSED!');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle removing non-existent items', async () => {
      console.log('=== TEST: Remove Non-existent Item ===');
      
      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: 'non-existent', action: 'remove' })
      }));
      
      const removeData = await removeResponse.json();
      console.log('Remove non-existent:', { 
        status: removeResponse.status,
        success: removeData.success 
      });
      
      // Should handle gracefully (either 404 or successful no-op)
      expect([200, 404]).toContain(removeResponse.status);
      
      console.log('REMOVE NON-EXISTENT TEST PASSED!');
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics', async () => {
      console.log('=== TEST: Statistics ===');
      
      // Add some items
      await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '1', action: 'add' })
      }));
      
      await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: '2', action: 'add' })
      }));
      
      // Get stats
      const statsResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist?stats=true'));
      const statsData = await statsResponse.json();
      
      console.log('Stats:', { 
        status: statsResponse.status,
        total: statsData.stats?.total 
      });
      
      expect(statsResponse.status).toBe(200);
      expect(statsData.stats).toBeDefined();
      expect(typeof statsData.stats.total).toBe('number');
      
      console.log('STATISTICS TEST PASSED!');
    });
  });
});