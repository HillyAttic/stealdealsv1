import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { 
  getUserWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  getWishlistStats,
  isInWishlist 
} from '@/lib/database/wishlist';

// GET /api/user/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    // For development, use a default user if no authentication
    const userId = requestWithUser.user?.id || 'user-1';
    
    console.log(`[Wishlist API] Getting wishlist for user: ${userId}`);
    
    try {
      const { searchParams } = new URL(request.url);
      const statsOnly = searchParams.get('stats') === 'true';
      
      if (statsOnly) {
        const stats = await getWishlistStats(userId);
        return NextResponse.json({
          success: true,
          stats
        });
      }
      
      const wishlistProperties = await getUserWishlist(userId);
      
      return NextResponse.json({
        success: true,
        properties: wishlistProperties,
        total: wishlistProperties.length,
        user: requestWithUser.user ? 'authenticated' : 'guest'
      });
      
    } catch (error) {
      console.error('Get wishlist error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get wishlist'
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/user/wishlist - Add/remove property from wishlist
export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    // For development, use a default user if no authentication
    const userId = requestWithUser.user?.id || 'user-1';
    
    console.log(`[Wishlist API] POST operation for user: ${userId}`);
    
    try {
      const body = await request.json();
      const { propertyId, action, notes, priority } = body;
      
      if (!propertyId || !action) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Property ID and action are required'
          },
          { status: 400 }
        );
      }
      
      if (action === 'add') {
        // Check if already in wishlist
        const alreadyInWishlist = await isInWishlist(userId, propertyId);
        if (alreadyInWishlist) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Property already in wishlist'
            },
            { status: 400 }
          );
        }
        
        const wishlistItem = await addToWishlist(
          userId, 
          propertyId, 
          notes, 
          priority || 'medium'
        );
        
        return NextResponse.json({
          success: true,
          message: 'Property added to wishlist',
          item: wishlistItem
        });
        
      } else if (action === 'remove') {
        const removed = await removeFromWishlist(userId, propertyId);
        
        if (!removed) {
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
          message: 'Property removed from wishlist'
        });
        
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action. Use "add" or "remove"'
          },
          { status: 400 }
        );
      }
      
    } catch (error) {
      console.error('Wishlist operation error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update wishlist'
        },
        { status: 500 }
      );
    }
  });
}