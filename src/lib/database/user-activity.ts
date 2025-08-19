import { database } from '@/lib/firebase';
import { ref, push, set, get, query, orderByChild, limitToLast, update, DataSnapshot } from 'firebase/database';
import { UserActivity, PropertyView, SearchQuery, EngagementData, UserAnalytics, PropertyTypeStats, LocationStats, DailyActivity, ConversionData } from '@/types/auth';
import { getPropertyById, getAllProperties } from '@/lib/firebase';

// Firebase references
const activitiesRef = ref(database, 'userActivities');

/**
 * Get Firebase reference for user's activities
 */
function getUserActivitiesRef(userId: string) {
  return ref(database, `userActivities/${userId}`);
}

/**
 * Log user activity to Firebase
 */
export async function logUserActivity(
  userId: string,
  type: UserActivity['type'],
  propertyId?: string,
  metadata: Record<string, any> = {},
  sessionId: string = 'default-session',
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Unknown'
): Promise<UserActivity> {
  try {
    console.log(`[UserActivity] Logging ${type} for user ${userId}`);
    
    const userActivitiesRef = getUserActivitiesRef(userId);
    const activityRef = push(userActivitiesRef);
    
    const activity: UserActivity = {
      id: activityRef.key!,
      userId,
      type,
      propertyId,
      metadata,
      timestamp: new Date(),
      sessionId,
      ipAddress,
      userAgent
    };
    
    await set(activityRef, {
      ...activity,
      timestamp: activity.timestamp.toISOString()
    });
    
    console.log(`[UserActivity] ✅ Successfully logged ${type} activity for user ${userId}`);
    return activity;
    
  } catch (error) {
    console.error(`[UserActivity] ❌ Error logging activity:`, error);
    throw error;
  }
}

/**
 * Get user's activity history from Firebase
 */
