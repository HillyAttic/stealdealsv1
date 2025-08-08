import { UserActivity, PropertyView, SearchQuery, EngagementData, UserAnalytics, PropertyTypeStats, LocationStats, DailyActivity, ConversionData } from '@/types/auth';
import { getPropertyById } from '@/lib/firebase';

// In-memory activity storage for testing (replace with real database in production)
const activities: Map<string, UserActivity[]> = new Map();
let nextActivityId = 1;

// Initialize with test data
function initializeTestActivityData() {
  const testActivities: UserActivity[] = [
    // John Doe activities (user ID: 2)
    {
      id: '1',
      userId: '2',
      type: 'property_view',
      propertyId: 'prop-1',
      metadata: { propertyTitle: 'Luxury Apartment in Mumbai', duration: 120, source: 'search' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      sessionId: 'session-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      userId: '2',
      type: 'wishlist_add',
      propertyId: 'prop-1',
      metadata: { propertyTitle: 'Luxury Apartment in Mumbai' },
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      sessionId: 'session-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '3',
      userId: '2',
      type: 'search',
      metadata: { query: 'apartment mumbai', filters: { priceRange: '500000-2000000' }, resultsCount: 25 },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      sessionId: 'session-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '4',
      userId: '2',
      type: 'property_view',
      propertyId: 'prop-2',
      metadata: { propertyTitle: 'Modern Villa in Delhi', duration: 90, source: 'direct' },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      sessionId: 'session-2',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '5',
      userId: '2',
      type: 'contact_inquiry',
      propertyId: 'prop-2',
      metadata: { propertyTitle: 'Modern Villa in Delhi', inquiryType: 'phone' },
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
      sessionId: 'session-2',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    
    // Jane Smith activities (user ID: 3)
    {
      id: '6',
      userId: '3',
      type: 'property_view',
      propertyId: 'prop-3',
      metadata: { propertyTitle: 'Office Space in Bangalore', duration: 180, source: 'search' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      sessionId: 'session-3',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '7',
      userId: '3',
      type: 'search',
      metadata: { query: 'office bangalore', filters: { propertyType: 'office' }, resultsCount: 15 },
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      sessionId: 'session-3',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '8',
      userId: '3',
      type: 'property_view',
      propertyId: 'prop-4',
      metadata: { propertyTitle: 'Retail Shop in Pune', duration: 60, source: 'wishlist' },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      sessionId: 'session-4',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '9',
      userId: '3',
      type: 'wishlist_add',
      propertyId: 'prop-4',
      metadata: { propertyTitle: 'Retail Shop in Pune' },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 2 days ago + 5 minutes
      sessionId: 'session-4',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  ];
  
  // Group activities by user
  testActivities.forEach(activity => {
    const userActivities = activities.get(activity.userId) || [];
    userActivities.push(activity);
    activities.set(activity.userId, userActivities);
  });
  
  nextActivityId = 10;
}

// Initialize test data
initializeTestActivityData();

/**
 * Log user activity
 */
export async function logActivity(
  userId: string,
  type: UserActivity['type'],
  propertyId?: string,
  metadata: Record<string, any> = {},
  sessionId: string = 'default-session',
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Unknown'
): Promise<UserActivity> {
  try {
    const activity: UserActivity = {
      id: nextActivityId.toString(),
      userId,
      type,
      propertyId,
      metadata,
      timestamp: new Date(),
      sessionId,
      ipAddress,
      userAgent
    };
    
    nextActivityId++;
    
    const userActivities = activities.get(userId) || [];
    userActivities.push(activity);
    activities.set(userId, userActivities);
    
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
}

/**
 * Get user's activity history
 */
export async function getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
  try {
    const userActivities = activities.get(userId) || [];
    
    // Sort by most recent first and limit results
    return userActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
}

/**
 * Get user's property view history
 */
export async function getUserPropertyViews(userId: string, limit: number = 20): Promise<PropertyView[]> {
  try {
    const userActivities = activities.get(userId) || [];
    const propertyViews: PropertyView[] = [];
    
    // Filter for property view activities
    const viewActivities = userActivities
      .filter(activity => activity.type === 'property_view' && activity.propertyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    for (const activity of viewActivities) {
      if (activity.propertyId) {
        const property = await getPropertyById(activity.propertyId);
        propertyViews.push({
          propertyId: activity.propertyId,
          propertyTitle: property?.title || 'Unknown Property',
          viewedAt: activity.timestamp,
          duration: activity.metadata.duration,
          source: activity.metadata.source || 'direct'
        });
      }
    }
    
    return propertyViews;
  } catch (error) {
    console.error('Error getting user property views:', error);
    throw error;
  }
}

/**
 * Get user's search history
 */
export async function getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchQuery[]> {
  try {
    const userActivities = activities.get(userId) || [];
    const searchQueries: SearchQuery[] = [];
    
    // Filter for search activities
    const searchActivities = userActivities
      .filter(activity => activity.type === 'search')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    for (const activity of searchActivities) {
      searchQueries.push({
        id: activity.id,
        query: activity.metadata.query || '',
        filters: activity.metadata.filters || {},
        timestamp: activity.timestamp,
        resultsCount: activity.metadata.resultsCount || 0
      });
    }
    
    return searchQueries;
  } catch (error) {
    console.error('Error getting user search history:', error);
    throw error;
  }
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(userId: string): Promise<EngagementData> {
  try {
    const userActivities = activities.get(userId) || [];
    
    // Calculate session-based metrics
    const sessions = new Map<string, UserActivity[]>();
    userActivities.forEach(activity => {
      const sessionActivities = sessions.get(activity.sessionId) || [];
      sessionActivities.push(activity);
      sessions.set(activity.sessionId, sessionActivities);
    });
    
    const totalSessions = sessions.size;
    let totalDuration = 0;
    let totalPages = 0;
    let bounceSessions = 0;
    
    sessions.forEach(sessionActivities => {
      if (sessionActivities.length === 1) {
        bounceSessions++;
      }
      
      totalPages += sessionActivities.length;
      
      // Calculate session duration (time between first and last activity)
      if (sessionActivities.length > 1) {
        const sortedActivities = sessionActivities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const duration = sortedActivities[sortedActivities.length - 1].timestamp.getTime() - sortedActivities[0].timestamp.getTime();
        totalDuration += duration;
      }
    });
    
    return {
      totalSessions,
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions / 1000 : 0, // in seconds
      pagesPerSession: totalSessions > 0 ? totalPages / totalSessions : 0,
      bounceRate: totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting user engagement metrics:', error);
    throw error;
  }
}

/**
 * Get user analytics
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    const userActivities = activities.get(userId) || [];
    
    // Basic metrics
    const propertyViews = userActivities.filter(a => a.type === 'property_view');
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
      
      const dayActivities = userActivities.filter(activity => {
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
    
    // Conversion metrics
    const wishlistAdds = userActivities.filter(a => a.type === 'wishlist_add').length;
    const contactInquiries = userActivities.filter(a => a.type === 'contact_inquiry').length;
    
    const conversionMetrics: ConversionData = {
      propertyViews: totalViews,
      wishlistAdds,
      contactInquiries,
      conversionRate: totalViews > 0 ? (contactInquiries / totalViews) * 100 : 0
    };
    
    // Calculate average session duration
    const engagementData = await getUserEngagementMetrics(userId);
    
    return {
      userId,
      totalViews,
      uniqueProperties: uniqueProperties.size,
      averageSessionDuration: engagementData.averageSessionDuration,
      favoritePropertyTypes: propertyTypeStats.sort((a, b) => b.count - a.count),
      preferredLocations: locationStats.sort((a, b) => b.count - a.count),
      activityByDay,
      conversionMetrics
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

/**
 * Clear user activity history
 */
export async function clearUserActivity(userId: string): Promise<boolean> {
  try {
    activities.set(userId, []);
    return true;
  } catch (error) {
    console.error('Error clearing user activity:', error);
    return false;
  }
}

/**
 * Get activity statistics for admin
 */
export async function getActivityStatistics(): Promise<{
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activeUsers: number;
  topProperties: Array<{ propertyId: string; views: number; title?: string }>;
}> {
  try {
    let totalActivities = 0;
    const activitiesByType: Record<string, number> = {};
    const activeUsers = new Set<string>();
    const propertyViews = new Map<string, number>();
    
    // Process all activities
    for (const userActivities of activities.values()) {
      for (const activity of userActivities) {
        totalActivities++;
        activeUsers.add(activity.userId);
        
        // Count by type
        activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
        
        // Count property views
        if (activity.type === 'property_view' && activity.propertyId) {
          propertyViews.set(activity.propertyId, (propertyViews.get(activity.propertyId) || 0) + 1);
        }
      }
    }
    
    // Get top properties with titles
    const topProperties: Array<{ propertyId: string; views: number; title?: string }> = [];
    const sortedProperties = Array.from(propertyViews.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    for (const [propertyId, views] of sortedProperties) {
      const property = await getPropertyById(propertyId);
      topProperties.push({
        propertyId,
        views,
        title: property?.title
      });
    }
    
    return {
      totalActivities,
      activitiesByType,
      activeUsers: activeUsers.size,
      topProperties
    };
  } catch (error) {
    console.error('Error getting activity statistics:', error);
    throw error;
  }
}