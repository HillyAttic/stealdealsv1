import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { RealTimeService } from '@/lib/realtime/service';

export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    try {
      const body = await request.json();
      const { type, userId, data } = body;

      if (!type || !data) {
        return NextResponse.json({
          success: false,
          error: 'Type and data are required'
        }, { status: 400 });
      }

      console.log(`[API] 📡 Broadcasting real-time event: ${type} for user ${userId}`);

      const realTimeService = RealTimeService.getInstance();

      switch (type) {
        case 'wishlist_update':
          realTimeService.broadcastWishlistUpdate(
            userId,
            data.action,
            data.propertyId,
            data.wishlistCount
          );
          break;

        case 'activity_update':
          realTimeService.broadcastActivityUpdate(
            userId,
            data.activityType,
            data.propertyId,
            data.metadata
          );
          break;

        case 'user_stats_update':
          realTimeService.broadcastUserStatsUpdate(userId, data);
          break;

        case 'global_stats_update':
          realTimeService.broadcastGlobalStatsUpdate(data);
          break;

        default:
          return NextResponse.json({
            success: false,
            error: 'Unknown event type'
          }, { status: 400 });
      }

      console.log(`[API] ✅ Real-time event broadcasted successfully`);

      return NextResponse.json({
        success: true,
        message: 'Event broadcasted successfully'
      });

    } catch (error) {
      console.error('[API] ❌ Error broadcasting real-time event:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to broadcast real-time event'
      }, { status: 500 });
    }
  });
}