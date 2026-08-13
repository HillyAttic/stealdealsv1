// Firestore wishlist module — drop-in replacement for src/lib/database/wishlist.ts
// Now fully migrated to Firestore (Phase 8 complete)
//
// Firestore structure: wishlists/{userId}/items/{itemId}

import { WishlistItem, WishlistProperty } from '@/types/auth';
import { getPropertyById, getAllProperties, getPropertiesByIds } from '@/lib/database/firestore-properties';
import { cacheService } from './cache';

// Firestore imports
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

type MigrationPhase = 'rtdb' | 'shadow' | 'dual-read' | 'firestore';

function getPhase(): MigrationPhase {
  return (process.env.MIGRATION_PHASE as MigrationPhase) || 'rtdb';
}

// ─── Firestore collection helper ────────────────────────────────────────────

function getUserWishlistCol(userId: string) {
  return collection(firestoreDb, 'wishlists', userId, 'items');
}

function getWishlistItemDoc(userId: string, itemId: string) {
  return doc(firestoreDb, 'wishlists', userId, 'items', itemId);
}

// ─── RTDB helpers ───────────────────────────────────────────────────────────

function getUserWishlistRtdbRef(userId: string) {
  return rtdbRef(database, `wishlists/${userId}`);
}

// ─── Add to wishlist ────────────────────────────────────────────────────────

