import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { analytics } from '@/lib/analytics/real-time-analytics';

export async function GET(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const userId = requestWithUser.user?.id || 'user-1';
    
    try {
      console.log(`[Dashboard Metrics API] Getting metrics for user: ${userId}`);

      // Get both system and user-specific metrics
      const [systemMetrics, userMetrics] = await Promise.all([
        analytics.getSystemMetrics(),
        analytics.getUserDashboardMetrics(userId)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          system: systemMetrics,
          user: userMetrics
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Dashboard metrics error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch dashboard metrics'
        },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const userId = requestWithUser.user?.id || 'user-1';
    
    try {
      const body = await request.json();
      const { type, propertyId, metadata } = body;

      if (!type) {
        return NextResponse.json(
          { success: false, error: 'Interaction type is required' },
          { status: 400 }
        );
      }

      console.log(`[Dashboard Metrics API] Tracking ${type} for user: ${userId}`);

      await analytics.trackUserInteraction(userId, type, propertyId, metadata);

      return NextResponse.json({
        success: true,
        message: 'Interaction tracked successfully'
      });

    } catch (error) {
      console.error('Track interaction error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to track interaction'
        },
        { status: 500 }
      );
    }
  });
}