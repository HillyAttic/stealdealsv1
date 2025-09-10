import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { clerkClient } from '@clerk/nextjs/server';
import { ActivityLogger } from '@/lib/services/activityLogger';

interface WishlistStatsResponse {
  totalUsers: number;
  usersWithWishlists: number;
  totalWishlistItems: number;
  averageWishlistSize: number;
  topWishlistedProperties: Array<{
    propertyId: string;
    count: number;
    property?: {
      title: string;
      location: string;
      price: number;
      type: string;
      imageUrl?: string;
    };
  }>;
  wishlistsByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivity: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
    action: 'add' | 'remove';
    propertyId: string;
    timestamp: string;
  }>;
  userEngagementMetrics: {
    mostActiveUsers: Array<{
      userId: string;
      userName?: string;
      userEmail?: string;
      wishlistCount: number;
      lastActivity?: string;
    }>;
    averageItemsPerUser: number;
    engagementDistribution: {
      '1-5': number;
      '6-10': number;
      '11-20': number;
      '20+': number;
    };
  };
  activityTrends: {
    totalActivitiesToday: number;
    addActionsToday: number;
    removeActionsToday: number;
    dailyActivityTrend: Array<{
      date: string;
      totalActivities: number;
      adds: number;
      removes: number;
    }>;
    hourlyPattern: Array<{
      hour: number;
      activities: number;
    }>;
  };
  realTimeMetrics: {
    activeUsersLastHour: number;
    propertiesAddedLastHour: number;
    propertiesRemovedLastHour: number;
    popularPropertyTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    locationTrends: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
  };
}

// Enhanced logging utility for admin stats operations
function logAdminStatsOperation(
  operation: string,
  adminUserId: string,
  metadata?: any,
  error?: Error
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    operation,
    adminUserId,
    metadata,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : undefined
  };
  
  if (error) {
    console.error(`[Admin Stats API] ❌ ${operation} failed:`, logData);
  } else {
    console.log(`[Admin Stats API] ✅ ${operation} successful:`, logData);
  }
}

// Helper function to get property details
async function getPropertyDetails(propertyId: string): Promise<any> {
  try {
    const { getPropertyById } = await import('@/lib/firebase');
    return await getPropertyById(propertyId);
  } catch (error) {
    console.warn(`[Admin Stats] Failed to get property ${propertyId}:`, error);
    return null;
  }
}

// Helper function to get user details from Clerk
async function getUserDetails(userId: string): Promise<{ id: string; name?: string; email?: string } | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Build user name with fallbacks
    let userName = 'Unknown User';
    if (user.firstName && user.lastName) {
      userName = `${user.firstName} ${user.lastName}`;
    } else if (user.username) {
      userName = user.username;
    } else if (user.primaryEmailAddress?.emailAddress) {
      // Use part of email as username if no other name is available
      userName = user.primaryEmailAddress.emailAddress.split('@')[0];
    }
    
    // Always try to get email address from multiple sources
    let email = user.primaryEmailAddress?.emailAddress;
    if (!email && user.emailAddresses && user.emailAddresses.length > 0) {
      email = user.emailAddresses[0].emailAddress;
    }
    
    return {
      id: user.id,
      name: userName,
      email: email || `user-${userId.substring(0, 8)}@system.local` // Fallback email for display
    };
  } catch (error) {
    console.warn(`[Admin Stats] Failed to get user details for ${userId}:`, error);
    // Return fallback user data instead of null
    return {
      id: userId,
      name: `User ${userId.substring(0, 8)}`,
      email: `user-${userId.substring(0, 8)}@system.local`
    };
  }
}

