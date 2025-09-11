import { database } from '@/lib/firebase';
import { ref, push, set, serverTimestamp, get } from 'firebase/database';

export interface WishlistActivity {
  id?: string;
  userId: string;
  action: 'add' | 'remove' | 'update';
  propertyId: string;
  timestamp: any; // Firebase serverTimestamp
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
   */
  async logWishlistActivity(activity: Omit<WishlistActivity, 'id' | 'timestamp'>): Promise<string | null> {
    try {
      console.log(`[ActivityLogger] Logging wishlist activity:`, {
        userId: activity.userId,
        action: activity.action,
        propertyId: activity.propertyId
      });

      // Reference to user's activities
      const userActivitiesRef = ref(database, `activities/${activity.userId}`);
      
      // Create new activity entry
      const newActivityRef = push(userActivitiesRef);
      const activityId = newActivityRef.key;

      if (!activityId) {
        console.error('[ActivityLogger] Failed to generate activity ID');
        return null;
      }

      // Prepare activity data with server timestamp
      const activityData: WishlistActivity = {
        id: activityId,
        userId: activity.userId,
        action: activity.action,
        propertyId: activity.propertyId,
        timestamp: serverTimestamp(),
        metadata: activity.metadata ? {
          ...(activity.metadata.notes !== undefined && { notes: activity.metadata.notes }),
          ...(activity.metadata.priority !== undefined && { priority: activity.metadata.priority }),
          ...(activity.metadata.reason !== undefined && { reason: activity.metadata.reason }),
          ...(activity.metadata.adminUserId !== undefined && { adminUserId: activity.metadata.adminUserId })
        } : {}
      };

      // Save to Firebase
      await set(newActivityRef, activityData);

      // Also store in global activities feed for admin analytics
      const globalActivityRef = ref(database, `global-activities/${activityId}`);
      await set(globalActivityRef, {
        ...activityData,
        createdAt: serverTimestamp()
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
  async getUserActivities(userId: string, limit: number = 50): Promise<WishlistActivity[]> {
    try {
      const userActivitiesRef = ref(database, `activities/${userId}`);
      const snapshot = await get(userActivitiesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const activities: WishlistActivity[] = [];
      snapshot.forEach((childSnapshot) => {
        const activity = childSnapshot.val();
        if (activity && activity.timestamp) {
          activities.push(activity);
        }
      });

      // Sort by timestamp (most recent first) and limit
      return activities
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit);

    } catch (error) {
      console.error('[ActivityLogger] Failed to get user activities:', error);
      return [];
    }
  }

  /**
   * Get recent global activities for admin analytics
   */
  async getGlobalActivities(limit: number = 100): Promise<WishlistActivity[]> {
    try {
      const globalActivitiesRef = ref(database, 'global-activities');
      const snapshot = await get(globalActivitiesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const activities: WishlistActivity[] = [];
      snapshot.forEach((childSnapshot) => {
        const activity = childSnapshot.val();
        if (activity && activity.timestamp) {
          activities.push(activity);
        }
      });

      // Sort by timestamp (most recent first) and limit
      return activities
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit);

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
      const activitiesRef = userId 
        ? ref(database, `activities/${userId}`)
        : ref(database, 'global-activities');
      
      const snapshot = await get(activitiesRef);

      if (!snapshot.exists()) {
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

      snapshot.forEach((childSnapshot) => {
        const activity = childSnapshot.val();
        if (activity) {
          totalActivities++;
          
          switch (activity.action) {
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

          if (activity.timestamp > lastActivityAt) {
            lastActivityAt = activity.timestamp;
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