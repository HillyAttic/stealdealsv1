import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { getRawWishlistItems } from '@/lib/database/wishlist';
import { getUserActivity } from '@/lib/database/user-activity';

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {

      const { searchParams } = new URL(request.url);
      const targetUserId = searchParams.get('userId');

      if (!targetUserId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Get recent activities
      const activities = await getUserActivity(targetUserId, 100);
      const wishlistItems = await getRawWishlistItems(targetUserId);
      
      // Calculate real-time stats
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentActivities = activities.filter(a => a.timestamp > oneHourAgo);
      const todayActivities = activities.filter(a => a.timestamp > oneDayAgo);
      
      const stats = {
        totalViews: activities.filter(a => a.type === 'property_view').length,
        totalWishlistItems: wishlistItems.length,
        totalActivities: activities.length,
        lastActivity: activities.length > 0 ? activities[0].timestamp.toISOString() : null,
        engagementScore: Math.min(100, Math.round((recentActivities.length / Math.max(1, todayActivities.length)) * 100)),
        sessionDuration: 0, // Would need session tracking
        isOnline: recentActivities.length > 0 // User is "online" if they had activity in the last hour
      };

      return NextResponse.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error in user-realtime-stats API:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Internal server error' 
        },
        { status: 500 }
      );
    }
  });
}