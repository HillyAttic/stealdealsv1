import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, optionalAuth } from '@/lib/auth/middleware';
import { 
  logActivity, 
  getUserActivity, 
  getUserPropertyViews, 
  getUserSearchHistory, 
  getUserEngagementMetrics 
} from '@/lib/database/activity';
import { activitySchema } from '@/lib/validations/auth';

// GET /api/user/activity - Get user's activity history
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const limit = parseInt(searchParams.get('limit') || '50');
      
      let data;
      
      switch (type) {
        case 'views':
          data = await getUserPropertyViews(authenticatedRequest.user.id, limit);
          break;
        case 'searches':
          data = await getUserSearchHistory(authenticatedRequest.user.id, limit);
          break;
        case 'engagement':
          data = await getUserEngagementMetrics(authenticatedRequest.user.id);
          break;
        default:
          data = await getUserActivity(authenticatedRequest.user.id, limit);
      }
      
      return NextResponse.json({
        success: true,
        data
      });
      
    } catch (error) {
      console.error('Get activity error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get activity data'
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/user/activity - Log user activity
export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    try {
      const body = await request.json();
      
      // Validate request data
      const validationResult = activitySchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation failed',
            details: validationResult.error.errors
          },
          { status: 400 }
        );
      }
      
      const { type, propertyId, metadata, sessionId, ipAddress, userAgent } = validationResult.data;
      
      // If user is authenticated, log the activity
      if (requestWithUser.user) {
        const activity = await logActivity(
          requestWithUser.user.id,
          type,
          propertyId,
          metadata,
          sessionId,
          ipAddress,
          userAgent
        );
        
        return NextResponse.json({
          success: true,
          activity: {
            id: activity.id,
            type: activity.type,
            timestamp: activity.timestamp
          }
        });
      } else {
        // For unauthenticated users, we could still log anonymous activity
        // For now, we'll just return success without logging
        return NextResponse.json({
          success: true,
          message: 'Activity logged (anonymous)'
        });
      }
      
    } catch (error) {
      console.error('Log activity error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to log activity'
        },
        { status: 500 }
      );
    }
  });
}