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
  
  // Simulate real properties from the user's system
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
    },
    {
      id: '3',
      title: 'CONNAUGHT PLACE Office Space',
      location: 'Connaught Place, Delhi',
      category: 'Office',
      propertyType: 'Vacant',
      price: 8000000,
      image: '/property3.jpg'
    }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearWishlist(userId);
    
    // Mock property lookup
    mockGetPropertyById.mockImplementation((id) => {
      const property = testProperties.find(p => p.id === id);
      return Promise.resolve(property || null);
    });
  });

  describe('Complete User Journey - The Real Fix Test', () => {
    it('should handle the exact user scenario: Wishlist shows count and properties', async () => {
      console.log('\n=== FINAL TEST: Complete User Journey ===\n');\n      \n      // Step 1: User visits property page and adds to wishlist\n      console.log('Step 1: User adds property 2 from property page (/vacant/2)');\n      const addResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: '2', action: 'add', notes: 'Looks good!' })\n      }));\n      \n      const addData = await addResponse.json();\n      console.log('✓ Add result:', { status: addResponse.status, success: addData.success });\n      expect(addResponse.status).toBe(200);\n      \n      // Step 2: User goes to main area to check stats - should see wishlist count = 1\n      console.log('\\nStep 2: User checks wishlist stats');\n      const dashboardResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist?stats=true'));\n      const dashboardData = await dashboardResponse.json();\n      \n      console.log('✓ Dashboard stats:', { total: dashboardData.stats.total });\n      expect(dashboardData.stats.total).toBe(1);\n      \n      // Step 3: User clicks on wishlist sidebar - should see the property\n      console.log('\\nStep 3: User clicks wishlist in sidebar (/wishlist)');\n      const wishlistResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));\n      const wishlistData = await wishlistResponse.json();\n      \n      console.log('✓ Wishlist page data:', {\n        total: wishlistData.total,\n        propertiesCount: wishlistData.properties?.length,\n        firstPropertyTitle: wishlistData.properties?.[0]?.title\n      });\n      \n      expect(wishlistData.total).toBe(1);\n      expect(wishlistData.properties).toHaveLength(1);\n      expect(wishlistData.properties[0].id).toBe('2');\n      expect(wishlistData.properties[0].title).toBe('DEFENCE COLONY High-Street Property');\n      \n      // Step 4: User tries to remove from wishlist page - should work\n      console.log('\\nStep 4: User removes property from wishlist page');\n      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: '2', action: 'remove' })\n      }));\n      \n      const removeData = await removeResponse.json();\n      console.log('✓ Remove result:', { status: removeResponse.status, success: removeData.success });\n      expect(removeResponse.status).toBe(200);\n      expect(removeData.success).toBe(true);\n      \n      // Step 5: Wishlist should now be empty\n      console.log('\\nStep 5: Verify wishlist is empty');\n      const finalResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));\n      const finalData = await finalResponse.json();\n      \n      console.log('✓ Final state:', { total: finalData.total });\n      expect(finalData.total).toBe(0);\n      expect(finalData.properties).toHaveLength(0);\n      \n      console.log('\\n🎉 USER JOURNEY TEST PASSED! 🎉\\n');\n    });\n\n    it('should handle multiple properties correctly', async () => {\n      console.log('\\n=== FINAL TEST: Multiple Properties ===\\n');\n      \n      // Add multiple properties\n      const propertiesToAdd = ['1', '2', '3'];\n      console.log('Adding properties:', propertiesToAdd);\n      \n      for (const propertyId of propertiesToAdd) {\n        const response = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ propertyId, action: 'add' })\n        }));\n        expect(response.status).toBe(200);\n        console.log(`✓ Added property ${propertyId}`);\n      }\n      \n      // Verify all properties are in wishlist\n      const wishlistResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));\n      const wishlistData = await wishlistResponse.json();\n      \n      console.log('\\nWishlist contents:', {\n        total: wishlistData.total,\n        propertyIds: wishlistData.properties.map((p: any) => p.id),\n        propertyTitles: wishlistData.properties.map((p: any) => p.title)\n      });\n      \n      expect(wishlistData.total).toBe(3);\n      expect(wishlistData.properties).toHaveLength(3);\n      \n      // Verify each property\n      const receivedIds = wishlistData.properties.map((p: any) => p.id);\n      for (const expectedId of propertiesToAdd) {\n        expect(receivedIds).toContain(expectedId);\n      }\n      \n      // Remove one property\n      console.log('\\nRemoving property 2...');\n      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: '2', action: 'remove' })\n      }));\n      expect(removeResponse.status).toBe(200);\n      \n      // Verify property was removed\n      const finalResponse = await GET(new NextRequest('http://localhost:3000/api/user/wishlist'));\n      const finalData = await finalResponse.json();\n      \n      console.log('\\nFinal wishlist:', {\n        total: finalData.total,\n        remainingIds: finalData.properties.map((p: any) => p.id)\n      });\n      \n      expect(finalData.total).toBe(2);\n      const finalIds = finalData.properties.map((p: any) => p.id);\n      expect(finalIds).toContain('1');\n      expect(finalIds).toContain('3');\n      expect(finalIds).not.toContain('2');\n      \n      console.log('\\n🎉 MULTIPLE PROPERTIES TEST PASSED! 🎉\\n');\n    });\n\n    it('should handle error scenarios gracefully', async () => {\n      console.log('\\n=== FINAL TEST: Error Scenarios ===\\n');\n      \n      // Try to remove non-existent property\n      console.log('Testing removal of non-existent property...');\n      const removeResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: 'non-existent', action: 'remove' })\n      }));\n      \n      const removeData = await removeResponse.json();\n      console.log('✓ Remove non-existent result:', {\n        status: removeResponse.status,\n        error: removeData.error\n      });\n      \n      expect(removeResponse.status).toBe(404);\n      expect(removeData.success).toBe(false);\n      expect(removeData.error).toBe('Property not found in wishlist');\n      \n      // Try to add duplicate property\n      console.log('\\nTesting duplicate add...');\n      await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: '1', action: 'add' })\n      }));\n      \n      const duplicateResponse = await POST(new NextRequest('http://localhost:3000/api/user/wishlist', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ propertyId: '1', action: 'add' })\n      }));\n      \n      const duplicateData = await duplicateResponse.json();\n      console.log('✓ Duplicate add result:', {\n        status: duplicateResponse.status,\n        error: duplicateData.error\n      });\n      \n      expect(duplicateResponse.status).toBe(400);\n      expect(duplicateData.success).toBe(false);\n      expect(duplicateData.error).toBe('Property already in wishlist');\n      \n      console.log('\\n🎉 ERROR SCENARIOS TEST PASSED! 🎉\\n');\n    });\n  });\n});