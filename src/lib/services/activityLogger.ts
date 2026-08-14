import { firestoreDb } from '@/lib/firestore';
import { collection, doc, setDoc, getDocs, addDoc, query, orderBy, limit as fsLimit, serverTimestamp, Timestamp } from 'firebase/firestore';

// Admin SDK import for writing to globalActivities (rule: allow write: if false → Admin SDK only)
let adminDb: any = null;
async function getAdminFirestore() {
  if (!adminDb) {
    try {
      const mod = await import('@/lib/firebase-server-admin');
      adminDb = mod.db;
    } catch {
      // Admin SDK not available — fall back to client SDK (will fail writes to globalActivities)
      adminDb = firestoreDb;
    }
  }
  return adminDb;
}

async function getAdminFieldValue() {
  try {
    const admin = await import('firebase-admin');
    return admin.firestore.FieldValue.serverTimestamp();
  } catch {
    return serverTimestamp();
  }
}

export interface WishlistActivity {
  id?: string;
  userId: string;
  action: 'add' | 'remove' | 'update';
  propertyId: string;
  timestamp: any; // Firestore Timestamp or number
  metadata?: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    reason?: string; // For admin actions
    adminUserId?: string; // If action performed by admin
  };
}

export class ActivityLogger {
  private static instance: ActivityLogger;

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /**
   * Log wishlist activity with real timestamp
   * Uses Admin SDK for writes (security rules require Admin SDK for globalActivities)
   */
  async logWishlistActivity(activity: Omit<WishlistActivity, 'id' | 'timestamp'>): Promise<string | null> {
    try {
      console.log(`[ActivityLogger] Logging wishlist activity:`, {
        userId: activity.userId,
        action: activity.action,
        propertyId: activity.propertyId
      });

      const admDb = await getAdminFirestore();
      const serverTs = await getAdminFieldValue();

      // Create activity data with server timestamp
      const activityData: Record<string, any> = {
        userId: activity.userId,
        action: activity.action,
        propertyId: activity.propertyId,
        timestamp: serverTs,
      };

      if (activity.metadata) {
        const meta: Record<string, any> = {};
        if (activity.metadata.notes !== undefined) meta.notes = activity.metadata.notes;
        if (activity.metadata.priority !== undefined) meta.priority = activity.metadata.priority;
        if (activity.metadata.reason !== undefined) meta.reason = activity.metadata.reason;
        if (activity.metadata.adminUserId !== undefined) meta.adminUserId = activity.metadata.adminUserId;
        if (Object.keys(meta).length > 0) activityData.metadata = meta;
      }

      // Save to user activities subcollection: activities/{userId}/entries/{autoId}
      const userEntriesCol = admDb.collection('activities').doc(activity.userId).collection('entries');
      const docRef = await userEntriesCol.add(activityData);
      const activityId = docRef.id;

      // Also store in global activities feed for admin analytics
      await admDb.collection('globalActivities').doc(activityId).set({
        ...activityData,
        createdAt: serverTs
      });

      console.log(`[ActivityLogger] ✅ Activity logged successfully: ${activityId}`);
      return activityId;

    } catch (error) {
      console.error('[ActivityLogger] ❌ Failed to log activity:', error);
      return null;
    }
  }

  /**
   * Get recent activities for a user
   */
  async getUserActivities(userId: string, maxCount: number = 50): Promise<WishlistActivity[]> {
    try {
      const userActivitiesCol = collection(firestoreDb, 'activities', userId, 'entries');
      const q = query(userActivitiesCol, orderBy('timestamp', 'desc'), fsLimit(maxCount));
      const snapshot = await getDocs(q);

      const activities: WishlistActivity[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.timestamp) {
          activities.push({ id: docSnap.id, ...data } as WishlistActivity);
        }
      });

      return activities;

    } catch (error) {
      console.error('[ActivityLogger] Failed to get user activities:', error);
      return [];
    }
  }

  /**
   * Get recent global activities for admin analytics
   */
  async getGlobalActivities(maxCount: number = 100): Promise<WishlistActivity[]> {
    try {
      const globalActivitiesCol = collection(firestoreDb, 'globalActivities');
      const q = query(globalActivitiesCol, orderBy('timestamp', 'desc'), fsLimit(maxCount));
      const snapshot = await getDocs(q);

      const activities: WishlistActivity[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.timestamp) {
          activities.push({ id: docSnap.id, ...data } as WishlistActivity);
        }
      });

      return activities;

    } catch (error) {
      console.error('[ActivityLogger] Failed to get global activities:', error);
      return [];
    }
  }

  /**
   * Clean up old activities (optional - for maintenance)
   */
  async cleanupOldActivities(olderThanDays: number = 90): Promise<boolean> {
    try {
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      console.log(`[ActivityLogger] Cleaning up activities older than ${olderThanDays} days`);

      // This would typically be done as a background job
      // For now, we'll skip the actual implementation to avoid complexity
      console.log('[ActivityLogger] Activity cleanup scheduled (not implemented in demo)');

      return true;
    } catch (error) {
      console.error('[ActivityLogger] Failed to cleanup old activities:', error);
      return false;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(userId?: string): Promise<{
    totalActivities: number;
    addActions: number;
    removeActions: number;
    updateActions: number;
    lastActivityAt?: number;
  }> {
    try {
      let snapshot;
      if (userId) {
        const userActivitiesCol = collection(firestoreDb, 'activities', userId, 'entries');
        snapshot = await getDocs(userActivitiesCol);
      } else {
        const globalActivitiesCol = collection(firestoreDb, 'globalActivities');
        snapshot = await getDocs(globalActivitiesCol);
      }

      if (snapshot.empty) {
        return {
          totalActivities: 0,
          addActions: 0,
          removeActions: 0,
          updateActions: 0
        };
      }

      let totalActivities = 0;
      let addActions = 0;
      let removeActions = 0;
      let updateActions = 0;
      let lastActivityAt = 0;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data) {
          totalActivities++;

          switch (data.action) {
            case 'add':
              addActions++;
              break;
            case 'remove':
              removeActions++;
              break;
            case 'update':
              updateActions++;
              break;
          }

          // Handle both Timestamp objects and plain numbers
          let ts = 0;
          if (data.timestamp?.toMillis) {
            ts = data.timestamp.toMillis();
          } else if (typeof data.timestamp === 'number') {
            ts = data.timestamp;
          }

          if (ts > lastActivityAt) {
            lastActivityAt = ts;
          }
        }
      });

      return {
        totalActivities,
        addActions,
        removeActions,
        updateActions,
        lastActivityAt: lastActivityAt > 0 ? lastActivityAt : undefined
      };

    } catch (error) {
      console.error('[ActivityLogger] Failed to get activity stats:', error);
      return {
        totalActivities: 0,
        addActions: 0,
        removeActions: 0,
        updateActions: 0
      };
    }
  }
}