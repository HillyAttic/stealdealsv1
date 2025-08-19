import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { getUserAnalyticsFromFirebase } from '@/lib/database/user-activity';

// GET /api/user/analytics - Get user analytics data
export async function GET(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    // For development, use a default user if no authentication
    const userId = requestWithUser.user?.id || 'user-1';
    
    console.log(`[Analytics API] Getting analytics for user: ${userId}`);
    
    try {
      const { searchParams } = new URL(request.url);
      const timeframe = searchParams.get('timeframe') || '30d';
      
      // Get comprehensive analytics for the user from Firebase
      const analytics = await getUserAnalyticsFromFirebase(userId);
      
      return NextResponse.json({
        success: true,
        analytics,
        timeframe,
        user: requestWithUser.user ? 'authenticated' : 'guest'
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