import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db, database } from '@/lib/firebase-server-admin';
import admin from 'firebase-admin';

interface MigrationResult {
  success: boolean;
  dryRun: boolean;
  usersFound: number;
  usersMigrated: number;
  usersSkipped: number; // Already in Firestore
  totalItemsMigrated: number;
  errors: Array<{ userId: string; error: string }>;
  duration: string;
}

/**
 * POST /api/admin/migrate-wishlists
 *
 * Migrates wishlist data from RTDB (legacy) to Firestore.
 * Body: { dryRun?: boolean } — if true, reports what would be migrated without writing.
 * Requires superuser role.
 */
export async function POST(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    const startTime = Date.now();
    const adminUserId = authenticatedRequest.user.userId;

    // Only superuser can run migrations
    if (authenticatedRequest.user.role !== 'superuser') {
      return NextResponse.json(
        { success: false, error: 'Only superuser can run migrations' },
        { status: 403 }
      );
    }

    let dryRun = false;
    try {
      const body = await request.json();
      dryRun = body?.dryRun === true;
    } catch {
      dryRun = false;
    }

    console.log(`[Migrate Wishlists] Starting ${dryRun ? '(DRY RUN) ' : ''}migration, initiated by ${adminUserId}`);

    const result: MigrationResult = {
      success: false,
      dryRun,
      usersFound: 0,
      usersMigrated: 0,
      usersSkipped: 0,
      totalItemsMigrated: 0,
      errors: [],
      duration: '0ms',
    };

    try {
      // ── Step 1: Read all wishlist data from RTDB ──
      const rtdbRef = (database as any).ref('wishlists');
      const snapshot = await rtdbRef.get();

      if (!snapshot.exists()) {
        console.log('[Migrate Wishlists] No wishlist data found in RTDB');
        result.success = true;
        result.duration = `${Date.now() - startTime}ms`;
        return NextResponse.json(result);
      }

      const rootVal = snapshot.val();
      const rtdbUserIds = Object.keys(rootVal);
      result.usersFound = rtdbUserIds.length;

      console.log(`[Migrate Wishlists] Found ${result.usersFound} users with RTDB wishlist data`);

      // ── Step 2: Check which users already have data in Firestore ──
      const firestoreWishlistsCol = db.collection('wishlists');

      for (const userId of rtdbUserIds) {
        try {
          const rtdbItems = rootVal[userId];
          if (!rtdbItems || typeof rtdbItems !== 'object') continue;

          // Parse RTDB items into a normalized format
          const items: Array<{ propertyId: string; addedAt: string; notes?: string; priority: string }> = [];
          for (const [_itemId, itemData] of Object.entries(rtdbItems as Record<string, any>)) {
            if (itemData && itemData.propertyId) {
              items.push({
                propertyId: itemData.propertyId,
                addedAt: itemData.addedAt || new Date().toISOString(),
                notes: itemData.notes || undefined,
                priority: itemData.priority || 'medium',
              });
            }
          }

          if (items.length === 0) continue;

          // Check if this user already has items in Firestore
          const firestoreItemsCol = firestoreWishlistsCol.doc(userId).collection('items');
          const existingSnap = await firestoreItemsCol.limit(1).get();

          if (!existingSnap.empty) {
            console.log(`[Migrate Wishlists] ️  User ${userId} already has Firestore data, skipping`);
            result.usersSkipped++;
            continue;
          }

          if (dryRun) {
            console.log(`[Migrate Wishlists] [DRY RUN] Would migrate ${items.length} items for user ${userId}`);
            result.usersMigrated++;
            result.totalItemsMigrated += items.length;
            continue;
          }

          // ── Write to Firestore ──
          const batch = admin.firestore().batch();

          for (const item of items) {
            const docRef = firestoreItemsCol.doc();
            batch.set(docRef, {
              userId,
              propertyId: item.propertyId,
              addedAt: item.addedAt,
              notes: item.notes || null,
              priority: item.priority,
            });
          }

          await batch.commit();

          console.log(`[Migrate Wishlists] ✅ Migrated ${items.length} items for user ${userId}`);
          result.usersMigrated++;
          result.totalItemsMigrated += items.length;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[Migrate Wishlists] ❌ Failed to migrate user ${userId}:`, errorMsg);
          result.errors.push({ userId, error: errorMsg });
        }
      }

      result.success = true;
    } catch (error) {
      console.error('[Migrate Wishlists] Fatal error:', error);
      result.errors.push({ userId: 'SYSTEM', error: error instanceof Error ? error.message : 'Unknown error' });
    }

    result.duration = `${Date.now() - startTime}ms`;

    console.log('[Migrate Wishlists] Final result:', JSON.stringify(result));

    return NextResponse.json(result);
  });
}
