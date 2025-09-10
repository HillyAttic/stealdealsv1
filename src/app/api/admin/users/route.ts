import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/users - Get all Clerk users for admin dashboard
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      // Debug logging for environment and configuration
      console.log('[Admin Users API] 🚀 Starting request processing');
      console.log('[Admin Users API] Environment:', process.env.NODE_ENV);
      console.log('[Admin Users API] Admin user:', authenticatedRequest.user.email);
      
      // Validate Clerk configuration first
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
      // Enhanced debug logging for Clerk configuration
      console.log('[Admin Users API] 🔑 Clerk config check:');
      console.log(`[Admin Users API] - Secret key exists: ${!!clerkSecretKey}`);
      console.log(`[Admin Users API] - Secret key format: ${clerkSecretKey ? clerkSecretKey.substring(0, 15) + '...' : 'MISSING'}`);
      console.log(`[Admin Users API] - Publishable key exists: ${!!clerkPublishableKey}`);
      console.log(`[Admin Users API] - Publishable key format: ${clerkPublishableKey ? clerkPublishableKey.substring(0, 15) + '...' : 'MISSING'}`);
      
      if (!clerkSecretKey || clerkSecretKey.includes('YOUR_CLERK_SECRET_KEY_HERE')) {
        console.error('[Admin Users API] Missing or invalid CLERK_SECRET_KEY in production environment');
        return NextResponse.json(
          { 
            success: false,
            error: 'Clerk configuration error',
            details: 'CLERK_SECRET_KEY is missing or not configured properly. Please set the correct production Clerk secret key in your environment variables.',
            configRequired: {
              CLERK_SECRET_KEY: 'Required: sk_live_... (from Clerk Dashboard > API Keys)',
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'Required: pk_live_... (from Clerk Dashboard > API Keys)'
            }
          },
          { status: 500 }
        );
      }
      
      if (!clerkPublishableKey || clerkPublishableKey.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE')) {
        console.error('[Admin Users API] Missing or invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
        return NextResponse.json(
          { 
            success: false,
            error: 'Clerk configuration error',
            details: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing or not configured properly.'
          },
          { status: 500 }
        );
      }
      
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      console.log(`[Admin Users API] 📋 Fetching users from Clerk: page=${page}, limit=${limit}, search='${search}'`);
      console.log('[Admin Users API] 🔄 Calling clerkClient.users.getUserList...');
      
      // Enhanced debug logging for production troubleshooting
      console.log('[Admin Users API] 🚨 PRODUCTION DEBUG:');
      console.log(`[Admin Users API] - Current domain: ${process.env.NEXT_PUBLIC_APP_URL}`);
      console.log(`[Admin Users API] - Clerk instance type: ${typeof clerkClient}`);
      console.log(`[Admin Users API] - Clerk users method exists: ${typeof clerkClient.users?.getUserList}`);
      console.log(`[Admin Users API] - Request parameters:`, { limit, offset, search: search || 'none' });
      
      // Fetch users from Clerk with search and pagination
      console.log('[Admin Users API] 🔥 About to call Clerk API...');
      const usersResponse = await clerkClient.users.getUserList({
        limit,
        offset,
        ...(search && { query: search })
      });
      
      console.log(`[Admin Users API] ✅ Clerk API response received successfully`);
      console.log(`[Admin Users API] - Response type: ${typeof usersResponse}`);
      console.log(`[Admin Users API] - Users count: ${usersResponse.data?.length || 0}`);
      console.log(`[Admin Users API] - Response structure:`, Object.keys(usersResponse || {}));
      
      // Get wishlist counts for all users
      console.log(`[Admin Users API] Fetching wishlist counts for ${usersResponse.data.length} users`);
      let wishlistCounts: Record<string, number> = {};
      
      try {
        const { database } = await import('@/lib/firebase');
        const { ref, get } = await import('firebase/database');
        const wishlistsRef = ref(database, 'wishlists');
        const wishlistsSnapshot = await get(wishlistsRef);
        
        if (wishlistsSnapshot.exists()) {
          const wishlistData = wishlistsSnapshot.val();
          // Count wishlist items for each user
          Object.keys(wishlistData).forEach(userId => {
            const userWishlist = wishlistData[userId];
            if (userWishlist && typeof userWishlist === 'object') {
              wishlistCounts[userId] = Object.keys(userWishlist).length;
            }
          });
        }
      } catch (wishlistError) {
        console.warn('[Admin Users API] Failed to fetch wishlist counts:', wishlistError);
        // Continue without wishlist counts
      }

      // Transform Clerk user data for admin dashboard
      const transformedUsers = usersResponse.data.map(user => ({
        id: user.id,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.username || user.primaryEmailAddress?.emailAddress || 'Unknown User',
        email: user.primaryEmailAddress?.emailAddress || 'No email',
        role: user.publicMetadata?.role || 'user',
        isActive: !user.banned && !user.locked,
        emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        provider: user.externalAccounts?.[0]?.provider || 'email',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        lastLoginAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
        lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
        imageUrl: user.imageUrl,
        phoneNumber: user.primaryPhoneNumber?.phoneNumber || null,
        banned: user.banned,
        locked: user.locked,
        // Additional Clerk-specific data
        hasImage: !!user.hasImage,
        twoFactorEnabled: user.twoFactorEnabled,
        backupCodeEnabled: user.backupCodeEnabled,
        totpEnabled: user.totpEnabled,
        externalAccounts: user.externalAccounts.map(account => ({
          provider: account.provider,
          emailAddress: account.emailAddress
        })),
        // Real-time activity data and wishlist count
        totalViews: 0, // You can implement activity tracking later
        wishlistCount: wishlistCounts[user.id] || 0,
        lastWishlistActivity: null // Could be enhanced to track last wishlist action
      }));
      
      // Get total count for pagination
      const totalUsersResponse = await clerkClient.users.getCount();
      
      // Calculate statistics
      const totalUsers = totalUsersResponse;
      const activeUsers = transformedUsers.filter(user => user.isActive).length;
      const verifiedUsers = transformedUsers.filter(user => user.emailVerified).length;
      const newUsersThisMonth = transformedUsers.filter(user => {
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return createdDate >= firstDayOfMonth;
      }).length;
      
      // Provider statistics
      const providerStats = transformedUsers.reduce((acc, user) => {
        acc[user.provider] = (acc[user.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return NextResponse.json({
        success: true,
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        },
        statistics: {
          totalUsers,
          activeUsers,
          verifiedUsers: verifiedUsers,
          newUsersThisMonth,
          totalActivities: 0, // Placeholder for activity tracking
          activitiesByType: {}, // Placeholder for activity breakdown
          providerStats,
          // Additional real-time stats
          bannedUsers: transformedUsers.filter(user => user.banned).length,
          lockedUsers: transformedUsers.filter(user => user.locked).length,
          users2FAEnabled: transformedUsers.filter(user => user.twoFactorEnabled).length
        }
      });
      
    } catch (error) {
      console.error('[Admin Users API] Get Clerk users error:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = 'Failed to fetch users from Clerk';
      let errorDetails = error instanceof Error ? error.message : 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key') || error.message.includes('authentication')) {
          errorMessage = 'Clerk authentication failed';
          errorDetails = 'Invalid Clerk API key. Please verify your CLERK_SECRET_KEY is correct and active.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error connecting to Clerk';
          errorDetails = 'Unable to connect to Clerk API. Please check your network connection and Clerk service status.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Clerk API rate limit exceeded';
          errorDetails = 'Too many requests to Clerk API. Please try again later.';
        }
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  });
}