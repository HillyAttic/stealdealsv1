import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { seedAnalyticsData } from '@/lib/database/seed-analytics';

// POST /api/user/analytics/seed - Seed test analytics data for development
export async function POST(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      // Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Seeding is not allowed in production'
          },
          { status: 403 }
        );
      }
      
      await seedAnalyticsData(authenticatedRequest.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Analytics data seeded successfully'
      });
      
    } catch (error) {
      console.error('Seed analytics error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to seed analytics data'
        },
        { status: 500 }
      );
    }
  });
}