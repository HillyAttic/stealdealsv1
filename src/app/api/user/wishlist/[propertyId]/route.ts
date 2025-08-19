import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { updateWishlistItem } from '@/lib/database/wishlist';

// PUT /api/user/wishlist/[propertyId] - Update wishlist item notes and priority
export async function PUT(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  return optionalAuth(request, async (authenticatedRequest) => {
    try {
      const { propertyId } = params;
      const body = await request.json();
      const { notes, priority } = body;
      
      if (!notes && !priority) {
        return NextResponse.json(
          { 
            success: false,
            error: 'At least one field (notes or priority) is required'
          },
          { status: 400 }
        );
      }
      
      if (priority && !['low', 'medium', 'high'].includes(priority)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Priority must be low, medium, or high'
          },
          { status: 400 }
        );
      }
      
      // Get user ID (with fallback for development)
      const userId = authenticatedRequest.user?.id || 'user-1';
      
      const updatedItem = await updateWishlistItem(
        userId, 
        propertyId, 
        { notes, priority }
      );
      
      if (!updatedItem) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Property not found in wishlist'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Wishlist item updated',
        item: updatedItem
      });
      
    } catch (error) {
      console.error('Update wishlist item error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update wishlist item'
        },
        { status: 500 }
      );
    }
  });
}