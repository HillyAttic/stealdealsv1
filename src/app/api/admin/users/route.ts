import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/users - Get all Clerk users for admin dashboard
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
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
      console.error('Get Clerk users error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch users from Clerk',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}