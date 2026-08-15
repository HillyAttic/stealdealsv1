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
        console.log('[Admin Users API] Returning cached result');
        return NextResponse.json(cachedResult);
      }

      console.log('[Admin Users API] Fetching users from Firebase Auth');
      
      // Fetch users from Firebase Auth
      let firebaseUsers;
      try {
        const result = await FirebaseAdminUserService.listUsers({ limit: 1000 });
        firebaseUsers = result.users;
        console.log(`[Admin Users API] Fetched ${firebaseUsers.length} users from Firebase Auth`);
      } catch (firebaseError) {
        console.error('[Admin Users API] Firebase Auth error:', firebaseError);
        throw new Error(`Firebase Authentication failed: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
      }

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
      // NOTE: In Firestore, subcollections can exist without parent documents.
      // adminAddToWishlist writes to wishlists/{userId}/items/{docId} but does NOT
      // create the parent wishlists/{userId} document. So we must query each user's
      // items subcollection directly, without checking for parent doc existence.
      let wishlistCounts: Record<string, number> = {};
      try {
        const { db } = await import('@/lib/firebase-server-admin');
        const displayedUserIds = paginatedUsers.map(u => u.id);

        // Directly query each user's items subcollection (no parent doc check needed)
        const itemReads = displayedUserIds.map(userId =>
          db.collection('wishlists').doc(userId).collection('items').get()
        );

        const itemSnapshots = await Promise.all(itemReads);

        displayedUserIds.forEach((userId, index) => {
          wishlistCounts[userId] = itemSnapshots[index]?.size || 0;
        });
      } catch (wishlistError) {
        console.warn('[Admin Users API] Failed to fetch wishlist counts:', wishlistError);
      }

      // Transform user data for admin dashboard - use batched reads
      const { db } = await import('@/lib/firebase-server-admin');

      // Batch fetch all user documents from Firestore using getAll()
      const userDocRefs = paginatedUsers.map(u =>
        db.collection('users').doc(u.id)
      );
      const firestoreUserDocs = await db.getAll(...userDocRefs);

      // Create a map for quick lookup
      const firestoreUsersMap = new Map<string, any>();
      firestoreUserDocs.forEach(doc => {
        if (doc.exists) {
          firestoreUsersMap.set(doc.id, doc.data());
        }
      });

      const transformedUsers = paginatedUsers.map((u) => {
        const firestoreUser = firestoreUsersMap.get(u.id);

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
      });

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
      
      let errorMessage = 'Failed to fetch users';
      let errorDetails = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages
      if (errorDetails.includes('Admin SDK')) {
        errorMessage = 'Firebase Admin SDK not initialized. Please check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.';
      } else if (errorDetails.includes('Authentication')) {
        errorMessage = 'Firebase Authentication error. Please verify your Firebase configuration.';
      } else if (errorDetails.includes('permission')) {
        errorMessage = 'Permission denied. Please check Firebase service account permissions.';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  });
}
