import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
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

      // Get user activities
      const activities = await getUserActivity(targetUserId, 200);
      
      // Analyze behavior patterns
      const viewActivities = activities.filter(a => a.type === 'property_view');
      const searchActivities = activities.filter(a => a.type === 'search');
      const wishlistActivities = activities.filter(a => a.type === 'wishlist_add' || a.type === 'wishlist_remove');
      
      // Calculate most active hours
      const hourCounts = new Array(24).fill(0);
      activities.forEach(activity => {
        const hour = activity.timestamp.getHours();
        hourCounts[hour]++;
      });
      const mostActiveHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      // Calculate preferred property types
      const propertyTypes: { [key: string]: number } = {};
      viewActivities.forEach(activity => {
        const type = activity.metadata?.propertyType || 'unknown';
        propertyTypes[type] = (propertyTypes[type] || 0) + 1;
      });
      const preferredPropertyTypes = Object.entries(propertyTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);

      const analytics = {
        viewingPatterns: {
          mostActiveHours,
          preferredPropertyTypes,
          averageViewDuration: viewActivities.reduce((sum, a) => sum + (a.metadata?.duration || 0), 0) / Math.max(1, viewActivities.length)
        },
        engagementMetrics: {
          clickThroughRate: viewActivities.length > 0 ? (wishlistActivities.length / viewActivities.length) * 100 : 0,
          wishlistConversionRate: viewActivities.length > 0 ? (wishlistActivities.filter(a => a.type === 'wishlist_add').length / viewActivities.length) * 100 : 0,
          returnVisitRate: 0 // Would need session tracking
        },
        recentBehavior: {
          lastSeen: activities.length > 0 ? activities[0].timestamp.toISOString() : null,
          currentSession: {
            startTime: activities.length > 0 ? activities[activities.length - 1].timestamp.toISOString() : null,
            pageViews: activities.length,
            propertiesViewed: new Set(viewActivities.map(a => a.propertyId).filter(Boolean)).size
          }
        }
      };

      return NextResponse.json({
        success: true,
        analytics
      });

    } catch (error) {
      console.error('Error in user-behavior-analytics API:', error);
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