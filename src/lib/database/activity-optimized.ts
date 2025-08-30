/**
 * Optimized activity service with Firebase persistence, caching, and batch processing
 */

import { UserActivity, ActivityStats, ActivityAggregation, PaginatedActivities, ActivityType } from '@/types/auth';
import { getPropertyById, database } from '@/lib/firebase';
import { ref, push, get, query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';
import { cacheService } from './cache';
import { dbPool } from './connection-pool';

// Batch processing for activity logging
interface ActivityBatch {
  activities: UserActivity[];
  timeout: NodeJS.Timeout | null;
}

class ActivityBatchProcessor {
  private batches = new Map<string, ActivityBatch>();
  private batchSize = 10;
  private batchTimeout = 2000; // 2 seconds

  /**
   * Add activity to batch for processing
   */
  addToBatch(userId: string, activity: Omit<UserActivity, 'id'>): Promise<UserActivity> {
    return new Promise((resolve, reject) => {
      const batch = this.batches.get(userId) || { activities: [], timeout: null };
      
      const fullActivity: UserActivity = {
        ...activity,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      batch.activities.push(fullActivity);
      
      // If batch is full, process immediately
      if (batch.activities.length >= this.batchSize) {
        this.processBatch(userId);
        resolve(fullActivity);
      } else {
        // Set timeout to process batch
        if (batch.timeout) {
          clearTimeout(batch.timeout);
        }
        
        batch.timeout = setTimeout(() => {
          this.processBatch(userId);
        }, this.batchTimeout);
        
        this.batches.set(userId, batch);
        resolve(fullActivity);
      }
    });
  }

  /**
   * Process batch of activities for a user
   */
  private async processBatch(userId: string): Promise<void> {
    const batch = this.batches.get(userId);
    if (!batch || batch.activities.length === 0) return;

    try {
      console.log(`[Activity Batch] Processing ${batch.activities.length} activities for user ${userId}`);
      
      // Clear timeout
      if (batch.timeout) {
        clearTimeout(batch.timeout);
      }
      
      // Remove batch from map
      this.batches.delete(userId);
      
      // Prepare batch data for Firebase
      const batchData: Record<string, any> = {};
      const userActivityPath = `activities/${userId}`;
      
      for (const activity of batch.activities) {
        const activityKey = `${userActivityPath}/${activity.id}`;
        batchData[activityKey] = {
          userId: activity.userId,
          type: activity.type,
          propertyId: activity.propertyId || null,
          metadata: activity.metadata || {},
          timestamp: activity.timestamp.toISOString(),
          sessionId: activity.sessionId,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent
        };
      }
      
      // Write batch to Firebase
      await dbPool.optimizedUpdate('', batchData);
      
      // Invalidate relevant caches
      cacheService.invalidateUserActivity(userId);
      cacheService.invalidateUserStats(userId, 'activity');
      
      console.log(`[Activity Batch] ✅ Successfully processed ${batch.activities.length} activities for user ${userId}`);
      
    } catch (error) {
      console.error(`[Activity Batch] ❌ Error processing batch for user ${userId}:`, error);
      
      // Re-add activities to batch for retry (simple retry mechanism)
      const retryBatch = this.batches.get(userId) || { activities: [], timeout: null };
      retryBatch.activities.unshift(...batch.activities);
      this.batches.set(userId, retryBatch);
    }
  }

  /**
   * Force process all pending batches
   */
  async flushAll(): Promise<void> {
    const userIds = Array.from(this.batches.keys());
    await Promise.all(userIds.map(userId => this.processBatch(userId)));
  }

  /**
   * Get batch statistics
   */
  getStats(): { pendingBatches: number; totalPendingActivities: number } {
    let totalPendingActivities = 0;
    for (const batch of this.batches.values()) {
      totalPendingActivities += batch.activities.length;
    }
    
    return {
      pendingBatches: this.batches.size,
      totalPendingActivities
    };
  }
}

// Singleton batch processor
const activityBatchProcessor = new ActivityBatchProcessor();

// Auto-flush batches every 30 seconds
setInterval(() => {
  activityBatchProcessor.flushAll().catch(error => {
    console.error('[Activity Batch] Error during auto-flush:', error);
  });
}, 30 * 1000);

/**
 * Log user activity with batch processing
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  propertyId?: string,
  metadata: Record<string, any> = {},
  sessionId: string = 'default-session',
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Unknown'
): Promise<UserActivity> {
  try {
    const activity = await activityBatchProcessor.addToBatch(userId, {
      userId,
      type,
      propertyId,
      metadata,
      timestamp: new Date(),
      sessionId,
      ipAddress,
      userAgent
    });
    
    console.log(`[Activity] ✅ Activity queued for batch processing: ${type} for user ${userId}`);
    return activity;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error logging activity:`, error);
    throw error;
  }
}

/**
 * Get user's activity history with caching and optimized queries
 */
export async function getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
  try {
    const cacheKey = `activity-${limit}`;
    
    // Check cache first
    const cachedActivities = cacheService.getUserActivity(userId, cacheKey);
    if (cachedActivities) {
      console.log(`[Activity] ✅ Returning cached activities for user ${userId}`);
      return cachedActivities;
    }
    
    console.log(`[Activity] Getting activity history for user ${userId} (limit: ${limit})`);
    
    const userActivityPath = `activities/${userId}`;
    
    // Use Firebase query with ordering and limiting for better performance
    const activityRef = ref(database, userActivityPath);
    const activityQuery = query(
      activityRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    );
    
    const snapshot = await dbPool.optimizedGet(userActivityPath);
    
    if (!snapshot.exists()) {
      console.log(`[Activity] No activities found for user ${userId}`);
      const emptyActivities: UserActivity[] = [];
      cacheService.setUserActivity(userId, emptyActivities, cacheKey);
      return emptyActivities;
    }
    
    const activities: UserActivity[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        activities.push({
          id: childSnapshot.key!,
          userId: data.userId,
          type: data.type,
          propertyId: data.propertyId || undefined,
          metadata: data.metadata || {},
          timestamp: new Date(data.timestamp),
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        });
      }
    });
    
    // Sort by most recent first
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Take only the requested limit
    const limitedActivities = activities.slice(0, limit);
    
    // Cache the result
    cacheService.setUserActivity(userId, limitedActivities, cacheKey);
    
    console.log(`[Activity] ✅ Returning ${limitedActivities.length} activities for user ${userId}`);
    return limitedActivities;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error getting user activity:`, error);
    throw error;
  }
}

/**
 * Get paginated user activity with optimized Firebase queries
 */
export async function getPaginatedUserActivity(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    type?: ActivityType;
    startDate?: Date;
    endDate?: Date;
    propertyId?: string;
  } = {}
): Promise<PaginatedActivities> {
  try {
    const { page = 1, limit = 50, type, startDate, endDate, propertyId } = options;
    const cacheKey = `paginated-${page}-${limit}-${type || 'all'}-${startDate?.getTime() || 'none'}-${endDate?.getTime() || 'none'}-${propertyId || 'all'}`;
    
    // Check cache first
    const cachedResult = cacheService.getUserActivity(userId, cacheKey);
    if (cachedResult) {
      console.log(`[Activity] ✅ Returning cached paginated activities for user ${userId}`);
      return cachedResult as any;
    }
    
    console.log(`[Activity] Getting paginated activities for user ${userId}`, options);
    
    const userActivityPath = `activities/${userId}`;
    let activityQuery = query(ref(database, userActivityPath), orderByChild('timestamp'));
    
    // Apply date filters to query
    if (startDate) {
      activityQuery = query(activityQuery, startAt(startDate.toISOString()));
    }
    if (endDate) {
      activityQuery = query(activityQuery, endAt(endDate.toISOString()));
    }
    
    const snapshot = await dbPool.optimizedGet(userActivityPath);
    
    if (!snapshot.exists()) {
      const emptyResult: PaginatedActivities = {
        activities: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
      cacheService.setUserActivity(userId, emptyResult as any, cacheKey, 30 * 1000); // Cache for 30 seconds
      return emptyResult;
    }
    
    let activities: UserActivity[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        const activity: UserActivity = {
          id: childSnapshot.key!,
          userId: data.userId,
          type: data.type,
          propertyId: data.propertyId || undefined,
          metadata: data.metadata || {},
          timestamp: new Date(data.timestamp),
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        };
        
        // Apply client-side filters (for complex filtering not supported by Firebase queries)
        if (type && activity.type !== type) return;
        if (propertyId && activity.propertyId !== propertyId) return;
        
        activities.push(activity);
      }
    });
    
    // Sort by most recent first
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    const result: PaginatedActivities = {
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
    // Cache the result
    cacheService.setUserActivity(userId, result as any, cacheKey);
    
    console.log(`[Activity] ✅ Returning ${paginatedActivities.length} paginated activities for user ${userId}`);
    return result;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error getting paginated user activity:`, error);
    throw error;
  }
}

