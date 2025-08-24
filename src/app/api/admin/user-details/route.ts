import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/user-details?userId=xxx - Get specific user details for admin dashboard
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Fetch user from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Transform Clerk user data
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
        externalAccounts: user.externalAccounts.map((account: any) => ({
          provider: account.provider,
          emailAddress: account.emailAddress
        }))
      };

      // Mock activity data (in a real app, this would come from your database)
      const mockActivity = [
        {
          id: '1',
          type: 'property_view',
          description: 'Viewed property: Modern Apartment in Downtown',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: {
            propertyId: 'prop_1',
            propertyTitle: 'Modern Apartment in Downtown',
            duration: 120
          }
        },
        {
          id: '2',
          type: 'search',
          description: 'Searched for properties in Mumbai',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          metadata: {
            query: 'Mumbai apartments',
            resultsCount: 15
          }
        },
        {
          id: '3',
          type: 'wishlist_add',
          description: 'Added property to wishlist',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: {
            propertyId: 'prop_2',
            propertyTitle: 'Luxury Villa in Goa'
          }
        }
      ];

      // Mock wishlist data (in a real app, this would come from your database)
      const mockWishlist = [
        {
          id: 'prop_1',
          title: 'Modern Apartment in Downtown',
          location: 'Mumbai, Maharashtra',
          price: '₹85,00,000',
          imageUrl: '/api/placeholder/300/200',
          addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 2,
          area: '1200 sq ft'
        },
        {
          id: 'prop_2',
          title: 'Luxury Villa in Goa',
          location: 'North Goa, Goa',
          price: '₹3,50,00,000',
          imageUrl: '/api/placeholder/300/200',
          addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'villa',
          bedrooms: 4,
          bathrooms: 3,
          area: '2500 sq ft'
        }
      ];

      // Mock analytics data
      const mockAnalytics = {
        totalViews: 45,
        uniqueProperties: 12,
        averageSessionDuration: 385 // seconds
      };

      return NextResponse.json({
        success: true,
        user: transformedUser,
        activity: mockActivity,
        wishlist: mockWishlist,
        analytics: mockAnalytics
      });

    } catch (error) {
      console.error('Get user details error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch user details',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}