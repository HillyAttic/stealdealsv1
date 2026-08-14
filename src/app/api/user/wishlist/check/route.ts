import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server-session';
import { isInWishlist } from '@/lib/database/firestore-wishlist';

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

// User ID extraction with Firebase integration
async function extractUserId(): Promise<string | null> {
  try {
    // Primary: Firebase server session
    const session = await getServerSession();
    if (session?.uid) {
      logWishlistCheck('user_extraction', session.uid, undefined, { source: 'firebase_session' });
      return session.uid;
    }

    return null;
  } catch (error) {
    logWishlistCheck('user_extraction', 'unknown', undefined, undefined, error as Error);
    return null;
  }
}

// GET /api/user/wishlist/check?propertyId=xxx - Check if property is in wishlist
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    // Extract user ID from Firebase session
    userId = await extractUserId();
      
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
}