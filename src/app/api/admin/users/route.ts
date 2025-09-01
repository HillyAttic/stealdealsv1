import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/users - Get all Clerk users for admin dashboard
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      // Validate Clerk configuration first
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
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
      
      console.log(`[Admin Users API] Fetching users from Clerk: page=${page}, limit=${limit}, search='${search}'`);
      
      // Fetch users from Clerk with search and pagination
      const client = await clerkClient();
      const usersResponse = await client.users.getUserList({
        limit,
        offset,
        ...(search && { query: search })
      });
      
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
        // Real-time activity data (placeholder - you can enhance this)
        totalViews: 0, // You can implement activity tracking later
        wishlistCount: 0 // You can fetch from your wishlist system
      }));
      
      // Get total count for pagination
      const totalUsersResponse = await client.users.getCount();
      
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