import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { clerkClient } from '@clerk/nextjs/server';

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
    action: 'add' | 'remove';
    propertyId: string;
    timestamp: string;
  }>;
  userEngagementMetrics: {
    mostActiveUsers: Array<{
      userId: string;
      userName?: string;
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
    return {
      id: user.id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username || user.primaryEmailAddress?.emailAddress || 'Unknown User',
      email: user.primaryEmailAddress?.emailAddress || undefined
    };
  } catch (error) {
    console.warn(`[Admin Stats] Failed to get user details for ${userId}:`, error);
    return null;
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
            
            // Collect recent activity
            if (includeRecentActivity && item.addedAt) {
              recentActivities.push({
                userId,
                propertyId: item.propertyId,
                addedAt: item.addedAt,
                priority
              });
            }
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
            wishlistCount: userStats.wishlistCount
          });
        }
      } else {
        mostActiveUsers.push(...userActivity.map(u => ({
          userId: u.userId,
          wishlistCount: u.wishlistCount
        })));
      }
      
      // Process recent activity
      const processedRecentActivity = [];
      if (includeRecentActivity) {
        const sortedActivities = recentActivities
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, recentActivityLimit);
          
        if (includeUserDetails) {
          for (const activity of sortedActivities) {
            const userDetails = await getUserDetails(activity.userId);
            processedRecentActivity.push({
              userId: activity.userId,
              userName: userDetails?.name,
              action: 'add' as const,
              propertyId: activity.propertyId,
              timestamp: activity.addedAt
            });
          }
        } else {
          processedRecentActivity.push(...sortedActivities.map(a => ({
            userId: a.userId,
            action: 'add' as const,
            propertyId: a.propertyId,
            timestamp: a.addedAt
          })));
        }
      }
      
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