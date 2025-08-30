import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';
import { getUserWishlist } from '@/lib/database/wishlist';
import { getUserActivity } from '@/lib/database/user-activity';

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

      // Get user details from Clerk
      const client = await clerkClient();
      const targetUser = await client.users.getUser(targetUserId);
      
      // Get user's wishlist items with full property details
      let wishlist = [];
      try {
        console.log(`[API] Fetching wishlist with full property details for user: ${targetUserId}`);
        let wishlistProperties = await getUserWishlist(targetUserId);
        
        // In development, also try the fallback user ID if no items found
        if (wishlistProperties.length === 0 && process.env.NODE_ENV === 'development') {
          console.log(`[API] No items found for ${targetUserId}, trying fallback user-1`);
          wishlistProperties = await getUserWishlist('user-1');
        }
        
        console.log(`[API] Found ${wishlistProperties.length} wishlist properties with full details`);
        
        // Convert to format expected by admin UI
        wishlist = wishlistProperties.map(property => ({
          id: property.id,
          title: property.title,
          location: property.location,
          price: typeof property.price === 'number' ? `₹${property.price.toLocaleString('en-IN')}` : property.price,
          imageUrl: property.images && property.images.length > 0 ? property.images[0] : '/api/placeholder/300/200',
          addedAt: property.addedAt.toISOString(),
          type: property.type,
          // These fields don't exist in our property structure, so we'll handle them in UI
          bedrooms: null,
          bathrooms: null,  
          area: null, // We'll use property data to determine this in UI
          notes: property.notes,
          priority: property.priority,
          // Add more property details for rich display
          images: property.images || []
        }));
        
        console.log(`[API] Successfully processed ${wishlist.length} wishlist items with full property details`);
      } catch (error) {
        console.warn('Failed to fetch wishlist for user:', targetUserId, error);
      }

      // Get user's activity
      let activity = [];
      try {
        const userActivities = await getUserActivity(targetUserId, 50);
        activity = userActivities.map(act => ({
          id: act.id,
          type: act.type,
          description: getActivityDescription(act),
          timestamp: act.timestamp,
          metadata: act.metadata
        }));
      } catch (error) {
        console.warn('Failed to fetch activities for user:', targetUserId, error);
      }

      // Calculate analytics
      const analytics = {
        totalViews: activity.filter(a => a.type === 'property_view').length,
        uniqueProperties: new Set(
          activity
            .filter(a => a.type === 'property_view' && a.metadata?.propertyId)
            .map(a => a.metadata.propertyId)
        ).size,
        averageSessionDuration: 0 // This would need session tracking
      };

      const userDetails = {
        id: targetUser.id,
        name: `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Unknown User',
        email: targetUser.emailAddresses[0]?.emailAddress || 'No email',
        role: targetUser.publicMetadata?.role || 'user',
        isActive: !targetUser.banned && !targetUser.locked,
        emailVerified: targetUser.emailAddresses[0]?.verification?.status === 'verified',
        provider: targetUser.externalAccounts[0]?.provider || 'email',
        createdAt: targetUser.createdAt ? new Date(targetUser.createdAt).toISOString() : null,
        lastLoginAt: targetUser.lastSignInAt ? new Date(targetUser.lastSignInAt).toISOString() : null,
        lastActiveAt: targetUser.lastActiveAt ? new Date(targetUser.lastActiveAt).toISOString() : null,
        imageUrl: targetUser.imageUrl,
        phoneNumber: targetUser.phoneNumbers[0]?.phoneNumber || null,
        banned: targetUser.banned,
        locked: targetUser.locked,
        hasImage: !!targetUser.imageUrl,
        twoFactorEnabled: targetUser.twoFactorEnabled,
        backupCodeEnabled: targetUser.backupCodeEnabled,
        totpEnabled: targetUser.totpEnabled,
        externalAccounts: targetUser.externalAccounts.map(account => ({
          provider: account.provider,
          emailAddress: account.emailAddress || ''
        }))
      };

      return NextResponse.json({
        success: true,
        user: userDetails,
        wishlist,
        activity,
        analytics
      });

    } catch (error) {
      console.error('Error in user-details API:', error);
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

function getActivityDescription(activity: any): string {
  switch (activity.type) {
    case 'property_view':
      return `Viewed property ${activity.metadata?.propertyId || 'unknown'}`;
    case 'search':
      return `Searched for "${activity.metadata?.query || 'unknown'}"`;
    case 'wishlist_add':
      return `Added property ${activity.metadata?.propertyId || 'unknown'} to wishlist`;
    case 'wishlist_remove':
      return `Removed property ${activity.metadata?.propertyId || 'unknown'} from wishlist`;
    case 'contact_inquiry':
      return `Made contact inquiry for property ${activity.metadata?.propertyId || 'unknown'}`;
    default:
      return `Performed ${activity.type} action`;
  }
}