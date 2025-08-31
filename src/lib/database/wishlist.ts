import { WishlistItem, WishlistProperty } from '@/types/auth';
import { getPropertyById, getAllProperties, database } from '@/lib/firebase';
import { ref, push, set, get, remove, query, orderByChild, equalTo, update, DataSnapshot } from 'firebase/database';
import { cacheService } from './cache';
import { dbPool } from './connection-pool';

// Firebase references
const wishlistsRef = ref(database, 'wishlists');

/**
 * Get Firebase reference for user's wishlist
 */
function getUserWishlistRef(userId: string) {
  return ref(database, `wishlists/${userId}`);
}

/**
 * Get Firebase reference for a specific wishlist item
 */
function getWishlistItemRef(userId: string, itemId: string) {
  return ref(database, `wishlists/${userId}/${itemId}`);
}

/**
 * Get Firebase reference for user's activity
 */
function getUserActivityRef(userId: string) {
  return ref(database, `activities/${userId}`);
}

/**
 * Add property to user's wishlist in Firebase with caching and connection pooling
 */
export async function addToWishlist(
  userId: string, 
  propertyId: string, 
  notes?: string, 
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<WishlistItem> {
  try {
    console.log(`[Firebase Wishlist] Adding property ${propertyId} to user ${userId}'s wishlist`);
    
    const userWishlistPath = `wishlists/${userId}`;
    
    // Check if property already exists using optimized connection pool
    const existingSnapshot = await dbPool.optimizedGet(userWishlistPath);
    if (existingSnapshot.exists()) {
      let propertyExists = false;
      existingSnapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data && data.propertyId === propertyId) {
          propertyExists = true;
        }
      });
      
      if (propertyExists) {
        console.log(`[Firebase Wishlist] Property ${propertyId} already in wishlist`);
        throw new Error('Property already in wishlist');
      }
    }
    
    // Create new wishlist item
    const itemId = await dbPool.optimizedPush(userWishlistPath, {
      userId,
      propertyId,
      addedAt: new Date().toISOString(),
      notes: notes || null,
      priority
    });
    
    const wishlistItem: WishlistItem = {
      id: itemId,
      userId,
      propertyId,
      addedAt: new Date(),
      notes,
      priority
    };
    
    // Invalidate cache
    cacheService.invalidateUserWishlist(userId);
    cacheService.invalidateUserStats(userId, 'wishlist');
    
    console.log(`[Firebase Wishlist] ✅ Successfully added property ${propertyId} with item ID ${itemId}`);
    return wishlistItem;
    
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error adding property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Remove property from user's wishlist in Firebase with caching and connection pooling
 */
export async function removeFromWishlist(userId: string, propertyId: string): Promise<boolean> {
  try {
    console.log(`[Firebase Wishlist] Removing property ${propertyId} from user ${userId}'s wishlist`);
    
    const userWishlistPath = `wishlists/${userId}`;
    
    // Find the item by scanning all items using optimized connection pool
    const snapshot = await dbPool.optimizedGet(userWishlistPath);
    
    if (!snapshot.exists()) {
      console.log(`[Firebase Wishlist] ❌ Property ${propertyId} not found in wishlist (no wishlist exists)`);
      return false;
    }
    
    // Find and remove matching items using batch operations
    const updates: Record<string, null> = {};
    let found = false;
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data && data.propertyId === propertyId) {
        updates[`wishlists/${userId}/${childSnapshot.key}`] = null;
        found = true;
      }
    });
    
    if (!found) {
      console.log(`[Firebase Wishlist] ❌ Property ${propertyId} not found in wishlist`);
      return false;
    }
    
    // Use batch operation for better performance (use root reference for batch updates)
    await dbPool.optimizedUpdate('', updates);
    
    // Invalidate cache
    cacheService.invalidateUserWishlist(userId);
    cacheService.invalidateUserStats(userId, 'wishlist');
    
    console.log(`[Firebase Wishlist] ✅ Successfully removed property ${propertyId}`);
    return true;
    
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error removing property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Get user's wishlist with property details from Firebase with caching
 */
