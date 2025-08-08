import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { isInWishlist } from '@/lib/database/wishlist';

// GET /api/user/wishlist/check?propertyId=123 - Check if property is in wishlist
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const propertyId = searchParams.get('propertyId');
      
      if (!propertyId) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Property ID is required'
          },
          { status: 400 }
        );
      }
      
      const inWishlist = await isInWishlist(authenticatedRequest.user.id, propertyId);
      
      return NextResponse.json({
        success: true,
        inWishlist
      });
      
    } catch (error) {
      console.error('Check wishlist error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to check wishlist'
        },
        { status: 500 }
      );
    }
  });
}