export async function addToWishlist(
  userId: string,
  propertyId: string,
  notes?: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<WishlistItem> {
  const phase = getPhase();
  console.log(`[Firestore Wishlist] Adding property ${propertyId} for user ${userId} (phase=${phase})`);

  const newItemData = {
    userId,
    propertyId,
    addedAt: new Date().toISOString(),
    notes: notes || null,
    priority,
  };

  let itemId: string;

  if (phase === 'firestore') {
    // Check for duplicate in Firestore
    const itemsCol = getUserWishlistCol(userId);
    const existing = await getDocs(fsQuery(itemsCol, where('propertyId', '==', propertyId)));
    if (!existing.empty) {
      throw new Error('Property already in wishlist');
    }
    const docRef = await addDoc(itemsCol, newItemData);
    itemId = docRef.id;
  } else if (phase === 'dual-read' || phase === 'shadow') {
    // Write to both
    const existingSnap = await rtdbGet(getUserWishlistRtdbRef(userId));
    if (existingSnap.exists()) {
      let dup = false;
      existingSnap.forEach(child => {
        const d = child.val();
        if (d && d.propertyId === propertyId) dup = true;
      });
      if (dup) throw new Error('Property already in wishlist');
    }
    const newRef = rtdbPush(rtdbRef(database, `wishlists/${userId}`), newItemData);
    itemId = newRef.key!;
    try {
      await setDoc(getWishlistItemDoc(userId, itemId), newItemData);
    } catch (err) {
      console.warn(`[Firestore Wishlist] Shadow write failed for add:`, err);
    }
  } else {
    // RTDB only
    const existingSnap = await dbPool.optimizedGet(`wishlists/${userId}`);
    if (existingSnap.exists()) {
      let dup = false;
      existingSnap.forEach(child => {
        const d = child.val();
        if (d && d.propertyId === propertyId) dup = true;
      });
      if (dup) throw new Error('Property already in wishlist');
    }
    itemId = await dbPool.optimizedPush(`wishlists/${userId}`, newItemData);
  }

  const wishlistItem: WishlistItem = {
    id: itemId,
    userId,
    propertyId,
    addedAt: new Date(),
    notes,
    priority,
  };

  try {
    cacheService.clearAll();
  } catch (e) {
    console.warn('[Firestore Wishlist] Failed to clear cache after add:', e);
  }

  console.log(`[Firestore Wishlist] ✅ Added property ${propertyId} with item ID ${itemId}`);
  return wishlistItem;
}

// ─── Remove from wishlist ───────────────────────────────────────────────────

export async function removeFromWishlist(userId: string, propertyId: string): Promise<boolean> {
  const phase = getPhase();
  console.log(`[Firestore Wishlist] Removing property ${propertyId} for user ${userId} (phase=${phase})`);

  if (phase === 'firestore') {
    const itemsCol = getUserWishlistCol(userId);
    const matches = await getDocs(fsQuery(itemsCol, where('propertyId', '==', propertyId)));
    if (matches.empty) return false;
    for (const docSnap of matches.docs) {
      await deleteDoc(docSnap.ref);
    }
  } else if (phase === 'dual-read' || phase === 'shadow') {
    const snap = await rtdbGet(getUserWishlistRtdbRef(userId));
    if (!snap.exists()) return false;
    let found = false;
    const updates: Record<string, null> = {};
    snap.forEach(child => {
      const d = child.val();
      if (d && d.propertyId === propertyId) {
        updates[`wishlists/${userId}/${child.key}`] = null;
        found = true;
      }
    });
    if (!found) return false;
    await rtdbUpdate(rtdbRef(database), updates);
    try {
      const itemsCol = getUserWishlistCol(userId);
      const fsMatches = await getDocs(fsQuery(itemsCol, where('propertyId', '==', propertyId)));
      for (const d of fsMatches.docs) await deleteDoc(d.ref);
    } catch (err) {
      console.warn('[Firestore Wishlist] Shadow delete failed:', err);
    }
  } else {
    const snap = await dbPool.optimizedGet(`wishlists/${userId}`);
    if (!snap.exists()) return false;
    const updates: Record<string, null> = {};
    let found = false;
    snap.forEach(child => {
      const d = child.val();
      if (d && d.propertyId === propertyId) {
        updates[`wishlists/${userId}/${child.key}`] = null;
        found = true;
      }
    });
    if (!found) return false;
    await dbPool.optimizedUpdate('', updates);
  }

  try { cacheService.clearAll(); } catch (e) { /* ignore */ }
  console.log(`[Firestore Wishlist] ✅ Removed property ${propertyId}`);
  return true;
}

// ─── Get user wishlist (with property details) ──────────────────────────────

async function fetchWishlistItems(userId: string): Promise<WishlistItem[]> {
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const itemsCol = getUserWishlistCol(userId);
      const snap = await getDocs(itemsCol);
      if (!snap.empty) {
        return snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId,
            propertyId: data.propertyId,
            addedAt: new Date(data.addedAt),
            notes: data.notes || undefined,
            priority: data.priority || 'medium',
          } as WishlistItem;
        });
      }
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Wishlist] Firestore read failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  // RTDB
  const snap = await dbPool.optimizedGet(`wishlists/${userId}`);
  if (!snap.exists()) return [];

  const items: WishlistItem[] = [];
  snap.forEach((child: RtdbDataSnapshot) => {
    const data = child.val();
    if (data) {
      items.push({
        id: child.key!,
        userId: data.userId,
        propertyId: data.propertyId,
        addedAt: new Date(data.addedAt),
        notes: data.notes || undefined,
        priority: data.priority || 'medium',
      });
    }
  });
  return items;
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

      wishlistProperties.push(...enrichWishlistProperties(wishlistItems, propertyMap));
    }

    wishlistProperties.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    cacheService.setUserWishlist(userId, wishlistProperties, 15 * 60 * 1000);
    console.log(`[Firestore Wishlist] ✅ Returning ${wishlistProperties.length} properties`);
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

    return enrichWishlistProperties(wishlistItems, propertyMap);
  } catch (err) {
    console.error('[Firestore Wishlist] ❌ Error getting uncached wishlist:', err);
    throw err;
  }
}

// ─── Other wishlist operations ──────────────────────────────────────────────

export async function isInWishlist(userId: string, propertyId: string): Promise<boolean> {
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const itemsCol = getUserWishlistCol(userId);
      const matches = await getDocs(fsQuery(itemsCol, where('propertyId', '==', propertyId)));
      return !matches.empty;
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Wishlist] Firestore check failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const snap = await rtdbGet(getUserWishlistRtdbRef(userId));
  if (!snap.exists()) return false;
  let found = false;
  snap.forEach(child => {
    const d = child.val();
    if (d && d.propertyId === propertyId) found = true;
  });
  return found;
}

