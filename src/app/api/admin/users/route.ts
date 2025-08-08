import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { getUsers, getUserStatistics, searchUsers } from '@/lib/database/mock-users';
import { getActivityStatistics } from '@/lib/database/activity';

// GET /api/admin/users - Get all users with pagination and search
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      
      let users;
      let total;
      
      if (search) {
        // Search users by name or email
        const searchResults = await searchUsers(search, limit);
        users = searchResults;
        total = searchResults.length;
      } else {
        // Get paginated users
        const result = await getUsers(page, limit);
        users = result.users;
        total = result.total;
      }
      
      // Get user statistics
      const statistics = await getUserStatistics();
      
      // Get activity statistics
      const activityStats = await getActivityStatistics();
      
      // Transform users for admin view (remove sensitive data)
      const adminUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        // Add activity summary (this would come from activity tracking)
        totalViews: 0, // Placeholder - would be calculated from activity data
        wishlistCount: 0 // Placeholder - would be calculated from wishlist data
      }));
      
      return NextResponse.json({
        success: true,
        users: adminUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          ...statistics,
          ...activityStats
        }
      });
      
    } catch (error) {
      console.error('Get admin users error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get users'
        },
        { status: 500 }
      );
    }
  });
}