import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { seedUserActivityData, clearUserActivityData } from '@/lib/database/user-activity';

export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const userId = requestWithUser.user?.id || 'user-1';
    
    try {
      console.log(`[Activity Seed API] Seeding activity data for user: ${userId}`);
      
      const body = await request.json();
      const { clear } = body;
      
      // Clear existing data if requested
      if (clear) {
        await clearUserActivityData(userId);
        console.log(`[Activity Seed API] Cleared existing data for user: ${userId}`);
      }
      
      // Seed new activity data
      await seedUserActivityData(userId);
      
      return NextResponse.json({
        success: true,
        message: 'Activity data seeded successfully',
        userId
      });
      
    } catch (error) {
      console.error('Seed activity data error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to seed activity data'
        },
        { status: 500 }
      );
    }
  });
}