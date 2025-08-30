import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { currentUser } from '@clerk/nextjs/server';
import { isInWishlist } from '@/lib/database/wishlist';

// Enhanced logging utility for wishlist check operations
function logWishlistCheck(
  operation: string, 
  userId: string, 
  propertyId?: string, 
  metadata?: any,
  error?: Error
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    operation,
    userId,
    propertyId,
    metadata,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : undefined
  };
  
  if (error) {
    console.error(`[Wishlist Check API] ❌ ${operation} failed:`, logData);
  } else {
    console.log(`[Wishlist Check API] ✅ ${operation} successful:`, logData);
  }
}

// Enhanced user ID extraction with Clerk integration and fallback
async function extractUserId(request: NextRequest & { user?: any }): Promise<string | null> {
  try {
    // First try to get user from Clerk
    const clerkUser = await currentUser();
    if (clerkUser?.id) {
      logWishlistCheck('user_extraction', clerkUser.id, undefined, { source: 'clerk' });
      return clerkUser.id;
    }
    
    // Fallback to middleware user (for development/testing)
    if (request.user?.id) {
      logWishlistCheck('user_extraction', request.user.id, undefined, { source: 'middleware' });
      return request.user.id;
    }
    
    // Development fallback - check for mock user headers
    const mockUserId = request.headers.get('x-mock-user-id');
    if (mockUserId) {
      logWishlistCheck('user_extraction', mockUserId, undefined, { source: 'mock_header' });
      return mockUserId;
    }
    
    // Final fallback for development
    const devUserId = 'user-1';
    logWishlistCheck('user_extraction', devUserId, undefined, { source: 'development_fallback' });
    return devUserId;
    
  } catch (error) {
    logWishlistCheck('user_extraction', 'unknown', undefined, undefined, error as Error);
    return null;
  }
}

// GET /api/user/wishlist/check?propertyId=xxx - Check if property is in wishlist
export async function GET(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    let userId: string | null = null;
    
    try {
      // Enhanced user ID extraction
      userId = await extractUserId(requestWithUser);
      
      if (!userId) {
        logWishlistCheck('check_wishlist', 'unknown', undefined, undefined, new Error('Failed to extract user ID'));
        return NextResponse.json(
          { 
            success: false,
            error: 'Unable to identify user',
            code: 'USER_IDENTIFICATION_FAILED'
          },
          { status: 401 }
        );
      }
      
      const { searchParams } = new URL(request.url);
      const propertyId = searchParams.get('propertyId');
      
      if (!propertyId) {
        logWishlistCheck('check_wishlist', userId, undefined, { 
          error: 'Missing propertyId parameter' 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Property ID is required as a query parameter',
            code: 'MISSING_PROPERTY_ID'
          },
          { status: 400 }
        );
      }
      
      // Validate propertyId format
      if (typeof propertyId !== 'string' || propertyId.trim().length === 0) {
        logWishlistCheck('check_wishlist', userId, propertyId, { 
          error: 'Invalid propertyId format' 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Property ID must be a non-empty string',
            code: 'INVALID_PROPERTY_ID'
          },
          { status: 400 }
        );
      }
      
      const inWishlist = await isInWishlist(userId, propertyId);
      const duration = Date.now() - startTime;
      
      logWishlistCheck('check_wishlist', userId, propertyId, { 
        inWishlist,
        duration: `${duration}ms`
      });
      
      return NextResponse.json({
        success: true,
        inWishlist,
        propertyId,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };
      
      logWishlistCheck('check_wishlist', userId || 'unknown', undefined, { 
        duration: `${duration}ms`
      }, error as Error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to check wishlist status',
          code: 'WISHLIST_CHECK_FAILED',
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        },
        { status: 500 }
      );
    }
  });
}