import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  isInWishlist,
  updateWishlistItem,
  getWishlistStats,
  clearWishlist
} from '@/lib/database/wishlist';
import { getPropertyById } from '@/lib/firebase';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  getPropertyById: vi.fn()
}));

const mockGetPropertyById = vi.mocked(getPropertyById);

describe('Wishlist Database Functions', () => {
  const testUserId = 'test-user-1';
  const testPropertyId = 'prop-123';
  const mockProperty = {
    id: 'prop-123',
    title: 'Test Property',
    location: 'Test Location',
    category: 'Apartment',
    price: 1000000,
    image: 'test-image.jpg'
  };

  beforeEach(() => {
    // Clear all wishlists before each test
    vi.clearAllMocks();
    clearWishlist(testUserId);
    
    // Setup default mock
    mockGetPropertyById.mockResolvedValue(mockProperty);
  });

  describe('addToWishlist', () => {
    it('should add property to empty wishlist', async () => {
      const result = await addToWishlist(testUserId, testPropertyId, 'Test notes', 'high');

      expect(result).toMatchObject({
        userId: testUserId,
        propertyId: testPropertyId,
        notes: 'Test notes',
        priority: 'high'
      });
      expect(result.id).toBeDefined();
      expect(result.addedAt).toBeInstanceOf(Date);
    });

    it('should not add duplicate property', async () => {
      // Add property first time
      await addToWishlist(testUserId, testPropertyId);

      // Try to add same property again
      await expect(
        addToWishlist(testUserId, testPropertyId)
      ).rejects.toThrow('Property already in wishlist');
    });

    it('should add property with default priority', async () => {
      const result = await addToWishlist(testUserId, testPropertyId);
      expect(result.priority).toBe('medium');
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove existing property from wishlist', async () => {
      // Add property first
      await addToWishlist(testUserId, testPropertyId);

      // Remove it
      const result = await removeFromWishlist(testUserId, testPropertyId);
      expect(result).toBe(true);

      // Verify it's gone
      const inWishlist = await isInWishlist(testUserId, testPropertyId);
      expect(inWishlist).toBe(false);
    });

    it('should return false for non-existing property', async () => {
      const result = await removeFromWishlist(testUserId, 'non-existing');
      expect(result).toBe(false);
    });
  });

  describe('getUserWishlist', () => {
    it('should return empty array for user with no wishlist', async () => {
      const wishlist = await getUserWishlist(testUserId);
      expect(wishlist).toEqual([]);
    });

    it('should return wishlist properties with details', async () => {
      // Add property to wishlist
      await addToWishlist(testUserId, testPropertyId, 'Test notes', 'high');

      // Get wishlist
      const wishlist = await getUserWishlist(testUserId);

      expect(wishlist).toHaveLength(1);
      expect(wishlist[0]).toMatchObject({
        id: testPropertyId,
        title: mockProperty.title,
        location: mockProperty.location,
        price: mockProperty.price,
        type: mockProperty.category,
        images: [mockProperty.image],
        notes: 'Test notes',
        priority: 'high'
      });
    });

    it('should handle missing properties gracefully', async () => {
      // Add property to wishlist
      await addToWishlist(testUserId, testPropertyId);

      // Mock property not found
      mockGetPropertyById.mockResolvedValue(null);

      // Get wishlist
      const wishlist = await getUserWishlist(testUserId);

      expect(wishlist).toHaveLength(1);
      expect(wishlist[0]).toMatchObject({
        id: testPropertyId,
        title: `Property ${testPropertyId} (Not Found)`,
        location: 'Property not found',
        price: 0,
        type: 'Unknown'
      });
    });

    it('should sort by most recently added', async () => {
      const property1 = 'prop-1';
      const property2 = 'prop-2';

      // Add properties with some delay
      await addToWishlist(testUserId, property1);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await addToWishlist(testUserId, property2);

      // Mock both properties
      mockGetPropertyById.mockImplementation((id) => {
        return Promise.resolve({
          ...mockProperty,
          id,
          title: `Test Property ${id}`
        });
      });

      const wishlist = await getUserWishlist(testUserId);

      expect(wishlist).toHaveLength(2);
      expect(wishlist[0].id).toBe(property2); // More recent first
      expect(wishlist[1].id).toBe(property1);
    });
  });

  describe('isInWishlist', () => {
    it('should return false for empty wishlist', async () => {
      const result = await isInWishlist(testUserId, testPropertyId);
      expect(result).toBe(false);
    });

    it('should return true for property in wishlist', async () => {
      await addToWishlist(testUserId, testPropertyId);
      
      const result = await isInWishlist(testUserId, testPropertyId);
      expect(result).toBe(true);
    });

    it('should return false after property is removed', async () => {
      await addToWishlist(testUserId, testPropertyId);
      await removeFromWishlist(testUserId, testPropertyId);
      
      const result = await isInWishlist(testUserId, testPropertyId);
      expect(result).toBe(false);
    });
  });

  describe('updateWishlistItem', () => {
    it('should update notes and priority', async () => {
      await addToWishlist(testUserId, testPropertyId, 'Old notes', 'low');

      const result = await updateWishlistItem(testUserId, testPropertyId, {
        notes: 'Updated notes',
        priority: 'high'
      });

      expect(result).toMatchObject({
        propertyId: testPropertyId,
        notes: 'Updated notes',
        priority: 'high'
      });
    });

    it('should return null for non-existing item', async () => {
      const result = await updateWishlistItem(testUserId, 'non-existing', {
        notes: 'Test'
      });

      expect(result).toBe(null);
    });
  });

  describe('getWishlistStats', () => {
    it('should return correct stats for empty wishlist', async () => {
      const stats = await getWishlistStats(testUserId);

      expect(stats).toEqual({
        total: 0,
        byPriority: { low: 0, medium: 0, high: 0 },
        byType: {}
      });
    });

    it('should return correct stats with properties', async () => {
      await addToWishlist(testUserId, 'prop-1', 'Notes 1', 'high');
      await addToWishlist(testUserId, 'prop-2', 'Notes 2', 'low');
      await addToWishlist(testUserId, 'prop-3', 'Notes 3', 'high');

      // Mock different property types
      mockGetPropertyById.mockImplementation((id) => {
        const category = id === 'prop-1' ? 'Apartment' : 'House';
        return Promise.resolve({
          ...mockProperty,
          id,
          category
        });
      });

      const stats = await getWishlistStats(testUserId);

      expect(stats.total).toBe(3);
      expect(stats.byPriority).toEqual({
        low: 1,
        medium: 0,
        high: 2
      });
      expect(stats.byType).toEqual({
        Apartment: 1,
        House: 2
      });
    });
  });

  describe('clearWishlist', () => {
    it('should clear all wishlist items', async () => {
      // Add some items
      await addToWishlist(testUserId, 'prop-1');
      await addToWishlist(testUserId, 'prop-2');

      // Clear wishlist
      const result = await clearWishlist(testUserId);
      expect(result).toBe(true);

      // Verify empty
      const wishlist = await getUserWishlist(testUserId);
      expect(wishlist).toHaveLength(0);
    });
  });
});