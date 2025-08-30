import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getActivityAggregation, getActivityStatistics } from '@/lib/database/activity';

// GET /api/admin/activity/stats - Get comprehensive activity statistics for admin
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      // Check if user is admin (you may want to implement proper admin check)
      // For now, we'll allow any authenticated user to access this endpoint
      
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') || 'overview';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const groupBy = searchParams.get('groupBy') as 'day' | 'hour' | 'week' || 'day';
      const userId = searchParams.get('userId');
      
      let data;
      
      switch (type) {
        case 'aggregation':
          data = await getActivityAggregation({
            userId: userId || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            groupBy
          });
          break;
        case 'overview':
        default:
          data = await getActivityStatistics();
          break;
      }
      
      return NextResponse.json({
        success: true,
        data
      });
      
    } catch (error) {
      console.error('Get admin activity stats error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get activity statistics'
        },
        { status: 500 }
      );
    }
  });
}