export async function updateWishlistItem(
  userId: string,
  propertyId: string,
  updates: { notes?: string; priority?: 'low' | 'medium' | 'high' }
): Promise<WishlistItem | null> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const itemsCol = getUserWishlistCol(userId);
    const matches = await getDocs(fsQuery(itemsCol, where('propertyId', '==', propertyId)));
    if (matches.empty) return null;
    const docSnap = matches.docs[0];
    const currentData = docSnap.data();
    const updatedData = {
      ...currentData,
      notes: updates.notes !== undefined ? updates.notes : (currentData.notes || null),
      priority: updates.priority || currentData.priority,
    };
    await setDoc(docSnap.ref, updatedData);
    return {
      id: docSnap.id,
      userId: currentData.userId,
      propertyId: currentData.propertyId,
      addedAt: new Date(currentData.addedAt),
      notes: updatedData.notes || undefined,
      priority: updatedData.priority,
    };
  }

  // RTDB path (also used in shadow/dual-read for primary write)
  const snap = await rtdbGet(getUserWishlistRtdbRef(userId));
  if (!snap.exists()) return null;

  let result: WishlistItem | null = null;
  const fsPromises: Promise<void>[] = [];

  for (const child of snap.val() ? Object.entries(snap.val()) : []) {
    const [key, currentData] = child as [string, any];
    if (currentData && currentData.propertyId === propertyId) {
      const updatedData = {
        ...currentData,
        notes: updates.notes !== undefined ? updates.notes : (currentData.notes || null),
        priority: updates.priority || currentData.priority,
      };

      if (phase === 'dual-read' || phase === 'shadow') {
        await rtdbSet(rtdbRef(database, `wishlists/${userId}/${key}`), updatedData);
        try {
          await setDoc(getWishlistItemDoc(userId, key), updatedData);
        } catch (err) {
          console.warn('[Firestore Wishlist] Shadow update failed:', err);
        }
      } else {
        await rtdbSet(rtdbRef(database, `wishlists/${userId}/${key}`), updatedData);
      }

      result = {
        id: key,
        userId: currentData.userId,
        propertyId: currentData.propertyId,
        addedAt: new Date(currentData.addedAt),
        notes: updatedData.notes || undefined,
        priority: updatedData.priority,
      };
      break;
    }
  }

  try { cacheService.clearAll(); } catch (e) { /* ignore */ }
  return result;
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
  const phase = getPhase();

  if (phase === 'firestore') {
    const itemsCol = getUserWishlistCol(userId);
    const snap = await getDocs(itemsCol);
    for (const d of snap.docs) await deleteDoc(d.ref);
  } else if (phase === 'dual-read' || phase === 'shadow') {
    await rtdbRemove(getUserWishlistRtdbRef(userId));
    try {
      const itemsCol = getUserWishlistCol(userId);
      const snap = await getDocs(itemsCol);
      for (const d of snap.docs) await deleteDoc(d.ref);
    } catch (err) {
      console.warn('[Firestore Wishlist] Shadow clear failed:', err);
    }
  } else {
    await rtdbRemove(getUserWishlistRtdbRef(userId));
  }

  try { cacheService.clearAll(); } catch (e) { /* ignore */ }
  return true;
}

export async function getRawWishlistItems(userId: string): Promise<WishlistItem[]> {
  return fetchWishlistItems(userId);
}

// ─── Real-time listener support ─────────────────────────────────────────────
// Returns an unsubscribe function. Used by WishlistContext / EnhancedWishlistContext.

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
 * (Alternative to subscribeToWishlist for contexts that need the raw ref)
 */
export function getUserWishlistFirestoreRef(userId: string): CollectionReference {
  return getUserWishlistCol(userId);
}

// Keep RTDB ref export for backward compatibility during migration
export function getUserWishlistRef(userId: string) {
  return rtdbRef(database, `wishlists/${userId}`);
}

export function getUserActivityRef(userId: string) {
  return rtdbRef(database, `activities/${userId}`);
}
