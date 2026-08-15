import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db } from '@/lib/firebase-server-admin';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';

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

import { WishlistActivity } from '@/lib/services/activityLogger';

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

const propertyCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

// Helper function to get property details with caching — uses Admin SDK
async function getPropertyDetails(propertyId: string): Promise<any> {
  const now = Date.now();

  if (propertyCache.has(propertyId)) {
    const timestamp = cacheTimestamps.get(propertyId) || 0;
    if (now - timestamp < CACHE_TTL) {
      return propertyCache.get(propertyId);
    } else {
      propertyCache.delete(propertyId);
      cacheTimestamps.delete(propertyId);
    }
  }

  try {
    const docSnap = await db.collection('properties').doc(propertyId).get();
    if (!docSnap.exists) {
      propertyCache.set(propertyId, null);
      cacheTimestamps.set(propertyId, now);
      return null;
    }
    const property = { ...docSnap.data(), id: docSnap.id } as any;
    propertyCache.set(propertyId, property);
    cacheTimestamps.set(propertyId, now);
    return property;
  } catch (error) {
    console.warn(`[Admin Stats] Failed to get property ${propertyId}:`, error);
    propertyCache.set(propertyId, null);
    cacheTimestamps.set(propertyId, now);
    return null;
  }
}

async function getUserDetails(userId: string): Promise<{ id: string; name: string; email: string }> {
  try {
    const user = await FirebaseAdminUserService.getUser(userId);

    let userName = 'Unknown User';
    if (user.displayName) {
      userName = user.displayName;
    } else if (user.email) {
      userName = user.email.split('@')[0];
    }

    return {
      id: user.id,
      name: userName,
      email: user.email || 'No email'
    };
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      console.log(`[Admin Stats] User ${userId} not found in Firebase (likely deleted)`);
      return {
        id: userId,
        name: 'Deleted User',
        email: 'Account removed'
      };
    }

    console.error(`[Admin Stats] Unexpected error getting user ${userId}:`, error?.message || error);
    return {
      id: userId,
      name: 'Unknown User',
      email: 'Unable to fetch'
    };
  }
}




