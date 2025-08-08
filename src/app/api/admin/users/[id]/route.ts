import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { getUserById } from '@/lib/database/mock-users';
import { getUserActivity, getUserAnalytics } from '@/lib/database/activity';
import { getUserWishlist } from '@/lib/database/wishlist';

// GET /api/admin/users/[id] - Get detailed user information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const userId = params.id;
      
      // Get user profile
      const user = await getUserById(userId);
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found'
          },
          { status: 404 }
        );
      }
      
      // Get user activity
      const activity = await getUserActivity(userId, 100); // Get more activity for admin view
      
      // Get user analytics
      const analytics = await getUserAnalytics(userId);
      
      // Get user wishlist
      const wishlist = await getUserWishlist(userId);
      
      // Remove sensitive data from user object
      const adminUserView = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        provider: user.provider,
        providerId: user.providerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        preferences: user.preferences
      };
      
      return NextResponse.json({
        success: true,
        user: adminUserView,
        activity,
        analytics,
        wishlist,
        // Additional data for admin view
        viewHistory: activity.filter(a => a.type === 'property_view').map(a => ({
          propertyId: a.propertyId,
          propertyTitle: a.metadata?.propertyTitle || 'Unknown Property',
          viewedAt: a.timestamp,
          duration: a.metadata?.duration || 0,
          source: a.metadata?.source || 'direct'
        })),
        searchHistory: activity.filter(a => a.type === 'search').map(a => ({
          id: a.id,
          query: a.metadata?.query || '',
          filters: a.metadata?.filters || {},
          timestamp: a.timestamp,
          resultsCount: a.metadata?.resultsCount || 0
        })),
        engagementMetrics: {
          totalSessions: analytics.totalViews > 0 ? Math.ceil(analytics.totalViews / 5) : 0, // Estimate sessions
          averageSessionDuration: analytics.averageSessionDuration,
          pagesPerSession: analytics.totalViews > 0 ? analytics.totalViews / Math.max(1, Math.ceil(analytics.totalViews / 5)) : 0,
          bounceRate: analytics.totalViews > 0 ? Math.max(0, 1 - (analytics.uniqueProperties / analytics.totalViews)) : 0
        }
      });
      
    } catch (error) {
      console.error('Get admin user details error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get user details'
        },
        { status: 500 }
      );
    }
  });
}

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const userId = params.id;
      const body = await request.json();
      
      // Get current user
      const user = await getUserById(userId);
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found'
          },
          { status: 404 }
        );
      }
      
      // Only allow certain fields to be updated by admin
      const allowedUpdates = {
        isActive: body.isActive,
        emailVerified: body.emailVerified,
        role: body.role
      };
      
      // Filter out undefined values
      const updates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );
      
      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No valid updates provided'
          },
          { status: 400 }
        );
      }
      
      // Update user (this would use a real database update in production)
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      
      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          emailVerified: updatedUser.emailVerified,
          provider: updatedUser.provider,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          lastLoginAt: updatedUser.lastLoginAt
        }
      });
      
    } catch (error) {
      console.error('Update admin user error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update user'
        },
        { status: 500 }
      );
    }
  });
}