export async function getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
  try {
    console.log(`[UserActivity] Getting activity for user ${userId}, limit: ${limit}`);
    
    const userActivitiesRef = getUserActivitiesRef(userId);
    const activitiesQuery = query(userActivitiesRef, limitToLast(limit));
    const snapshot = await get(activitiesQuery);
    
    if (!snapshot.exists()) {
      console.log(`[UserActivity] No activities found for user ${userId}`);
      return [];
    }
    
    const activities: UserActivity[] = [];
    
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      const data = childSnapshot.val();
      if (data) {
        activities.push({
          id: childSnapshot.key!,
          userId: data.userId,
          type: data.type,
          propertyId: data.propertyId,
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
    
    console.log(`[UserActivity] ✅ Found ${activities.length} activities for user ${userId}`);
    return activities;
    
  } catch (error) {
    console.error(`[UserActivity] ❌ Error getting user activity:`, error);
    throw error;
  }
}

/**
 * Get user's property view history
 */
export async function getUserPropertyViews(userId: string, limit: number = 20): Promise<PropertyView[]> {
  try {
    const activities = await getUserActivity(userId, 100); // Get more to filter
    const propertyViews: PropertyView[] = [];
    
    // Filter for property view activities
    const viewActivities = activities
      .filter(activity => activity.type === 'property_view' && activity.propertyId)
      .slice(0, limit);
    
    for (const activity of viewActivities) {
      if (activity.propertyId) {
        const property = await getPropertyById(activity.propertyId);
        propertyViews.push({
          propertyId: activity.propertyId,
          propertyTitle: property?.title || (activity.metadata?.propertyTitle as string) || 'Unknown Property',
          viewedAt: activity.timestamp,
          duration: (activity.metadata?.duration as number) || 60,
          source: (activity.metadata?.source as 'search' | 'direct' | 'wishlist' | 'recommendation') || 'direct'
        });
      }
    }
    
    return propertyViews;
  } catch (error) {
    console.error(`[UserActivity] ❌ Error getting property views:`, error);
    return [];
  }
}

/**
 * Get user's search history
 */
export async function getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchQuery[]> {
  try {
    const activities = await getUserActivity(userId, 100);
    const searchQueries: SearchQuery[] = [];
    
    // Filter for search activities
    const searchActivities = activities
      .filter(activity => activity.type === 'search')
      .slice(0, limit);
    
    for (const activity of searchActivities) {
      searchQueries.push({
        id: activity.id,
        query: (activity.metadata?.query as string) || '',
        filters: (activity.metadata?.filters as Record<string, unknown>) || {},
        timestamp: activity.timestamp,
        resultsCount: (activity.metadata?.resultsCount as number) || 0
      });
    }
    
    return searchQueries;
  } catch (error) {
    console.error(`[UserActivity] ❌ Error getting search history:`, error);
    return [];
  }
}

/**
 * Get comprehensive user analytics from Firebase
 */
export async function getUserAnalyticsFromFirebase(userId: string): Promise<UserAnalytics> {
  try {
    console.log(`[UserActivity] Getting comprehensive analytics for user ${userId}`);
    
    const activities = await getUserActivity(userId, 500); // Get more for analytics
    
    // Basic metrics
    const propertyViews = activities.filter(a => a.type === 'property_view');
    const searches = activities.filter(a => a.type === 'search');
    const wishlistActions = activities.filter(a => a.type === 'wishlist_add' || a.type === 'wishlist_remove');
    const contactInquiries = activities.filter(a => a.type === 'contact_inquiry');
    
    const uniqueProperties = new Set(propertyViews.map(a => a.propertyId).filter(Boolean));
    
    // Property type preferences
    const propertyTypeStats: PropertyTypeStats[] = [];
    const typeCount = new Map<string, number>();
    
    for (const activity of propertyViews) {
      if (activity.propertyId) {
        const property = await getPropertyById(activity.propertyId);
        if (property && property.category) {
          typeCount.set(property.category, (typeCount.get(property.category) || 0) + 1);
        }
      }
    }
    
    const totalViews = propertyViews.length;
    typeCount.forEach((count, type) => {
      propertyTypeStats.push({
        type,
        count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0
      });
    });
    
    // Location preferences
    const locationStats: LocationStats[] = [];
    const locationCount = new Map<string, number>();
    
    for (const activity of propertyViews) {
      if (activity.propertyId) {
        const property = await getPropertyById(activity.propertyId);
        if (property && property.location) {
          locationCount.set(property.location, (locationCount.get(property.location) || 0) + 1);
        }
      }
    }
    
    locationCount.forEach((count, location) => {
      locationStats.push({
        location,
        count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0
      });
    });
    
    // Daily activity for the last 30 days
    const activityByDay: DailyActivity[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(activity => {
        const activityDate = activity.timestamp.toISOString().split('T')[0];
        return activityDate === dateStr;
      });
      
      activityByDay.push({
        date: dateStr,
        views: dayActivities.filter(a => a.type === 'property_view').length,
        searches: dayActivities.filter(a => a.type === 'search').length,
        wishlistActions: dayActivities.filter(a => a.type === 'wishlist_add' || a.type === 'wishlist_remove').length
      });
    }
    
    // Calculate session-based metrics
    const sessions = new Map<string, UserActivity[]>();
    activities.forEach(activity => {
      const sessionActivities = sessions.get(activity.sessionId) || [];
      sessionActivities.push(activity);
      sessions.set(activity.sessionId, sessionActivities);
    });
    
    const totalSessions = sessions.size;
    let totalDuration = 0;
    
    sessions.forEach(sessionActivities => {
      if (sessionActivities.length > 1) {
        const sortedActivities = sessionActivities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const duration = sortedActivities[sortedActivities.length - 1].timestamp.getTime() - sortedActivities[0].timestamp.getTime();
        totalDuration += duration;
      }
    });
    
    // Conversion metrics
    const conversionMetrics: ConversionData = {
      propertyViews: totalViews,
      wishlistAdds: wishlistActions.filter(a => a.type === 'wishlist_add').length,
      contactInquiries: contactInquiries.length,
      conversionRate: totalViews > 0 ? (contactInquiries.length / totalViews) * 100 : 0
    };
    
    const analytics: UserAnalytics = {
      userId,
      totalViews,
      uniqueProperties: uniqueProperties.size,
      averageSessionDuration: totalSessions > 0 ? (totalDuration / totalSessions / 1000) : 0, // in seconds
      favoritePropertyTypes: propertyTypeStats.sort((a, b) => b.count - a.count),
      preferredLocations: locationStats.sort((a, b) => b.count - a.count),
      activityByDay,
      conversionMetrics
    };
    
    console.log(`[UserActivity] ✅ Generated analytics for user ${userId}:`, {
      totalViews: analytics.totalViews,
      uniqueProperties: analytics.uniqueProperties,
      totalActivities: activities.length
    });
    
    return analytics;
    
  } catch (error) {
    console.error(`[UserActivity] ❌ Error getting user analytics:`, error);
    throw error;
  }
}

/**
 * Seed realistic activity data for a user (for testing)
 */
export async function seedUserActivityData(userId: string): Promise<void> {
  try {
    console.log(`[UserActivity] Seeding activity data for user ${userId}`);
    
    // Get some real properties to create realistic activity
    const allProperties = await getAllProperties();
    const sampleProperties = allProperties.slice(0, 20); // Use first 20 properties
    
    const activities: any[] = [];
    const now = new Date();
    
    // Generate activities over the last 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      
      // Random number of activities per day (0-8)
      const dailyActivityCount = Math.floor(Math.random() * 8);
      
      for (let i = 0; i < dailyActivityCount; i++) {
        const randomProperty = sampleProperties[Math.floor(Math.random() * sampleProperties.length)];
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        
        const activityTime = new Date(date);
        activityTime.setHours(randomHour, randomMinute, 0, 0);
        
        // Random activity type
        const activityTypes = ['property_view', 'search', 'wishlist_add', 'contact_inquiry'];
        const weights = [0.6, 0.25, 0.10, 0.05]; // Property views are most common
        let random = Math.random();
        let activityType = 'property_view';
        
        for (let j = 0; j < activityTypes.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            activityType = activityTypes[j];
            break;
          }
        }
        
        let metadata: Record<string, any> = {};
        
        switch (activityType) {
          case 'property_view':
            metadata = {
              propertyTitle: randomProperty.title,
              duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
              source: ['search', 'direct', 'wishlist'][Math.floor(Math.random() * 3)]
            };
            break;
          case 'search':
            const searchTerms = ['office', 'retail', 'apartment', 'commercial', 'shop', 'warehouse'];
            const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Gurugram'];
            metadata = {
              query: searchTerms[Math.floor(Math.random() * searchTerms.length)] + ' ' + locations[Math.floor(Math.random() * locations.length)],
              filters: {
                priceRange: ['0-1000000', '1000000-5000000', '5000000-10000000'][Math.floor(Math.random() * 3)]
              },
              resultsCount: Math.floor(Math.random() * 50) + 5
            };
            break;
          case 'wishlist_add':
            metadata = {
              propertyTitle: randomProperty.title
            };
            break;
          case 'contact_inquiry':
            metadata = {
              propertyTitle: randomProperty.title,
              inquiryType: ['phone', 'email', 'message'][Math.floor(Math.random() * 3)]
            };
            break;
        }
        
        await logUserActivity(
          userId,
          activityType as UserActivity['type'],
          activityType !== 'search' ? randomProperty.id : undefined,
          metadata,
          `session-${dayOffset}-${Math.floor(i / 3)}`, // Group activities into sessions
          '192.168.1.' + Math.floor(Math.random() * 255),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
      }
    }
    
    console.log(`[UserActivity] ✅ Successfully seeded activity data for user ${userId}`);
    
  } catch (error) {
    console.error(`[UserActivity] ❌ Error seeding activity data:`, error);
    throw error;
  }
}

/**
 * Clear all activity data for a user (for testing)
 */
export async function clearUserActivityData(userId: string): Promise<void> {
  try {
    console.log(`[UserActivity] Clearing activity data for user ${userId}`);
    
    const userActivitiesRef = getUserActivitiesRef(userId);
    await set(userActivitiesRef, null);
    
    console.log(`[UserActivity] ✅ Cleared activity data for user ${userId}`);
    
  } catch (error) {
    console.error(`[UserActivity] ❌ Error clearing activity data:`, error);
    throw error;
  }
}