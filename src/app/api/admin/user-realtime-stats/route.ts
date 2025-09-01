import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { getRawWishlistItems } from '@/lib/database/wishlist';

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {

      const { searchParams } = new URL(request.url);
      const targetUserId = searchParams.get('userId');

      if (!targetUserId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Get wishlist data
      const wishlistItems = await getRawWishlistItems(targetUserId);
      
      // Placeholder stats (activity tracking temporarily unavailable)
      const stats = {
        totalViews: 0,
        totalWishlistItems: wishlistItems.length,
        totalActivities: 0,
        lastActivity: null,
        engagementScore: 0,
        sessionDuration: 0,
        isOnline: false
      };

      return NextResponse.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error in user-realtime-stats API:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Internal server error' 
        },
        { status: 500 }
      );
    }
  });
}