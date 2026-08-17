// Firestore wishlist module — Firestore-only implementation
// Migration complete: all operations go to Firestore exclusively.
//
// Firestore structure: wishlists/{userId}/items/{itemId}
//
// NOTE: Server-side uses Admin SDK (bypasses security rules) via dynamic
// eval('import') so the Admin SDK is NEVER bundled into client-side code.
// The eval prevents webpack from statically analyzing the import chain.

import { WishlistItem, WishlistProperty } from '@/types/auth';
import { getPropertyById, getAllProperties, getPropertiesByIds } from '@/lib/database/firestore-properties';
import { cacheService } from './cache';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  query as fsQuery,
  where,
  onSnapshot,
  Unsubscribe,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firestore';
import { dbPool } from './connection-pool';

// ─── Admin SDK helpers (dynamic import) ──────────────────────────────────────
// Dynamically import the Admin SDK module to prevent bundling firebase-admin into client code.
let _adminModuleCache: typeof import('./firestore-wishlist-admin') | null = null;
async function getAdminModule() {
  if (!_adminModuleCache) {
    _adminModuleCache = await import('./firestore-wishlist-admin');
  }
  return _adminModuleCache;
}

// Detect whether we are running on the server (Node.js) or in the browser.
// Server-side code MUST always use Admin SDK (bypasses Firestore rules).
function isServerSide(): boolean {
  return typeof window === 'undefined';
}

// ─── Client SDK helpers ─────────────────────────────────────────────────────

function getUserWishlistCol(userId: string) {
  return collection(firestoreDb, 'wishlists', userId, 'items');
}

function getWishlistItemDoc(userId: string, itemId: string) {
  return doc(firestoreDb, 'wishlists', userId, 'items', itemId);
}

// ─── Add to wishlist ────────────────────────────────────────────────────────

export async function addToWishlist(
  userId: string,
  propertyId: string,
  notes?: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<WishlistItem> {
  const serverSide = isServerSide();
  console.log(`[Firestore Wishlist] Adding property ${propertyId} for user ${userId} (serverSide=${serverSide})`);

  // Validate that the property actually exists before adding to wishlist
  try {
    const existingProperty = await getPropertyById(propertyId);
    if (!existingProperty) {
      throw new Error(`Property ${propertyId} does not exist and cannot be added to wishlist`);
    }
  } catch (err) {
    if ((err as Error).message.includes('does not exist')) {
      throw err;
    }
    console.warn(`[Firestore Wishlist] Property existence check failed for ${propertyId}:`, err);
  }

  const newItemData = {
    userId,
    propertyId,
    addedAt: new Date().toISOString(),
    notes: notes || null,
    priority,
  };

  let itemId: string;

  // Always use Admin SDK (server-side OR client-side) for consistency
  const admin = await getAdminModule();
  const { itemId: id } = await admin.adminAddToWishlist(userId, propertyId, newItemData.notes, priority);
  itemId = id;

  const wishlistItem: WishlistItem = {
    id: itemId,
    userId,
    propertyId,
    addedAt: new Date(),
    notes,
    priority,
  };

  try {
    cacheService.invalidateUserWishlist(userId);
    cacheService.invalidateUserStats(userId);
  } catch (e) {
    console.warn('[Firestore Wishlist] Failed to clear cache after add:', e);
  }

  console.log(`[Firestore Wishlist] ✅ Added property ${propertyId} with item ID ${itemId}`);
  return wishlistItem;
}

// ─── Remove from wishlist ───────────────────────────────────────────────────

export async function removeFromWishlist(userId: string, propertyId: string): Promise<boolean> {
  const serverSide = isServerSide();
  console.log(`[Firestore Wishlist] Removing property ${propertyId} for user ${userId} (serverSide=${serverSide})`);

  const admin = await getAdminModule();
  await admin.adminRemoveFromWishlist(userId, propertyId);

  try { cacheService.invalidateUserWishlist(userId); } catch (e) { /* ignore */ }
  console.log(`[Firestore Wishlist] ✅ Removed property ${propertyId}`);
  return true;
}

// ─── Get user wishlist (with property details) ──────────────────────────────

async function fetchWishlistItems(userId: string): Promise<WishlistItem[]> {
  // Always use Admin SDK for server-side consistency
  const admin = await getAdminModule();
  return await admin.adminFetchWishlistItems(userId);
}

// Shared property enrichment logic
function enrichWishlistProperties(
  wishlistItems: WishlistItem[],
  propertyMap: Map<string, any>
): WishlistProperty[] {
  const wishlistProperties: WishlistProperty[] = [];

  const convertToFullAmount = (value: number): number => {
    if (value > 0 && value < 1000) return value * 100000;
    return value;
  };

  for (const item of wishlistItems) {
    const property = propertyMap.get(item.propertyId);
    if (property) {
      const propertyTitle = property.title || property.project ||
        `${property.category || 'Property'} in ${property.city || property.location || 'Unknown Location'}`;

      let propertyPrice = 0;
      let priceDisplay = '';

      if (property.minInvestment && property.maxInvestment && property.minInvestment !== property.maxInvestment) {
        const minAmount = convertToFullAmount(property.minInvestment);
        const maxAmount = convertToFullAmount(property.maxInvestment);
        priceDisplay = `₹${minAmount.toLocaleString('en-IN')} - ₹${maxAmount.toLocaleString('en-IN')}`;
        propertyPrice = minAmount;
      } else {
        const singlePrice = property.price || property.rent || property.askingPrice ||
          property.minInvestment || property.maxInvestment || property.investment ||
          (property.investmentStartsFrom?.amount) || 0;
        propertyPrice = convertToFullAmount(singlePrice);
      }

      let propertyImages: string[] = [];
      if (property.image) propertyImages = [property.image];
      else if (property.images && Array.isArray(property.images)) propertyImages = property.images;

      let plotSizeValue: string | undefined;
      if (property.plotSize) {
        if (typeof property.plotSize === 'object' && property.plotSize.min && property.plotSize.max) {
          plotSizeValue = `${property.plotSize.min}–${property.plotSize.max} ${property.plotSize.unit || 'sq.yds'}`;
        } else if (typeof property.plotSize === 'string') {
          plotSizeValue = property.plotSize;
        }
      } else {
        plotSizeValue = property.areaOnSale || property.superArea || undefined;
      }

      wishlistProperties.push({
        id: property.id || item.propertyId,
        title: propertyTitle,
        price: propertyPrice,
        priceDisplay: priceDisplay || undefined,
        location: property.location || 'Unknown Location',
        images: propertyImages,
        type: property.category || property.propertyType || 'Property',
        addedAt: item.addedAt,
        notes: item.notes,
        priority: item.priority,
        developer: property.developerName || property.developer || undefined,
        plotSize: plotSizeValue,
        category: property.category || undefined,
        segment: property.segment || undefined,
        description: property.description || 'Premium plot in prime location',
      });
    } else {
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
        description: 'Property data not available',
      });
    }
  }

  return wishlistProperties;
}

