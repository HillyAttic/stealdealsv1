import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server-auth';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';
import { getUserById } from '@/lib/database/firestore-users';

export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin via Firestore
    const currentUser = await getUserById(currentUserId);
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';
    
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all users count from Firebase
    const totalUsers = await FirebaseAdminUserService.getUserCount();

    const now = new Date();
    const stats = {
      totalUsers,
      activeUsers: 0,
      newUsersThisMonth: 0,
      onlineUsers: 0,
      totalActivities: 0,
      totalWishlistItems: 0
    };

    const recentActivity = [
      { id: '1', type: 'user_registration', message: 'New user registered', timestamp: new Date(), userId: 'sample-user' }
    ];

    return NextResponse.json({ success: true, stats, recentActivity });
  } catch (error) {
    console.error('Error in realtime-stats API:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
