import { WishlistItem, WishlistProperty } from '@/types/auth';
import { getPropertyById } from '@/lib/firebase';

// In-memory wishlist storage for testing (replace with real database in production)
const wishlists: Map<string, WishlistItem[]> = new Map();
let nextWishlistId = 1;

// Initialize with test data
function initializeTestWishlistData() {
  const testWishlistItems: WishlistItem[] = [
    // John Doe's wishlist (user ID: 2)
    {
      id: '1',
      userId: '2',
      propertyId: 'prop-1',
      addedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      notes: 'Great location, need to check parking availability',
      priority: 'high'
    },
    {
      id: '2',
      userId: '2',
      propertyId: 'prop-5',
      addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      notes: 'Backup option if first choice doesn\'t work out',
      priority: 'medium'
    },
    
    // Jane Smith's wishlist (user ID: 3)
    {
      id: '3',
      userId: '3',
      propertyId: 'prop-4',
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'Perfect for retail business, good foot traffic',
      priority: 'high'
    },
    {
      id: '4',
      userId: '3',
      propertyId: 'prop-3',
      addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      priority: 'low'
    }
  ];
  
  // Group wishlist items by user
  testWishlistItems.forEach(item => {
    const userWishlist = wishlists.get(item.userId) || [];
    userWishlist.push(item);
    wishlists.set(item.userId, userWishlist);
  });
  
  nextWishlistId = 5;
}

// Initialize test data
initializeTestWishlistData();

/**
 * Add property to user's wishlist
 */
export async function addToWishlist(userId: string, propertyId: string, notes?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<WishlistItem> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    
    // Check if property is already in wishlist
    const existingItem = userWishlist.find(item => item.propertyId === propertyId);
    if (existingItem) {
      throw new Error('Property already in wishlist');
    }
    
    const wishlistItem: WishlistItem = {
      id: nextWishlistId.toString(),
      userId,
      propertyId,
      addedAt: new Date(),
      notes,
      priority
    };
    
    nextWishlistId++;
    userWishlist.push(wishlistItem);
    wishlists.set(userId, userWishlist);
    
    return wishlistItem;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove property from user's wishlist
 */
export async function removeFromWishlist(userId: string, propertyId: string): Promise<boolean> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    const initialLength = userWishlist.length;
    
    const updatedWishlist = userWishlist.filter(item => item.propertyId !== propertyId);
    wishlists.set(userId, updatedWishlist);
    
    return updatedWishlist.length < initialLength;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

/**
 * Get user's wishlist with property details
 */
export async function getUserWishlist(userId: string): Promise<WishlistProperty[]> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    const wishlistProperties: WishlistProperty[] = [];
    
    for (const item of userWishlist) {
      const property = await getPropertyById(item.propertyId);
      if (property) {
        wishlistProperties.push({
          id: property.id || item.propertyId,
          title: property.title || 'Untitled Property',
          price: property.price || property.askingPrice || 0,
          location: property.location,
          images: property.image ? [property.image] : [],
          type: property.category,
          addedAt: item.addedAt,
          notes: item.notes,
          priority: item.priority
        });
      }
    }
    
    // Sort by most recently added
    return wishlistProperties.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    throw error;
  }
}

/**
 * Check if property is in user's wishlist
 */
export async function isInWishlist(userId: string, propertyId: string): Promise<boolean> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    return userWishlist.some(item => item.propertyId === propertyId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Update wishlist item notes and priority
 */
export async function updateWishlistItem(userId: string, propertyId: string, updates: { notes?: string; priority?: 'low' | 'medium' | 'high' }): Promise<WishlistItem | null> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    const itemIndex = userWishlist.findIndex(item => item.propertyId === propertyId);
    
    if (itemIndex === -1) {
      return null;
    }
    
    const updatedItem = {
      ...userWishlist[itemIndex],
      ...updates
    };
    
    userWishlist[itemIndex] = updatedItem;
    wishlists.set(userId, userWishlist);
    
    return updatedItem;
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    throw error;
  }
}

/**
 * Get wishlist statistics for a user
 */
export async function getWishlistStats(userId: string): Promise<{ total: number; byPriority: Record<string, number>; byType: Record<string, number> }> {
  try {
    const userWishlist = wishlists.get(userId) || [];
    const stats = {
      total: userWishlist.length,
      byPriority: { low: 0, medium: 0, high: 0 },
      byType: {} as Record<string, number>
    };
    
    for (const item of userWishlist) {
      // Count by priority
      stats.byPriority[item.priority]++;
      
      // Count by property type
      const property = await getPropertyById(item.propertyId);
      if (property && property.category) {
        stats.byType[property.category] = (stats.byType[property.category] || 0) + 1;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting wishlist stats:', error);
    throw error;
  }
}

/**
 * Clear user's entire wishlist
 */
export async function clearWishlist(userId: string): Promise<boolean> {
  try {
    wishlists.set(userId, []);
    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return false;
  }
}