export async function getUserWishlist(userId: string): Promise<WishlistProperty[]> {
  try {
    console.log(`[Firestore Wishlist] Getting wishlist for user ${userId}`);

    const cached = cacheService.getUserWishlist(userId);
    if (cached) {
      console.log(`[Firestore Wishlist] ✅ Cached wishlist (${cached.length} items)`);
      return cached;
    }

    const wishlistItems = await fetchWishlistItems(userId);
    console.log(`[Firestore Wishlist] Found ${wishlistItems.length} items`);

    const wishlistProperties: WishlistProperty[] = [];
    const propertyIds = wishlistItems.map(i => i.propertyId);
    const stalePropertyIds: string[] = [];

    if (propertyIds.length > 0) {
      const uncachedIds: string[] = [];
      const propertyMap = new Map<string, any>();

      for (const pid of propertyIds) {
        const cp = cacheService.getProperty(pid);
        if (cp) {
          propertyMap.set(pid, cp);
        } else {
          uncachedIds.push(pid);
        }
      }

      if (uncachedIds.length > 0) {
        try {
          const fetched = await getPropertiesByIds(uncachedIds);
          for (const p of fetched) {
            if (p && p.id) {
              cacheService.setProperty(p.id, p);
              propertyMap.set(p.id, p);
            }
          }
        } catch (err) {
          console.error('[Firestore Wishlist] Batch fetch failed, falling back to individual:', err);
          await Promise.all(uncachedIds.map(async pid => {
            try {
              const p = await getPropertyById(pid);
              if (p) { cacheService.setProperty(pid, p); propertyMap.set(pid, p); }
            } catch (e) { /* skip */ }
          }));
        }
      }

      // Auto-cleanup: identify wishlist entries whose properties no longer exist
      for (const item of wishlistItems) {
        if (!propertyMap.has(item.propertyId)) {
          stalePropertyIds.push(item.propertyId);
          console.warn(`[Firestore Wishlist] Stale entry detected: property ${item.propertyId} no longer exists for user ${userId}`);
        }
      }

      // Remove stale entries from Firestore (non-blocking, best-effort)
      if (stalePropertyIds.length > 0) {
        void (async () => {
          try {
            for (const pid of stalePropertyIds) {
              await removeFromWishlist(userId, pid);
            }
            console.log(`[Firestore Wishlist] 🧹 Auto-cleaned ${stalePropertyIds.length} stale entries for user ${userId}`);
          } catch (err) {
            console.warn('[Firestore Wishlist] Failed to auto-clean stale entries:', err);
          }
        })();
      }

      // Only enrich items whose properties actually exist
      const validItems = wishlistItems.filter(item => propertyMap.has(item.propertyId));
      wishlistProperties.push(...enrichWishlistProperties(validItems, propertyMap));
    }

    wishlistProperties.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    cacheService.setUserWishlist(userId, wishlistProperties, 15 * 60 * 1000);
    console.log(`[Firestore Wishlist] ✅ Returning ${wishlistProperties.length} properties (filtered ${stalePropertyIds.length} stale)`);
    return wishlistProperties;
  } catch (err) {
    console.error('[Firestore Wishlist] ❌ Error getting wishlist:', err);
    throw err;
  }
}

