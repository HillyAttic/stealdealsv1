import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const client = await clerkClient();
    const currentUser = await client.users.getUser(currentUserId);
    const isAdmin = currentUser.publicMetadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all users count
    const users = await client.users.getUserList({ limit: 1000 });
    
    // Calculate stats (this is a simplified version)
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newUsersThisMonth = users.data.filter(user => 
      user.createdAt && new Date(user.createdAt) > oneMonthAgo
    ).length;
    
    const activeUsers = users.data.filter(user => 
      user.lastSignInAt && new Date(user.lastSignInAt) > oneDayAgo
    ).length;

    const stats = {
      totalUsers: users.totalCount,
      activeUsers,
      newUsersThisMonth,
      onlineUsers: 0, // Would need real-time tracking
      totalActivities: 0, // Would need to aggregate from activity database
      totalWishlistItems: 0 // Would need to aggregate from wishlist database
    };

    const recentActivity = [
      {
        id: '1',
        type: 'user_registration',
        message: 'New user registered',
        timestamp: new Date(),
        userId: 'sample-user'
      }
    ];

    return NextResponse.json({
      success: true,
      stats,
      recentActivity
    });

  } catch (error) {
    console.error('Error in realtime-stats API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}