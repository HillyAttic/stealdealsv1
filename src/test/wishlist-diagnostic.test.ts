import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/wishlist/route';
import { clearWishlist } from '@/lib/database/wishlist';
import { getPropertyById } from '@/lib/firebase';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  getPropertyById: vi.fn()
}));

// Mock auth middleware
vi.mock('@/lib/auth/middleware', () => ({
  optionalAuth: vi.fn((request, handler) => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const requestWithUser = { ...request, user: mockUser };
    return handler(requestWithUser);
  })
}));

const mockGetPropertyById = vi.mocked(getPropertyById);

describe('Wishlist Diagnostic Test - Reproducing User Issue', () => {
  const testUserId = 'user-1';
  const problemPropertyId = '2'; // The property ID from the error log

  // Mock the actual property that should exist
  const realProperty = {
    id: '2',
    title: 'Real Property 2',
    location: 'Delhi NCR',
    category: 'Office',
    propertyType: 'Vacant',
    price: 1500000,
    image: '/property-2.jpg',
    state: 'Delhi',
    city: 'Delhi'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await clearWishlist(testUserId);
    mockGetPropertyById.mockResolvedValue(realProperty);
  });

  it('should reproduce the exact user issue: property shows in dashboard but not in wishlist page', async () => {
    console.log('=== DIAGNOSTIC TEST: Reproducing User Issue ===');
    
    // Step 1: User adds property to wishlist (from property page)
    console.log('Step 1: User adds property 2 to wishlist');
    const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: problemPropertyId,
        action: 'add',
        notes: 'Added from property page',
        priority: 'medium'
      })
    });

    const addResponse = await POST(addRequest);
    const addData = await addResponse.json();
    
    console.log('Add Response:', {
      status: addResponse.status,
      success: addData.success,
      propertyId: addData.item?.propertyId
    });
    
    expect(addResponse.status).toBe(200);
    expect(addData.success).toBe(true);

    // Step 2: Dashboard shows 1 wishlist item (GET for dashboard)
    console.log('Step 2: Dashboard checks wishlist count');
    const dashboardRequest = new NextRequest('http://localhost:3000/api/user/wishlist?stats=true');
    const dashboardResponse = await GET(dashboardRequest);
    const dashboardData = await dashboardResponse.json();
    
    console.log('Dashboard Response:', {
      status: dashboardResponse.status,
      total: dashboardData.stats?.total
    });
    
    expect(dashboardResponse.status).toBe(200);
    expect(dashboardData.stats.total).toBe(1);

    // Step 3: Wishlist page loads (GET for wishlist page)
    console.log('Step 3: Wishlist page loads full wishlist');
    const wishlistPageRequest = new NextRequest('http://localhost:3000/api/user/wishlist');
    const wishlistPageResponse = await GET(wishlistPageRequest);
    const wishlistPageData = await wishlistPageResponse.json();
    
    console.log('Wishlist Page Response:', {
      status: wishlistPageResponse.status,
      success: wishlistPageData.success,
      total: wishlistPageData.total,
      propertiesCount: wishlistPageData.properties?.length,
      propertyIds: wishlistPageData.properties?.map((p: any) => p.id)
    });

    expect(wishlistPageResponse.status).toBe(200);
    expect(wishlistPageData.success).toBe(true);
    expect(wishlistPageData.total).toBe(1);
    expect(wishlistPageData.properties).toHaveLength(1);
    expect(wishlistPageData.properties[0].id).toBe(problemPropertyId);

    // Step 4: Try to remove the property (simulating user clicking remove)
    console.log('Step 4: User tries to remove property from wishlist');
    const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: problemPropertyId,
        action: 'remove'
      })
    });

    const removeResponse = await POST(removeRequest);
    const removeData = await removeResponse.json();
    
    console.log('Remove Response:', {
      status: removeResponse.status,
      success: removeData.success,
      error: removeData.error
    });

    // This should succeed, not return 404
    expect(removeResponse.status).toBe(200);
    expect(removeData.success).toBe(true);

    // Step 5: Verify property is actually removed
    console.log('Step 5: Verify property is removed');
    const finalCheckRequest = new NextRequest('http://localhost:3000/api/user/wishlist');
    const finalCheckResponse = await GET(finalCheckRequest);
    const finalCheckData = await finalCheckResponse.json();
    
    console.log('Final Check Response:', {
      total: finalCheckData.total,
      propertiesCount: finalCheckData.properties?.length
    });

    expect(finalCheckData.total).toBe(0);
    expect(finalCheckData.properties).toHaveLength(0);

    console.log('=== DIAGNOSTIC TEST COMPLETE ===');
  });

  it('should test what happens when property doesnt exist in Firebase', async () => {
    console.log('=== DIAGNOSTIC TEST: Non-existent Property ===');
    
    // Mock property not found in Firebase
    mockGetPropertyById.mockResolvedValue(null);
    
    // User tries to add non-existent property
    const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: problemPropertyId,
        action: 'add'
      })
    });

    const addResponse = await POST(addRequest);
    const addData = await addResponse.json();
    
    console.log('Add Non-existent Property Response:', {
      status: addResponse.status,
      success: addData.success
    });
    
    // Should still succeed (wishlist item is created)
    expect(addResponse.status).toBe(200);
    expect(addData.success).toBe(true);

    // Check wishlist - should show placeholder property
    const getRequest = new NextRequest('http://localhost:3000/api/user/wishlist');
    const getResponse = await GET(getRequest);
    const getData = await getResponse.json();
    
    console.log('Wishlist with Non-existent Property:', {
      total: getData.total,
      propertyTitle: getData.properties[0]?.title,
      propertyLocation: getData.properties[0]?.location
    });

    expect(getData.total).toBe(1);
    expect(getData.properties[0].title).toContain('Not Found');
    expect(getData.properties[0].location).toBe('Property not found');

    console.log('=== NON-EXISTENT PROPERTY TEST COMPLETE ===');
  });

  it('should test concurrent add/remove operations', async () => {
    console.log('=== DIAGNOSTIC TEST: Concurrent Operations ===');
    
    // Add property
    const addRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: problemPropertyId, action: 'add' })
    });
    await POST(addRequest);

    // Try to add same property again (should fail)
    const duplicateAddRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: problemPropertyId, action: 'add' })
    });
    
    const duplicateResponse = await POST(duplicateAddRequest);
    const duplicateData = await duplicateResponse.json();
    
    console.log('Duplicate Add Response:', {
      status: duplicateResponse.status,
      success: duplicateData.success,
      error: duplicateData.error
    });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateData.success).toBe(false);
    expect(duplicateData.error).toBe('Property already in wishlist');

    // Remove the property
    const removeRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: problemPropertyId, action: 'remove' })
    });
    await POST(removeRequest);

    // Try to remove again (should fail with 404)
    const duplicateRemoveRequest = new NextRequest('http://localhost:3000/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: problemPropertyId, action: 'remove' })
    });
    
    const duplicateRemoveResponse = await POST(duplicateRemoveRequest);
    const duplicateRemoveData = await duplicateRemoveResponse.json();
    
    console.log('Duplicate Remove Response:', {
      status: duplicateRemoveResponse.status,
      success: duplicateRemoveData.success,
      error: duplicateRemoveData.error
    });

    expect(duplicateRemoveResponse.status).toBe(404);
    expect(duplicateRemoveData.success).toBe(false);
    expect(duplicateRemoveData.error).toBe('Property not found in wishlist');

    console.log('=== CONCURRENT OPERATIONS TEST COMPLETE ===');
  });
});