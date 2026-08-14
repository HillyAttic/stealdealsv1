import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';

// GET /api/admin/users/[id] - Get specific user details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const userId = params.id;
      
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'User ID is required'
          },
          { status: 400 }
        );
      }

      console.log(`[Admin User Details API] Fetching user details for ID: ${userId}`);

      // Fetch user from Firebase Auth
      const user = await FirebaseAdminUserService.getUser(userId);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found'
          },
          { status: 404 }
        );
      }

      // Get wishlist count for this user — uses Admin SDK
      let wishlistCount = 0;
      try {
        const { db } = await import('@/lib/firebase-server-admin');
        const snapshot = await db.collection('wishlists').doc(userId).collection('items').get();
        wishlistCount = snapshot.size;
      } catch (wishlistError) {
        console.warn(`[Admin User Details API] Failed to fetch wishlist count for user ${userId}:`, wishlistError);
      }

      // Transform user data
      const transformedUser = {
        id: user.id,
        name: user.displayName || user.email || 'Unknown User',
        email: user.email || 'No email',
        role: 'user', // Firebase Auth doesn't have role in metadata by default
        isActive: !user.disabled,
        emailVerified: user.emailVerified,
        provider: user.provider,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        lastLoginAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
        lastActiveAt: null,
        imageUrl: user.photoURL,
        phoneNumber: null,
        banned: user.disabled,
        locked: false,
        hasImage: !!user.photoURL,
        twoFactorEnabled: false,
        backupCodeEnabled: false,
        totpEnabled: false,
        externalAccounts: [],
        totalViews: 0, // Placeholder for activity tracking
        wishlistCount
      };
      
      return NextResponse.json({
        success: true,
        user: transformedUser
      });
      
    } catch (error) {
      console.error(`[Admin User Details API] Error fetching user details:`, error);
      
      let errorMessage = 'Failed to fetch user details';
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'User not found';
          statusCode = 404;
        } else if (error.message.includes('Invalid API key') || error.message.includes('authentication')) {
          errorMessage = 'Firebase authentication failed';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error connecting to Firebase';
        }
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: statusCode }
      );
    }
  });
}