// GET /api/admin/wishlist-stats — uses Firebase Admin SDK (bypasses security rules)
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    const startTime = Date.now();
    const adminUserId = authenticatedRequest.user.userId;

    try {
      logAdminStatsOperation('get_wishlist_stats', adminUserId, { startRequest: true });

      const { searchParams } = new URL(request.url);
      const includeRecentActivity = searchParams.get('includeActivity') !== 'false';
      const includeUserDetails = searchParams.get('includeUserDetails') !== 'false';
      const topPropertiesLimit = Math.min(parseInt(searchParams.get('topLimit') || '10'), 50);
      const recentActivityLimit = Math.min(parseInt(searchParams.get('activityLimit') || '20'), 100);

      // Read all wishlists from Firestore using Admin SDK
      // NOTE: In Firestore, subcollections exist independently of parent documents.
      // adminAddToWishlist writes to wishlists/{userId}/items/{docId} but does NOT
      // create the parent wishlists/{userId} document. So we get user IDs from
      // Firebase Auth instead of listing the wishlists collection.
      let userIds: string[] = [];
      try {
        const { auth } = await import('@/lib/firebase-server-admin');
        const listUsersResult = await auth.listUsers(1000);
        userIds = listUsersResult.users.map(u => u.uid);
      } catch (authError) {
        console.warn('[Admin Stats] Failed to list users from Firebase Auth:', authError);
      }

      if (userIds.length === 0) {
        // No users found in Firebase Auth

        logAdminStatsOperation('get_wishlist_stats', adminUserId, {
          result: 'no_users_found',
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
            },
            activityTrends: {
              totalActivitiesToday: 0,
              addActionsToday: 0,
              removeActionsToday: 0,
              dailyActivityTrend: [],
              hourlyPattern: []
            },
            realTimeMetrics: {
              activeUsersLastHour: 0,
              propertiesAddedLastHour: 0,
              propertiesRemovedLastHour: 0,
              popularPropertyTypes: [],
              locationTrends: []
            }
          },
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`,
            adminUserId,
            dataSources: { firestore: userIds.length }
          }
        });
      }


      let totalWishlistItems = 0;
      const propertyFrequency = new Map<string, number>();
      const priorityCount = { low: 0, medium: 0, high: 0 };
      const userWishlistSizes: number[] = [];

      // ── Read all users' wishlist items (Firestore-only) ──
      const userItemsResults = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const itemsCol = db.collection('wishlists').doc(userId).collection('items');
            const itemsSnap = await itemsCol.get();
            const items: any[] = [];
            itemsSnap.forEach(doc => items.push(doc.data()));
            return items;
          } catch {
            return [];
          }
        })
      );

      for (let i = 0; i < userIds.length; i++) {
        const wishlistItems = userItemsResults[i];
        const userWishlistSize = wishlistItems.length;
        userWishlistSizes.push(userWishlistSize);
        totalWishlistItems += userWishlistSize;

        for (const item of wishlistItems) {
          if (item && item.propertyId) {
            const currentCount = propertyFrequency.get(item.propertyId) || 0;
            propertyFrequency.set(item.propertyId, currentCount + 1);

            const priority = (item.priority || 'medium') as 'low' | 'medium' | 'high';
            if (priority in priorityCount) {
              priorityCount[priority]++;
            }
          }
        }
      }

      const usersWithWishlists = userIds.length;
      const averageWishlistSize = usersWithWishlists > 0 ? totalWishlistItems / usersWithWishlists : 0;

      // Get top wishlisted properties
      const sortedProperties = Array.from(propertyFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topPropertiesLimit);

      const propertyDetailsPromises = sortedProperties.map(([propertyId]) =>
        getPropertyDetails(propertyId).catch(() => null)
      );
      const propertyDetailsResults = await Promise.all(propertyDetailsPromises);

      const topWishlistedProperties = sortedProperties.map(([propertyId, count], index) => {
        const property = propertyDetailsResults[index];
        return {
          propertyId,
          count,
          property: property ? {
            title: property.title || property.project || `${property.category || 'Property'} in ${property.city || property.location}`,
            location: property.location || 'Unknown Location',
            price: property.price || property.rent || property.askingPrice || property.minInvestment || 0,
            type: property.category || property.propertyType || 'Property',
            imageUrl: property.image || (Array.isArray(property.images) ? property.images[0] : undefined)
          } : undefined
        };
      });

      const engagementDistribution = { '1-5': 0, '6-10': 0, '11-20': 0, '20+': 0 };
      for (const size of userWishlistSizes) {
        if (size <= 5) engagementDistribution['1-5']++;
        else if (size <= 10) engagementDistribution['6-10']++;
        else if (size <= 20) engagementDistribution['11-20']++;
        else engagementDistribution['20+']++;
      }

      const userActivity = userIds.map(userId => ({
        userId,
        wishlistCount: userWishlistSizes[userIds.indexOf(userId)] || 0
      })).sort((a, b) => b.wishlistCount - a.wishlistCount).slice(0, 10);

      const userDetailsPromises = userActivity.map(userStats =>
        getUserDetails(userStats.userId).catch(() => ({
          id: userStats.userId,
          name: `User ${userStats.userId.substring(0, 8)}`,
          email: `user-${userStats.userId.substring(0, 8)}@system.local`
        }))
      );
      const userDetailsResults = await Promise.all(userDetailsPromises);

      const mostActiveUsers = userActivity.map((userStats, index) => {
        const userDetails = userDetailsResults[index];
        return {
          userId: userStats.userId,
          userName: userDetails?.name || `User ${userStats.userId.substring(0, 8)}`,
          userEmail: userDetails?.email || `user-${userStats.userId.substring(0, 8)}@system.local`,
          wishlistCount: userStats.wishlistCount
        };
      });

      // Process recent activity
      const processedRecentActivity: Array<{
        userId: string;
        userName?: string;
        userEmail?: string;
        action: 'add' | 'remove';
        propertyId: string;
        timestamp: string;
      }> = [];
      let allActivities: WishlistActivity[] = [];

      if (includeRecentActivity) {
        try {
          // Use Admin SDK directly — ActivityLogger uses client SDK which is subject to
          // security rules (globalActivities: read requires auth, write is Admin SDK only).
          // On the server there is no client auth context, so client SDK reads fail.
          const globalActivitiesSnap = await db
            .collection('globalActivities')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

          const globalActivities: WishlistActivity[] = globalActivitiesSnap.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId: data.userId,
              action: data.action,
              propertyId: data.propertyId,
              timestamp: data.timestamp,
              metadata: data.metadata,
            } as WishlistActivity;
          });
          allActivities = globalActivities;

          const recentActivityData = globalActivities
            .filter(activity => activity.action === 'add' || activity.action === 'remove')
            .slice(0, recentActivityLimit);

          const uniqueUserIds = [...new Set(recentActivityData.map(activity => activity.userId))];

          const userDetailsPromises = uniqueUserIds.map(userId =>
            getUserDetails(userId).catch(() => ({
              id: userId,
              name: `User ${userId.substring(0, 8)}`,
              email: `user-${userId.substring(0, 8)}@system.local`
            }))
          );
          const userDetailsMap = new Map();
          const userDetailsResults = await Promise.all(userDetailsPromises);
          uniqueUserIds.forEach((userId, index) => {
            userDetailsMap.set(userId, userDetailsResults[index]);
          });

          for (const activity of recentActivityData) {
            const userDetails = userDetailsMap.get(activity.userId);

            let timestamp: string;
            if (typeof activity.timestamp === 'number') {
              timestamp = new Date(activity.timestamp).toISOString();
            } else if (activity.timestamp && typeof activity.timestamp.toMillis === 'function') {
              // Firestore Timestamp object
              timestamp = new Date(activity.timestamp.toMillis()).toISOString();
            } else if (activity.timestamp && typeof activity.timestamp.seconds === 'number') {
              // Firestore Timestamp as plain object { seconds, nanoseconds }
              timestamp = new Date(activity.timestamp.seconds * 1000).toISOString();
            } else {
              timestamp = new Date().toISOString();
            }

            processedRecentActivity.push({
              userId: activity.userId,
              userName: userDetails?.name || `User ${activity.userId.substring(0, 8)}`,
              userEmail: userDetails?.email || `user-${activity.userId.substring(0, 8)}@system.local`,
              action: activity.action as 'add' | 'remove',
              propertyId: activity.propertyId,
              timestamp: timestamp
            });
          }
        } catch (activityError) {
          console.warn('[Admin Stats] Failed to get real activity data:', activityError);
        }
      }

      // Activity trends
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      let totalActivitiesToday = 0;
      let addActionsToday = 0;
      let removeActionsToday = 0;
      let activeUsersLastHour = new Set();
      let propertiesAddedLastHour = 0;
      let propertiesRemovedLastHour = 0;

      const dailyActivityMap = new Map();
      const hourlyActivityMap = new Map();

      for (let i = 0; i < 24; i++) {
        hourlyActivityMap.set(i, 0);
      }

      for (const activity of allActivities) {
        if (!activity.timestamp) continue;

        const activityDate = (() => {
          const ts = activity.timestamp;
          if (typeof ts === 'number') return new Date(ts);
          if (ts && typeof ts.toMillis === 'function') return new Date(ts.toMillis()); // Firestore Timestamp
          if (ts && typeof ts.seconds === 'number') return new Date(ts.seconds * 1000); // plain {seconds, nanoseconds}
          return new Date(ts as any);
        })();

        if (activityDate >= today) {
          totalActivitiesToday++;
          if (activity.action === 'add') addActionsToday++;
          if (activity.action === 'remove') removeActionsToday++;
        }

        if (activityDate >= oneHourAgo) {
          activeUsersLastHour.add(activity.userId);
          if (activity.action === 'add') propertiesAddedLastHour++;
          if (activity.action === 'remove') propertiesRemovedLastHour++;
        }

        const dayKey = activityDate.toISOString().split('T')[0];
        const dayCount = dailyActivityMap.get(dayKey) || { totalActivities: 0, adds: 0, removes: 0 };
        dayCount.totalActivities++;
        if (activity.action === 'add') dayCount.adds++;
        if (activity.action === 'remove') dayCount.removes++;
        dailyActivityMap.set(dayKey, dayCount);

        const hour = activityDate.getHours();
        hourlyActivityMap.set(hour, (hourlyActivityMap.get(hour) || 0) + 1);
      }

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

      const hourlyPattern = Array.from(hourlyActivityMap.entries()).map(([hour, activities]) => ({
        hour,
        activities
      }));

      const propertyTypeMap = new Map();
      const locationMap = new Map();

      const propertyDetailsCache = new Map();
      topWishlistedProperties.forEach(item => {
        if (item.property) {
          propertyDetailsCache.set(item.propertyId, item.property);
        }
      });

      const remainingPropertyIds = Array.from(propertyFrequency.keys())
        .filter(propertyId => !propertyDetailsCache.has(propertyId));

      if (remainingPropertyIds.length > 0) {
        const remainingPropertyPromises = remainingPropertyIds.map(propertyId =>
          getPropertyDetails(propertyId).catch(() => null)
        );
        const remainingPropertyResults = await Promise.all(remainingPropertyPromises);

        remainingPropertyIds.forEach((propertyId, index) => {
          const property = remainingPropertyResults[index];
          if (property) {
            propertyDetailsCache.set(propertyId, {
              title: property.title || property.project || `${property.category || 'Property'} in ${property.city || property.location}`,
              location: property.location || property.city || 'Unknown',
              type: property.category || property.propertyType || 'Unknown'
            });
          }
        });
      }

      for (const [propertyId, count] of propertyFrequency.entries()) {
        const property = propertyDetailsCache.get(propertyId);
        if (property) {
          const type = property.type || 'Unknown';
          const location = property.location || 'Unknown';

          propertyTypeMap.set(type, (propertyTypeMap.get(type) || 0) + count);
          locationMap.set(location, (locationMap.get(location) || 0) + count);
        }
      }

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

      // Total users from the already-fetched Auth list
      const totalUsers = userIds.length;

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
          dataSources: {
            firestore: userIds.length,
          },
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

      console.error('[Admin Stats API] ❌ Request failed:', {
        error: errorDetails,
        duration: `${duration}ms`,
        adminUserId,
      });

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

