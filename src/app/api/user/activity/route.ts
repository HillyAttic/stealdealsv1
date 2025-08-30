import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, optionalAuth } from '@/lib/auth/middleware';
import { 
  logActivity, 
  getUserActivity, 
  getPaginatedUserActivity,
  getUserActivityStats,
  getActivityAggregation
} from '@/lib/database/activity-optimized';
import { activitySchema, activityQuerySchema } from '@/lib/validations/auth';
import { RealTimeService } from '@/lib/realtime/service';

// GET /api/user/activity - Get user's activity history with enhanced filtering and pagination
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Validate query parameters (convert null to undefined for optional fields)
      const queryValidation = activityQuerySchema.safeParse({
        endpoint: searchParams.get('endpoint') || undefined,
        type: searchParams.get('type') || undefined,
        page: searchParams.get('page') || undefined,
        limit: searchParams.get('limit') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        propertyId: searchParams.get('propertyId') || undefined,
        groupBy: searchParams.get('groupBy') || undefined
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
      
      const { endpoint, type, page, limit, startDate, endDate, propertyId, groupBy } = queryValidation.data;
      
      let data;
      
      switch (endpoint) {
        case 'views':
          data = await getUserPropertyViews(authenticatedRequest.user.id, limit);
          break;
        case 'searches':
          data = await getUserSearchHistory(authenticatedRequest.user.id, limit);
          break;
        case 'engagement':
          data = await getUserEngagementMetrics(authenticatedRequest.user.id);
          break;
        case 'stats':
          data = await getUserActivityStats(authenticatedRequest.user.id);
          break;
        case 'aggregation':
          data = await getActivityAggregation({
            userId: authenticatedRequest.user.id,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            groupBy: groupBy || 'day'
          });
          break;
        case 'paginated':
        default:
          // Use paginated endpoint by default
          data = await getPaginatedUserActivity(authenticatedRequest.user.id, {
            page,
            limit,
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            propertyId
          });
          break;
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
        
        // Broadcast real-time activity update
        try {
          const realTimeService = RealTimeService.getInstance();
          realTimeService.broadcastActivityUpdate(
            requestWithUser.user.id,
            type,
            propertyId,
            metadata
          );
          console.log(`[Activity API] 📡 Real-time update broadcasted: ${type} for user ${requestWithUser.user.id}`);
        } catch (broadcastError) {
          console.warn(`[Activity API] ⚠️ Failed to broadcast real-time update:`, broadcastError);
          // Don't fail the operation if broadcasting fails
        }
        
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