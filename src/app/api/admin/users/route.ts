import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';
import { getUserById } from '@/lib/database/firestore-users';

// Simple cache for user data (5 minutes TTL)
const userCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(page: number, limit: number, search: string): string {
  return `users_${page}_${limit}_${search}`;
}

function getCachedData(key: string) {
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  userCache.set(key, { data, timestamp: Date.now() });
  if (userCache.size > 10) {
    const oldestKey = userCache.keys().next().value;
    if (oldestKey) userCache.delete(oldestKey);
  }
}

// GET /api/admin/users - Get all Firebase users for admin dashboard
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      console.log('[Admin Users API] Processing request');

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';

      // Check cache first
      const cacheKey = getCacheKey(page, limit, search);
      const cachedResult = getCachedData(cacheKey);
      if (cachedResult) {
        return NextResponse.json(cachedResult);
      }

      // Fetch users from Firebase Auth
      const { users: firebaseUsers } = await FirebaseAdminUserService.listUsers({ limit: 1000 });

      // Apply search filter if provided
      let filteredUsers = firebaseUsers;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = firebaseUsers.filter(u => 
          (u.email && u.email.toLowerCase().includes(searchLower)) ||
          (u.displayName && u.displayName.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);

      // Get wishlist counts for displayed users
      let wishlistCounts: Record<string, number> = {};
      try {
        const { db } = await import('@/lib/firebase-server-admin');
        const displayedUserIds = paginatedUsers.map(u => u.id);
        const counts = await Promise.all(
          displayedUserIds.map(async (userId) => {
            try {
              const snapshot = await db.collection('wishlists').doc(userId).collection('items').get();
              return { userId, count: snapshot.size };
            } catch {
              return { userId, count: 0 };
            }
          })
        );
        for (const { userId, count } of counts) {
          wishlistCounts[userId] = count;
        }
      } catch (wishlistError) {
        console.warn('[Admin Users API] Failed to fetch wishlist counts:', wishlistError);
      }

      // Transform user data for admin dashboard
      const transformedUsers = await Promise.all(
        paginatedUsers.map(async (u) => {
          // Try to get additional user data from Firestore
          let firestoreUser = null;
          try {
            firestoreUser = await getUserById(u.id);
          } catch {}

          return {
            id: u.id,
            name: u.displayName || u.email?.split('@')[0] || firestoreUser?.name || 'Unknown User',
            email: u.email || 'No email',
            role: firestoreUser?.role || 'user',
            isActive: !u.disabled,
            emailVerified: u.emailVerified,
            provider: u.provider === 'google.com' ? 'google' : 'email',
            createdAt: u.createdAt || new Date().toISOString(),
            lastLoginAt: u.lastSignInAt || null,
            lastActiveAt: null,
            imageUrl: u.photoURL,
            phoneNumber: null,
            banned: u.disabled || false,
            locked: false,
            hasImage: !!u.photoURL,
            twoFactorEnabled: false,
            backupCodeEnabled: false,
            totpEnabled: false,
            externalAccounts: u.provider === 'google.com' ? [{ provider: 'google', emailAddress: u.email }] : [],
            totalViews: 0,
            wishlistCount: wishlistCounts[u.id] || 0,
            lastWishlistActivity: null,
          };
        })
      );

      const totalUsers = filteredUsers.length;
      const activeUsers = transformedUsers.filter(u => u.isActive).length;
      const verifiedUsers = transformedUsers.filter(u => u.emailVerified).length;
      const newUsersThisMonth = transformedUsers.filter(u => {
        const createdDate = new Date(u.createdAt);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return createdDate >= firstDayOfMonth;
      }).length;

      const providerStats = transformedUsers.reduce((acc: Record<string, number>, user) => {
        acc[user.provider] = (acc[user.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const result = {
        success: true,
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
        statistics: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          newUsersThisMonth,
          totalActivities: 0,
          activitiesByType: {},
          providerStats,
          bannedUsers: transformedUsers.filter(u => u.banned).length,
          lockedUsers: 0,
          users2FAEnabled: 0,
        },
      };

      setCachedData(cacheKey, result);
      return NextResponse.json(result);
    } catch (error) {
      console.error('[Admin Users API] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch users',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  });
}
