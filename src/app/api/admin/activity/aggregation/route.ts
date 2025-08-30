import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getActivityAggregation } from '@/lib/database/activity';
import { z } from 'zod';

const aggregationQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'hour', 'week']).default('day')
});

// GET /api/admin/activity/aggregation - Get detailed activity aggregation data
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Validate query parameters
      const queryValidation = aggregationQuerySchema.safeParse({
        userId: searchParams.get('userId'),
        startDate: searchParams.get('startDate'),
        endDate: searchParams.get('endDate'),
        groupBy: searchParams.get('groupBy')
      });
      
      if (!queryValidation.success) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid query parameters',
            details: queryValidation.error.errors
          },
          { status: 400 }
        );
      }
      
      const { userId, startDate, endDate, groupBy } = queryValidation.data;
      
      const data = await getActivityAggregation({
        userId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        groupBy
      });
      
      return NextResponse.json({
        success: true,
        data
      });
      
    } catch (error) {
      console.error('Get activity aggregation error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get activity aggregation data'
        },
        { status: 500 }
      );
    }
  });
}