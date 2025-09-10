import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';

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

      // Validate Clerk configuration
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey || clerkSecretKey.includes('YOUR_CLERK_SECRET_KEY_HERE')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Clerk configuration error',
            details: 'CLERK_SECRET_KEY is missing or not configured properly'
          },
          { status: 500 }
        );
      }

      console.log(`[Admin User Details API] Fetching user details for ID: ${userId}`);
      
      // Fetch user from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found' 
          },
          { status: 404 }
        );
      }

      // Get wishlist count for this user
      let wishlistCount = 0;
      try {
        const { database } = await import('@/lib/firebase');
        const { ref, get } = await import('firebase/database');
        const userWishlistRef = ref(database, `wishlists/${userId}`);
        const wishlistSnapshot = await get(userWishlistRef);
        
        if (wishlistSnapshot.exists()) {
          const wishlistData = wishlistSnapshot.val();
          if (wishlistData && typeof wishlistData === 'object') {
            wishlistCount = Object.keys(wishlistData).length;
          }
        }
      } catch (wishlistError) {
        console.warn(`[Admin User Details API] Failed to fetch wishlist count for user ${userId}:`, wishlistError);
      }

      // Transform user data
      const transformedUser = {
        id: user.id,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.username || user.primaryEmailAddress?.emailAddress || 'Unknown User',
        email: user.primaryEmailAddress?.emailAddress || 'No email',
        role: user.publicMetadata?.role || 'user',
        isActive: !user.banned && !user.locked,
        emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        provider: user.externalAccounts?.[0]?.provider || 'email',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        lastLoginAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
        lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
        imageUrl: user.imageUrl,
        phoneNumber: user.primaryPhoneNumber?.phoneNumber || null,
        banned: user.banned,
        locked: user.locked,
        hasImage: !!user.hasImage,
        twoFactorEnabled: user.twoFactorEnabled,
        backupCodeEnabled: user.backupCodeEnabled,
        totpEnabled: user.totpEnabled,
        externalAccounts: user.externalAccounts.map(account => ({
          provider: account.provider,
          emailAddress: account.emailAddress
        })),
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
          errorMessage = 'Clerk authentication failed';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error connecting to Clerk';
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