// GET /api/admin/wishlist-stats - Get comprehensive wishlist statistics
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    const startTime = Date.now();
    const adminUserId = authenticatedRequest.user.userId;
    
    try {
      logAdminStatsOperation('get_wishlist_stats', adminUserId, { startRequest: true });

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const includeRecentActivity = searchParams.get('includeActivity') !== 'false';
      const includeUserDetails = searchParams.get('includeUserDetails') !== 'false';
      const topPropertiesLimit = Math.min(parseInt(searchParams.get('topLimit') || '10'), 50);
      const recentActivityLimit = Math.min(parseInt(searchParams.get('activityLimit') || '20'), 100);

      // Get all wishlists from Firebase
      const wishlistsRef = ref(database, 'wishlists');
      const wishlistsSnapshot = await get(wishlistsRef);
      
      if (!wishlistsSnapshot.exists()) {
        logAdminStatsOperation('get_wishlist_stats', adminUserId, { 
          result: 'no_wishlists_found' 
        });
        
        return NextResponse.json({
          success: true,
          stats: {
            totalUsers: 0,
            usersWithWishlists: 0,
            totalWishlistItems: 0,
            averageWishlistSize: 0,
            topWishlistedProperties: [],
            wishlistsByPriority: { low: 0, medium: 0, high: 0 },
            recentActivity: [],
            userEngagementMetrics: {
              mostActiveUsers: [],
              averageItemsPerUser: 0,
              engagementDistribution: { '1-5': 0, '6-10': 0, '11-20': 0, '20+': 0 }
            }
          },
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`,
            adminUserId
          }
        });
      }

      // Process wishlist data
      const wishlistData = wishlistsSnapshot.val();
      const userIds = Object.keys(wishlistData);
      const usersWithWishlists = userIds.length;
      
      let totalWishlistItems = 0;
      const propertyFrequency = new Map<string, number>();
      const priorityCount = { low: 0, medium: 0, high: 0 };
      const userWishlistSizes: number[] = [];
      const recentActivities: Array<{
        userId: string;
        propertyId: string;
        addedAt: string;
        priority: string;
      }> = [];
      
      // Analyze each user's wishlist
      for (const userId of userIds) {
        const userWishlist = wishlistData[userId];
        if (!userWishlist || typeof userWishlist !== 'object') continue;
        
        const wishlistItems = Object.values(userWishlist) as any[];
        const userWishlistSize = wishlistItems.length;
        userWishlistSizes.push(userWishlistSize);
        totalWishlistItems += userWishlistSize;
        
        for (const item of wishlistItems) {
          if (item && item.propertyId) {
            // Count property frequency
            const currentCount = propertyFrequency.get(item.propertyId) || 0;
            propertyFrequency.set(item.propertyId, currentCount + 1);
            
            // Count priority distribution
            const priority = (item.priority || 'medium') as 'low' | 'medium' | 'high';
            if (priority in priorityCount) {
              priorityCount[priority]++;
            }
            
            // Note: Real activity collection is now handled separately via ActivityLogger
          }
        }
      }
      
      // Calculate averages
      const averageWishlistSize = usersWithWishlists > 0 ? totalWishlistItems / usersWithWishlists : 0;
      
      // Get top wishlisted properties
      const topWishlistedProperties: Array<{
        propertyId: string;
        count: number;
        property?: any;
      }> = [];
      
      const sortedProperties = Array.from(propertyFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topPropertiesLimit);
      
      for (const [propertyId, count] of sortedProperties) {
        const property = await getPropertyDetails(propertyId);
        topWishlistedProperties.push({
          propertyId,
          count,
          property: property ? {
            title: property.title || property.project || `${property.category || 'Property'} in ${property.city || property.location}`,
            location: property.location || 'Unknown Location',
            price: property.price || property.rent || property.askingPrice || property.minInvestment || 0,
            type: property.category || property.propertyType || 'Property',
            imageUrl: property.image || (Array.isArray(property.images) ? property.images[0] : undefined)
          } : undefined
        });
      }
      
      // Calculate engagement distribution
      const engagementDistribution = { '1-5': 0, '6-10': 0, '11-20': 0, '20+': 0 };
      for (const size of userWishlistSizes) {
        if (size <= 5) engagementDistribution['1-5']++;
        else if (size <= 10) engagementDistribution['6-10']++;
        else if (size <= 20) engagementDistribution['11-20']++;
        else engagementDistribution['20+']++;
      }
      
      // Get most active users
      const userActivity = userIds.map(userId => ({
        userId,
        wishlistCount: userWishlistSizes[userIds.indexOf(userId)] || 0
      })).sort((a, b) => b.wishlistCount - a.wishlistCount).slice(0, 10);
      
      const mostActiveUsers = [];
      if (includeUserDetails) {
        for (const userStats of userActivity) {
          const userDetails = await getUserDetails(userStats.userId);
          mostActiveUsers.push({
            userId: userStats.userId,
            userName: userDetails?.name || 'Unknown User',
            userEmail: userDetails?.email || `user-${userStats.userId.substring(0, 8)}@system.local`,
            wishlistCount: userStats.wishlistCount
          });
        }
      } else {
        // Even without user details, try to get basic info for better UX
        for (const userStats of userActivity) {
          const userDetails = await getUserDetails(userStats.userId);
          mostActiveUsers.push({
            userId: userStats.userId,
            userName: userDetails?.name || `User ${userStats.userId.substring(0, 8)}`,
            userEmail: userDetails?.email || `user-${userStats.userId.substring(0, 8)}@system.local`,
            wishlistCount: userStats.wishlistCount
          });
        }
      }
      
      // Process real recent activity
      const processedRecentActivity = [];
      let allActivities = [];
      
      if (includeRecentActivity) {
        try {
          const activityLogger = ActivityLogger.getInstance();
          const globalActivities = await activityLogger.getGlobalActivities(200); // Get more for trend analysis
          allActivities = globalActivities;
          
          // Always get user details for better UX, regardless of includeUserDetails flag
          for (const activity of globalActivities.slice(0, recentActivityLimit)) {
            const userDetails = await getUserDetails(activity.userId);
            
            // Convert Firebase timestamp to ISO string if needed
            let timestamp = activity.timestamp;
            if (typeof timestamp === 'number') {
              timestamp = new Date(timestamp).toISOString();
            } else if (typeof timestamp === 'object' && timestamp !== null) {
              // Handle Firebase server timestamp object
              timestamp = new Date().toISOString(); // Fallback to current time
            }
            
            processedRecentActivity.push({
              userId: activity.userId,
              userName: userDetails?.name || `User ${activity.userId.substring(0, 8)}`,
              userEmail: userDetails?.email || `user-${activity.userId.substring(0, 8)}@system.local`,
              action: activity.action,
              propertyId: activity.propertyId,
              timestamp: timestamp
            });
          }
        } catch (activityError) {
          console.warn('[Admin Stats] Failed to get real activity data:', activityError);
          // Continue without recent activity data
        }
      }
      
      // Calculate activity trends and real-time metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Initialize trend data
      let totalActivitiesToday = 0;
      let addActionsToday = 0;
      let removeActionsToday = 0;
      let activeUsersLastHour = new Set();
      let propertiesAddedLastHour = 0;
      let propertiesRemovedLastHour = 0;
      
      const dailyActivityMap = new Map();
      const hourlyActivityMap = new Map();
      
      // Initialize hourly pattern (0-23 hours)
      for (let i = 0; i < 24; i++) {
        hourlyActivityMap.set(i, 0);
      }
      
      // Process all activities for trends
      for (const activity of allActivities) {
        if (!activity.timestamp) continue;
        
        const activityDate = new Date(typeof activity.timestamp === 'number' ? activity.timestamp : activity.timestamp);
        
        // Today's activity
        if (activityDate >= today) {
          totalActivitiesToday++;
          if (activity.action === 'add') addActionsToday++;
          if (activity.action === 'remove') removeActionsToday++;
        }
        
        // Last hour activity
        if (activityDate >= oneHourAgo) {
          activeUsersLastHour.add(activity.userId);
          if (activity.action === 'add') propertiesAddedLastHour++;
          if (activity.action === 'remove') propertiesRemovedLastHour++;
        }
        
        // Daily activity trend (last 7 days)
        const dayKey = activityDate.toISOString().split('T')[0];
        const dayCount = dailyActivityMap.get(dayKey) || { totalActivities: 0, adds: 0, removes: 0 };
        dayCount.totalActivities++;
        if (activity.action === 'add') dayCount.adds++;
        if (activity.action === 'remove') dayCount.removes++;
        dailyActivityMap.set(dayKey, dayCount);
        
        // Hourly pattern
        const hour = activityDate.getHours();
        hourlyActivityMap.set(hour, (hourlyActivityMap.get(hour) || 0) + 1);
      }
      
      // Create daily trend array (last 7 days)
      const dailyActivityTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayData = dailyActivityMap.get(dayKey) || { totalActivities: 0, adds: 0, removes: 0 };
        
        dailyActivityTrend.push({
          date: dayKey,
          totalActivities: dayData.totalActivities,
          adds: dayData.adds,
          removes: dayData.removes
        });
      }
      
      // Create hourly pattern array
      const hourlyPattern = Array.from(hourlyActivityMap.entries()).map(([hour, activities]) => ({
        hour,
        activities
      }));
      
      // Calculate property type and location trends
      const propertyTypeMap = new Map();
      const locationMap = new Map();
      
      for (const [propertyId, count] of propertyFrequency.entries()) {
        // Get property details for trend analysis
        try {
          const property = await getPropertyDetails(propertyId);
          if (property) {
            const type = property.category || property.propertyType || 'Unknown';
            const location = property.location || property.city || 'Unknown';
            
            propertyTypeMap.set(type, (propertyTypeMap.get(type) || 0) + count);
            locationMap.set(location, (locationMap.get(location) || 0) + count);
          }
        } catch (error) {
          // Skip if property details can't be fetched
        }
      }
      
      // Convert to arrays with percentages
      const totalPropertyWishlists = Array.from(propertyTypeMap.values()).reduce((a, b) => a + b, 0);
      const totalLocationWishlists = Array.from(locationMap.values()).reduce((a, b) => a + b, 0);
      
      const popularPropertyTypes = Array.from(propertyTypeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / totalPropertyWishlists) * 100)
        }));
      
      const locationTrends = Array.from(locationMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([location, count]) => ({
          location,
          count,
          percentage: Math.round((count / totalLocationWishlists) * 100)
        }));

      // Get total users count from Clerk
      let totalUsers = 0;
      try {
        const client = await clerkClient();
        totalUsers = await client.users.getCount();
      } catch (clerkError) {
        console.warn('[Admin Stats] Failed to get total users count from Clerk:', clerkError);
        totalUsers = usersWithWishlists; // Fallback to users with wishlists
      }
      
      const duration = Date.now() - startTime;
      
      const stats: WishlistStatsResponse = {
        totalUsers,
        usersWithWishlists,
        totalWishlistItems,
        averageWishlistSize: Math.round(averageWishlistSize * 100) / 100,
        topWishlistedProperties,
        wishlistsByPriority: priorityCount,
        recentActivity: processedRecentActivity,
        userEngagementMetrics: {
          mostActiveUsers,
          averageItemsPerUser: Math.round(averageWishlistSize * 100) / 100,
          engagementDistribution
        },
        activityTrends: {
          totalActivitiesToday,
          addActionsToday,
          removeActionsToday,
          dailyActivityTrend,
          hourlyPattern
        },
        realTimeMetrics: {
          activeUsersLastHour: activeUsersLastHour.size,
          propertiesAddedLastHour,
          propertiesRemovedLastHour,
          popularPropertyTypes,
          locationTrends
        }
      };
      
      logAdminStatsOperation('get_wishlist_stats', adminUserId, {
        totalUsers,
        usersWithWishlists,
        totalWishlistItems,
        topPropertiesCount: topWishlistedProperties.length,
        recentActivitiesCount: processedRecentActivity.length,
        duration: `${duration}ms`
      });
      
      return NextResponse.json({
        success: true,
        stats,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          adminUserId,
          queryParams: {
            includeRecentActivity,
            includeUserDetails,
            topPropertiesLimit,
            recentActivityLimit
          }
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };

      logAdminStatsOperation(
        'get_wishlist_stats',
        adminUserId,
        { duration: `${duration}ms` },
        error as Error
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve wishlist statistics',
          code: 'WISHLIST_STATS_FAILED',
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        },
        { status: 500 }
      );
    }
  });
}