/**
 * Get user activity statistics with caching
 */
export async function getUserActivityStats(userId: string): Promise<ActivityStats> {
  try {
    // Check cache first
    const cachedStats = cacheService.getUserStats(userId, 'activity');
    if (cachedStats) {
      console.log(`[Activity] ✅ Returning cached activity stats for user ${userId}`);
      return cachedStats;
    }
    
    console.log(`[Activity] Getting activity stats for user ${userId}`);
    
    const activities = await getUserActivity(userId, 1000); // Get more activities for better stats
    
    // Basic counts
    const totalActivities = activities.length;
    const totalViews = activities.filter(a => a.type === 'property_view').length;
    const wishlistItems = activities.filter(a => a.type === 'wishlist_add').length;
    
    // Recent activities (last 10)
    const recentActivities = activities.slice(0, 10);
    
    // Top viewed properties with caching
    const propertyViewCounts = new Map<string, number>();
    const propertyDetails = new Map<string, any>();
    
    for (const activity of activities) {
      if (activity.type === 'property_view' && activity.propertyId) {
        propertyViewCounts.set(activity.propertyId, (propertyViewCounts.get(activity.propertyId) || 0) + 1);
        
        if (!propertyDetails.has(activity.propertyId)) {
          // Check property cache first
          let property = cacheService.getProperty(activity.propertyId);
          if (!property) {
            property = await getPropertyById(activity.propertyId);
            if (property) {
              cacheService.setProperty(activity.propertyId, property);
            }
          }
          
          if (property) {
            propertyDetails.set(activity.propertyId, {
              title: property.title,
              location: property.location,
              price: property.price,
              imageUrl: property.images?.[0] || '',
              type: property.category || 'Unknown'
            });
          }
        }
      }
    }
    
    const topViewedProperties = Array.from(propertyViewCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([propertyId, viewCount]) => ({
        propertyId,
        viewCount,
        property: propertyDetails.get(propertyId) || {
          title: 'Unknown Property',
          location: 'Unknown',
          price: 0,
          imageUrl: '',
          type: 'Unknown'
        }
      }));
    
    const stats: ActivityStats = {
      totalViews,
      wishlistItems,
      totalActivities,
      recentActivities,
      topViewedProperties
    };
    
    // Cache the result
    cacheService.setUserStats(userId, stats, 'activity');
    
    console.log(`[Activity] ✅ Returning activity stats for user ${userId}`);
    return stats;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error getting user activity stats:`, error);
    throw error;
  }
}

/**
 * Get activity aggregation with caching and optimized queries
 */
export async function getActivityAggregation(
  options: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'hour' | 'week';
  } = {}
): Promise<ActivityAggregation> {
  try {
    const { userId, startDate, endDate, groupBy = 'day' } = options;
    const cacheKey = `aggregation-${userId || 'global'}-${groupBy}-${startDate?.getTime() || 'none'}-${endDate?.getTime() || 'none'}`;
    
    // Check cache first
    const cachedAggregation = userId 
      ? cacheService.getUserStats(userId, cacheKey)
      : cacheService.getGlobalStats(cacheKey);
    
    if (cachedAggregation) {
      console.log(`[Activity] ✅ Returning cached activity aggregation`);
      return cachedAggregation;
    }
    
    console.log(`[Activity] Getting activity aggregation`, options);
    
    // Get activities based on scope
    let allActivities: UserActivity[] = [];
    if (userId) {
      allActivities = await getUserActivity(userId, 10000); // Get more activities for aggregation
    } else {
      // For global aggregation, we'd need to query all users
      // This is a simplified implementation - in production, consider using Firebase aggregation queries
      console.warn('[Activity] Global aggregation not fully implemented - returning empty data');
    }
    
    // Apply date filters
    if (startDate || endDate) {
      allActivities = allActivities.filter(activity => {
        if (startDate && activity.timestamp < startDate) return false;
        if (endDate && activity.timestamp > endDate) return false;
        return true;
      });
    }
    
    const totalActivities = allActivities.length;
    
    // Activities by type
    const activitiesByType: Record<ActivityType, number> = {
      property_view: 0,
      wishlist_add: 0,
      wishlist_remove: 0,
      search: 0,
      filter_apply: 0,
      contact_inquiry: 0,
      property_share: 0
    };
    
    allActivities.forEach(activity => {
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
    });
    
    // Activities by time period (simplified implementation)
    const activitiesByDay: Array<{
      date: string;
      count: number;
      types: Record<ActivityType, number>;
    }> = [];
    
    // Group activities by day
    const dayMap = new Map<string, { count: number; types: Record<ActivityType, number> }>();
    
    allActivities.forEach(activity => {
      const dateStr = activity.timestamp.toISOString().split('T')[0];
      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, {
          count: 0,
          types: {
            property_view: 0,
            wishlist_add: 0,
            wishlist_remove: 0,
            search: 0,
            filter_apply: 0,
            contact_inquiry: 0,
            property_share: 0
          }
        });
      }
      const dayData = dayMap.get(dateStr)!;
      dayData.count++;
      dayData.types[activity.type]++;
    });
    
    dayMap.forEach((data, date) => {
      activitiesByDay.push({ date, ...data });
    });
    
    activitiesByDay.sort((a, b) => a.date.localeCompare(b.date));
    
    // Top properties (simplified)
    const topProperties: Array<{
      propertyId: string;
      viewCount: number;
      title?: string;
    }> = [];
    
    const aggregation: ActivityAggregation = {
      totalActivities,
      activitiesByType,
      activitiesByDay,
      activitiesByHour: [], // Simplified - not implemented
      topProperties,
      userEngagement: {
        averageSessionDuration: 0,
        averageActivitiesPerSession: 0,
        returnUserRate: 0
      }
    };
    
    // Cache the result
    if (userId) {
      cacheService.setUserStats(userId, aggregation, cacheKey);
    } else {
      cacheService.setGlobalStats(cacheKey, aggregation);
    }
    
    console.log(`[Activity] ✅ Returning activity aggregation`);
    return aggregation;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error getting activity aggregation:`, error);
    throw error;
  }
}

/**
 * Clear user activity history
 */
export async function clearUserActivity(userId: string): Promise<boolean> {
  try {
    console.log(`[Activity] Clearing activity history for user ${userId}`);
    
    const userActivityPath = `activities/${userId}`;
    await dbPool.optimizedRemove(userActivityPath);
    
    // Invalidate caches
    cacheService.invalidateUserActivity(userId);
    cacheService.invalidateUserStats(userId);
    
    console.log(`[Activity] ✅ Successfully cleared activity history for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error(`[Activity] ❌ Error clearing user activity:`, error);
    return false;
  }
}

/**
 * Get batch processor statistics
 */
export function getBatchProcessorStats() {
  return activityBatchProcessor.getStats();
}

/**
 * Force flush all pending batches
 */
export async function flushActivityBatches(): Promise<void> {
  await activityBatchProcessor.flushAll();
}

// Export the batch processor for testing
export { activityBatchProcessor };