export async function getUserWishlist(userId: string): Promise<WishlistProperty[]> {
  try {
    console.log(`[Firebase Wishlist] Getting wishlist for user ${userId}`);
    
    // Check cache first
    const cachedWishlist = cacheService.getUserWishlist(userId);
    if (cachedWishlist) {
      console.log(`[Firebase Wishlist] ✅ Returning cached wishlist for user ${userId}`);
      return cachedWishlist;
    }
    
    const userWishlistPath = `wishlists/${userId}`;
    const snapshot = await dbPool.optimizedGet(userWishlistPath);
    
    if (!snapshot.exists()) {
      console.log(`[Firebase Wishlist] No wishlist found for user ${userId}`);
      const emptyWishlist: WishlistProperty[] = [];
      cacheService.setUserWishlist(userId, emptyWishlist, 30 * 1000); // Cache for 30 seconds
      return emptyWishlist;
    }
    
    const wishlistItems: WishlistItem[] = [];
    
    // Convert Firebase data back to WishlistItem objects
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        wishlistItems.push({
          id: childSnapshot.key!,
          userId: data.userId,
          propertyId: data.propertyId,
          addedAt: new Date(data.addedAt),
          notes: data.notes || undefined,
          priority: data.priority || 'medium'
        });
      }
    });
    
    console.log(`[Firebase Wishlist] Found ${wishlistItems.length} items in wishlist`);
    
    // Get property details with caching
    const wishlistProperties: WishlistProperty[] = [];
    const propertyIds = wishlistItems.map(item => item.propertyId);
    
    // Batch property lookups for better performance
    const propertyPromises = propertyIds.map(async (propertyId) => {
      // Check property cache first
      let property = cacheService.getProperty(propertyId);
      if (!property) {
        property = await getPropertyById(propertyId);
        if (property) {
          cacheService.setProperty(propertyId, property);
        }
      }
      return { propertyId, property };
    });
    
    const propertyResults = await Promise.all(propertyPromises);
    const propertyMap = new Map();
    propertyResults.forEach(({ propertyId, property }) => {
      if (property) {
        propertyMap.set(propertyId, property);
      }
    });
    
    // Build wishlist properties with enriched data
    for (const item of wishlistItems) {
      const property = propertyMap.get(item.propertyId);
      
      if (property) {
        console.log(`[Firebase Wishlist] ✅ Found property: ${property.title || property.category || 'Property'} at ${property.location}`);
        
        // Create proper property title
        const propertyTitle = property.title || property.project ||
          `${property.category || 'Property'} in ${property.city || property.location || 'Unknown Location'}`;
        
        // Get property price (try different price fields)
        const propertyPrice = property.price || property.rent || property.askingPrice || 
          (property.investmentStartsFrom?.amount) || 0;
        
        // Create image array (handle different image field formats)
        let propertyImages: string[] = [];
        if (property.image) {
          propertyImages = [property.image];
        } else if (property.images && Array.isArray(property.images)) {
          propertyImages = property.images;
        }
        
        // Handle plot size for plot properties (can be string or object)
        let plotSizeValue: string | undefined;
        if (property.plotSize) {
          if (typeof property.plotSize === 'object' && property.plotSize.min && property.plotSize.max) {
            // Handle plot size range object
            plotSizeValue = `${property.plotSize.min}–${property.plotSize.max} ${property.plotSize.unit || 'sq.yds'}`;
          } else if (typeof property.plotSize === 'string') {
            plotSizeValue = property.plotSize;
          }
        } else {
          // Fallback to other area fields
          plotSizeValue = property.areaOnSale || property.superArea || undefined;
        }
        
        wishlistProperties.push({
          id: property.id || item.propertyId,
          title: propertyTitle,
          price: propertyPrice,
          location: property.location || 'Unknown Location',
          images: propertyImages,
          type: property.category || property.propertyType || 'Property',
          addedAt: item.addedAt,
          notes: item.notes,
          priority: item.priority,
          // Add missing fields that are defined in WishlistProperty interface
          developer: property.developerName || property.developer || undefined,
          plotSize: plotSizeValue,
          category: property.category || undefined,
          segment: property.segment || undefined,
          description: property.description || 'Premium plot in prime location'
        });
      } else {
        console.warn(`[Firebase Wishlist] ⚠️ Property not found: ${item.propertyId}`);
        // Keep the wishlist item but mark as not found
        wishlistProperties.push({
          id: item.propertyId,
          title: `Property ${item.propertyId} (Not Found)`,
          price: 0,
          location: 'Property not found',
          images: [],
          type: 'Unknown',
          addedAt: item.addedAt,
          notes: item.notes,
          priority: item.priority,
          developer: undefined,
          plotSize: undefined,
          category: undefined,
          segment: undefined,
          description: 'Property data not available'
        });
      }
    }
    
    // Sort by most recently added
    wishlistProperties.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    
    // Cache the result
    cacheService.setUserWishlist(userId, wishlistProperties);
    
    console.log(`[Firebase Wishlist] ✅ Returning ${wishlistProperties.length} wishlist properties`);
    return wishlistProperties;
    
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error getting user wishlist:`, error);
    throw error;
  }
}

/**
 * Check if property is in user's wishlist
 */
export async function isInWishlist(userId: string, propertyId: string): Promise<boolean> {
  try {
    const userWishlistRef = getUserWishlistRef(userId);
    const snapshot = await get(userWishlistRef);
    
    if (!snapshot.exists()) {
      console.log(`[Firebase Wishlist] Property ${propertyId} NOT in user ${userId}'s wishlist (no wishlist)`);
      return false;
    }
    
    let exists = false;
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data && data.propertyId === propertyId) {
        exists = true;
      }
    });
    
    console.log(`[Firebase Wishlist] Property ${propertyId} ${exists ? 'IS' : 'NOT'} in user ${userId}'s wishlist`);
    return exists;
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error checking wishlist:`, error);
    return false;
  }
}

/**
 * Update wishlist item notes and priority
 */
export async function updateWishlistItem(
  userId: string, 
  propertyId: string, 
  updates: { notes?: string; priority?: 'low' | 'medium' | 'high' }
): Promise<WishlistItem | null> {
  try {
    console.log(`[Firebase Wishlist] Updating wishlist item ${propertyId} for user ${userId}`);
    
    const userWishlistRef = getUserWishlistRef(userId);
    const snapshot = await get(userWishlistRef);
    
    if (!snapshot.exists()) {
      console.log(`[Firebase Wishlist] ❌ Wishlist item not found: ${propertyId} (no wishlist)`);
      return null;
    }
    
    let updatedItem: WishlistItem | null = null;
    let found = false;
    
    snapshot.forEach((childSnapshot) => {
      const currentData = childSnapshot.val();
      if (currentData && currentData.propertyId === propertyId) {
        found = true;
        const itemRef = getWishlistItemRef(userId, childSnapshot.key!);
        
        const updatedData = {
          ...currentData,
          notes: updates.notes !== undefined ? updates.notes : currentData.notes,
          priority: updates.priority || currentData.priority
        };
        
        set(itemRef, updatedData);
        
        updatedItem = {
          id: childSnapshot.key!,
          userId: currentData.userId,
          propertyId: currentData.propertyId,
          addedAt: new Date(currentData.addedAt),
          notes: updatedData.notes || undefined,
          priority: updatedData.priority
        };
      }
    });
    
    if (!found) {
      console.log(`[Firebase Wishlist] ❌ Wishlist item not found: ${propertyId}`);
      return null;
    }
    
    console.log(`[Firebase Wishlist] ✅ Successfully updated wishlist item ${propertyId}`);
    return updatedItem;
    
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error updating wishlist item:`, error);
    throw error;
  }
}

