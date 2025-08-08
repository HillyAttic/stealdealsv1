import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserAnalytics } from '@/lib/database/activity';

// GET /api/user/analytics - Get user analytics data
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const timeframe = searchParams.get('timeframe') || '30d';
      
      // Get comprehensive analytics for the user
      const analytics = await getUserAnalytics(authenticatedRequest.user.id);
      
      return NextResponse.json({
        success: true,
        analytics,
        timeframe
      });
      
    } catch (error) {
      console.error('Get analytics error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get analytics data'
        },
        { status: 500 }
      );
    }
  });
}