export async function getUserWishlistUncached(userId: string): Promise<WishlistProperty[]> {
  try {
    console.log(`[Firestore Wishlist] Getting UN-CACHED wishlist for user ${userId}`);

    const wishlistItems = await fetchWishlistItems(userId);
    const propertyIds = wishlistItems.map(i => i.propertyId);
    const propertyMap = new Map<string, any>();

    if (propertyIds.length > 0) {
      const properties = await getPropertiesByIds(propertyIds);
      for (const p of properties) {
        if (p && p.id) propertyMap.set(p.id, p);
      }
    }

    // Only enrich items whose properties actually exist
    const validItems = wishlistItems.filter(item => propertyMap.has(item.propertyId));
    return enrichWishlistProperties(validItems, propertyMap);
  } catch (err) {
    console.error('[Firestore Wishlist] ❌ Error getting uncached wishlist:', err);
    throw err;
  }
}

// ─── Other wishlist operations ──────────────────────────────────────────────

export async function isInWishlist(userId: string, propertyId: string): Promise<boolean> {
  const admin = await getAdminModule();
  return await admin.adminIsInWishlist(userId, propertyId);
}

export async function updateWishlistItem(
  userId: string,
  propertyId: string,
  updates: { notes?: string; priority?: 'low' | 'medium' | 'high' }
): Promise<WishlistItem | null> {
  const admin = await getAdminModule();
  return await admin.adminUpdateWishlistItem(userId, propertyId, updates);
}

export async function getWishlistStats(userId: string): Promise<{
  total: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}> {
  const items = await fetchWishlistItems(userId);
  const stats = {
    total: items.length,
    byPriority: { low: 0, medium: 0, high: 0 } as Record<string, number>,
    byType: {} as Record<string, number>,
  };
  for (const item of items) {
    stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
  }
  return stats;
}

export async function clearWishlist(userId: string): Promise<boolean> {
  const admin = await getAdminModule();
  await admin.adminClearWishlist(userId);

  try { cacheService.invalidateUserCaches(userId); } catch (e) { /* ignore */ }
  return true;
}

export async function getRawWishlistItems(userId: string): Promise<WishlistItem[]> {
  return fetchWishlistItems(userId);
}

// ─── Real-time listener support ─────────────────────────────────────────────
// Returns an unsubscribe function. Used by WishlistContext / EnhancedWishlistContext.
// NOTE: This runs CLIENT-SIDE so uses client SDK (firestoreDb) with rules.

export function subscribeToWishlist(
  userId: string,
  callback: (items: WishlistItem[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  const itemsCol = getUserWishlistCol(userId);
  return onSnapshot(
    itemsCol,
    (snapshot) => {
      const items: WishlistItem[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId,
          propertyId: data.propertyId,
          addedAt: new Date(data.addedAt),
          notes: data.notes || undefined,
          priority: data.priority || 'medium',
        });
      });
      callback(items);
    },
    (error) => {
      if (errorCallback) errorCallback(error as Error);
    }
  );
}

/**
 * Export Firestore collection reference for use in real-time listeners
 */
export function getUserWishlistFirestoreRef(userId: string): CollectionReference {
  return getUserWishlistCol(userId);
}

// Keep for backward compatibility during migration
export function getUserWishlistRef(userId: string) {
  console.warn('[Firestore Wishlist] getUserWishlistRef is deprecated — use getUserWishlistFirestoreRef');
  return getUserWishlistCol(userId);
}

export function getUserActivityRef(userId: string) {
  console.warn('[Firestore Wishlist] getUserActivityRef is deprecated — activities are now in Firestore');
  return null;
}
