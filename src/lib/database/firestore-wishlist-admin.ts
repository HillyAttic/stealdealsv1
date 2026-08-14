// Server-only Admin SDK wishlist operations
// This file is dynamically imported from firestore-wishlist.ts ONLY in server code paths.
// It MUST NOT be statically imported by any client component.
//
// Uses Firebase Admin SDK which bypasses Firestore security rules.

import { db } from '@/lib/firebase-server-admin';
import admin from 'firebase-admin';
import { WishlistItem } from '@/types/auth';

function adminDb() {
  return db as admin.firestore.Firestore;
}

function itemsCol(userId: string) {
  return adminDb().collection('wishlists').doc(userId).collection('items');
}

export async function adminAddToWishlist(
  userId: string,
  propertyId: string,
  notes: string | null,
  priority: 'low' | 'medium' | 'high'
): Promise<{ itemId: string }> {
  const col = itemsCol(userId);
  const existing = await col.where('propertyId', '==', propertyId).get();
  if (!existing.empty) {
    throw new Error('Property already in wishlist');
  }
  const docRef = col.doc();
  await docRef.set({
    userId,
    propertyId,
    addedAt: new Date().toISOString(),
    notes,
    priority,
  });
  return { itemId: docRef.id };
}

export async function adminRemoveFromWishlist(userId: string, propertyId: string): Promise<boolean> {
  const col = itemsCol(userId);
  const matches = await col.where('propertyId', '==', propertyId).get();
  if (matches.empty) return false;
  const batch = adminDb().batch();
  matches.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return true;
}

export async function adminFetchWishlistItems(userId: string): Promise<WishlistItem[]> {
  const col = itemsCol(userId);
  const snap = await col.get();
  if (snap.empty) return [];
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

export async function adminIsInWishlist(userId: string, propertyId: string): Promise<boolean> {
  const col = itemsCol(userId);
  const matches = await col.where('propertyId', '==', propertyId).get();
  return !matches.empty;
}

export async function adminUpdateWishlistItem(
  userId: string,
  propertyId: string,
  updates: { notes?: string; priority?: 'low' | 'medium' | 'high' }
): Promise<WishlistItem | null> {
  const col = itemsCol(userId);
  const matches = await col.where('propertyId', '==', propertyId).get();
  if (matches.empty) return null;
  const docSnap = matches.docs[0];
  const currentData = docSnap.data();
  const updatedData = {
    ...currentData,
    notes: updates.notes !== undefined ? updates.notes : (currentData.notes || null),
    priority: updates.priority || currentData.priority,
  };
  await docSnap.ref.update(updatedData);
  return {
    id: docSnap.id,
    userId: currentData.userId,
    propertyId: currentData.propertyId,
    addedAt: new Date(currentData.addedAt),
    notes: updatedData.notes || undefined,
    priority: updatedData.priority,
  };
}

export async function adminClearWishlist(userId: string): Promise<boolean> {
  const col = itemsCol(userId);
  const snap = await col.get();
  if (!snap.empty) {
    const batch = adminDb().batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  return true;
}