/**
 * Get wishlist statistics for a user
 */
export async function getWishlistStats(userId: string): Promise<{ 
  total: number; 
  byPriority: Record<string, number>; 
  byType: Record<string, number> 
}> {
  try {
    console.log(`[Firebase Wishlist] Getting stats for user ${userId}`);
    
    const userWishlistRef = getUserWishlistRef(userId);
    const snapshot = await get(userWishlistRef);
    
    const stats = {
      total: 0,
      byPriority: { low: 0, medium: 0, high: 0 },
      byType: {} as Record<string, number>
    };
    
    if (!snapshot.exists()) {
      console.log(`[Firebase Wishlist] No wishlist found for stats`);
      return stats;
    }
    
    const wishlistItems: WishlistItem[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        wishlistItems.push({
          id: childSnapshot.key!,
          userId: data.userId,
          propertyId: data.propertyId,
          addedAt: new Date(data.addedAt),
          notes: data.notes || undefined,
          priority: data.priority || 'medium'
        });
      }
    });
    
    stats.total = wishlistItems.length;
    
    // Count by priority
    for (const item of wishlistItems) {
      stats.byPriority[item.priority]++;
      
      // Get property type for counting
      try {
        const property = await getPropertyById(item.propertyId);
        if (property && property.category) {
          stats.byType[property.category] = (stats.byType[property.category] || 0) + 1;
        }
      } catch (error) {
        console.warn(`[Firebase Wishlist] Could not get property type for stats: ${item.propertyId}`);
      }
    }
    
    console.log(`[Firebase Wishlist] ✅ Stats:`, stats);
    return stats;
    
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error getting wishlist stats:`, error);
    throw error;
  }
}

/**
 * Clear user's entire wishlist
 */
export async function clearWishlist(userId: string): Promise<boolean> {
  try {
    console.log(`[Firebase Wishlist] Clearing wishlist for user ${userId}`);
    
    const userWishlistRef = getUserWishlistRef(userId);
    await remove(userWishlistRef);
    
    console.log(`[Firebase Wishlist] ✅ Successfully cleared wishlist for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error clearing wishlist:`, error);
    return false;
  }
}

/**
 * Get raw wishlist items (without property details) - useful for real-time listeners
 */
export async function getRawWishlistItems(userId: string): Promise<WishlistItem[]> {
  try {
    const userWishlistRef = getUserWishlistRef(userId);
    const snapshot = await get(userWishlistRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const items: WishlistItem[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        items.push({
          id: childSnapshot.key!,
          userId: data.userId,
          propertyId: data.propertyId,
          addedAt: new Date(data.addedAt),
          notes: data.notes || undefined,
          priority: data.priority || 'medium'
        });
      }
    });
    
    return items;
  } catch (error) {
    console.error(`[Firebase Wishlist] ❌ Error getting raw wishlist items:`, error);
    throw error;
  }
}

/**
 * Export Firebase references for use in real-time listeners
 */
export { getUserWishlistRef, getUserActivityRef, wishlistsRef };