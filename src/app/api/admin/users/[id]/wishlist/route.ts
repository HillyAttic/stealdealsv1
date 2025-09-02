import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { getUserWishlist, getWishlistStats, getRawWishlistItems } from '@/lib/database/wishlist';
import { ActivityLogger } from '@/lib/services/activityLogger';

interface AdminWishlistParams {
  id: string;
}

// Enhanced logging utility for admin wishlist operations
function logAdminWishlistOperation(
  operation: string,
  adminUserId: string,
  targetUserId: string,
  metadata?: any,
  error?: Error
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    operation,
    adminUserId,
    targetUserId,
    metadata,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : undefined
  };
  
  if (error) {
    console.error(`[Admin Wishlist API] ❌ ${operation} failed:`, logData);
  } else {
    console.log(`[Admin Wishlist API] ✅ ${operation} successful:`, logData);
  }
}

// GET /api/admin/users/[id]/wishlist - Get user's wishlist for admin view
export async function GET(
  request: NextRequest,
  { params }: { params: AdminWishlistParams }
) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    const startTime = Date.now();
    
    try {
      const { id: userId } = params;
      const adminUserId = authenticatedRequest.user.userId;
      
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logAdminWishlistOperation(
          'get_user_wishlist',
          adminUserId,
          'invalid',
          { error: 'Invalid user ID' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Valid user ID is required',
            code: 'INVALID_USER_ID'
          },
          { status: 400 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const includeStats = searchParams.get('includeStats') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const priority = searchParams.get('priority') as 'low' | 'medium' | 'high' | null;

      // Validate query parameters
      if (limit < 1 || limit > 100) {
        logAdminWishlistOperation(
          'get_user_wishlist',
          adminUserId,
          userId,
          { limit, error: 'Invalid limit' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Limit must be between 1 and 100',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }

      if (offset < 0) {
        logAdminWishlistOperation(
          'get_user_wishlist',
          adminUserId,
          userId,
          { offset, error: 'Invalid offset' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Offset must be non-negative',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }

      logAdminWishlistOperation(
        'get_user_wishlist',
        adminUserId,
        userId,
        { includeStats, limit, offset, priority }
      );

      // Get user's complete wishlist with property details
      const wishlistProperties = await getUserWishlist(userId);
      
      // Filter by priority if specified
      const filteredProperties = priority 
        ? wishlistProperties.filter(prop => prop.priority === priority)
        : wishlistProperties;
      
      // Apply pagination
      const paginatedProperties = filteredProperties.slice(offset, offset + limit);
      const hasMore = offset + limit < filteredProperties.length;

      // Get wishlist statistics if requested
      let stats = null;
      if (includeStats) {
        try {
          stats = await getWishlistStats(userId);
        } catch (statsError) {
          console.warn('[Admin Wishlist API] Failed to get wishlist stats:', statsError);
          // Continue without stats if they fail to load
        }
      }

      const duration = Date.now() - startTime;

      logAdminWishlistOperation(
        'get_user_wishlist',
        adminUserId,
        userId,
        {
          totalWishlistItems: wishlistProperties.length,
          filteredItems: filteredProperties.length,
          returnedItems: paginatedProperties.length,
          hasStats: !!stats,
          duration: `${duration}ms`
        }
      );

      return NextResponse.json({
        success: true,
        userId,
        wishlist: {
          properties: paginatedProperties,
          pagination: {
            total: filteredProperties.length,
            limit,
            offset,
            hasMore,
            nextOffset: hasMore ? offset + limit : null
          },
          stats: stats || undefined
        },
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          adminUserId,
          filters: {
            priority: priority || null,
            includeStats
          }
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const adminUserId = authenticatedRequest.user?.userId || 'unknown';
      const userId = params?.id || 'unknown';
      
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };

      logAdminWishlistOperation(
        'get_user_wishlist',
        adminUserId,
        userId,
        { duration: `${duration}ms` },
        error as Error
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve user wishlist',
          code: 'WISHLIST_RETRIEVAL_FAILED',
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

// POST /api/admin/users/[id]/wishlist - Admin actions on user's wishlist (remove items, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: AdminWishlistParams }
) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    const startTime = Date.now();
    
    try {
      const { id: userId } = params;
      const adminUserId = authenticatedRequest.user.userId;
      
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logAdminWishlistOperation(
          'admin_wishlist_action',
          adminUserId,
          'invalid',
          { error: 'Invalid user ID' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Valid user ID is required',
            code: 'INVALID_USER_ID'
          },
          { status: 400 }
        );
      }

      // Parse request body
      let requestBody: any = null;
      try {
        requestBody = await request.json();
      } catch (parseError) {
        logAdminWishlistOperation(
          'admin_wishlist_action',
          adminUserId,
          userId,
          { error: 'Invalid JSON in request body' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON in request body',
            code: 'INVALID_JSON'
          },
          { status: 400 }
        );
      }

      const { action, propertyId } = requestBody;

      // Validate action
      if (!action || !['remove', 'clear_all'].includes(action)) {
        logAdminWishlistOperation(
          'admin_wishlist_action',
          adminUserId,
          userId,
          { action, error: 'Invalid action' }
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Action must be one of: remove, clear_all',
            code: 'INVALID_ACTION'
          },
          { status: 400 }
        );
      }

      if (action === 'remove') {
        if (!propertyId || typeof propertyId !== 'string') {
          logAdminWishlistOperation(
            'admin_wishlist_action',
            adminUserId,
            userId,
            { action, error: 'Property ID required for remove action' }
          );
          return NextResponse.json(
            {
              success: false,
              error: 'Property ID is required for remove action',
              code: 'MISSING_PROPERTY_ID'
            },
            { status: 400 }
          );
        }

        // Import the remove function
        const { removeFromWishlist } = await import('@/lib/database/wishlist');
        const removed = await removeFromWishlist(userId, propertyId);
        
        if (!removed) {
          logAdminWishlistOperation(
            'admin_remove_wishlist_item',
            adminUserId,
            userId,
            { propertyId, reason: 'not_found' }
          );
          return NextResponse.json(
            {
              success: false,
              error: 'Property not found in user\'s wishlist',
              code: 'PROPERTY_NOT_IN_WISHLIST'
            },
            { status: 404 }
          );
        }

        // Log real-time activity for admin action
        try {
          const activityLogger = ActivityLogger.getInstance();
          await activityLogger.logWishlistActivity({
            userId: userId,
            action: 'remove',
            propertyId,
            metadata: {
              reason: 'admin_action',
              adminUserId: adminUserId
            }
          });
          console.log(`[Admin Wishlist API] 📝 Activity logged: admin remove ${propertyId} for user ${userId}`);
        } catch (activityError) {
          console.warn(`[Admin Wishlist API] ⚠️ Failed to log activity:`, activityError);
          // Don't fail the operation if activity logging fails
        }

        const duration = Date.now() - startTime;
        
        logAdminWishlistOperation(
          'admin_remove_wishlist_item',
          adminUserId,
          userId,
          { propertyId, duration: `${duration}ms` }
        );

        return NextResponse.json({
          success: true,
          message: `Property ${propertyId} removed from user's wishlist by admin`,
          action: 'remove',
          propertyId,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            adminUserId
          }
        });

      } else if (action === 'clear_all') {
        // Import the clear function
        const { clearWishlist } = await import('@/lib/database/wishlist');
        const cleared = await clearWishlist(userId);
        
        if (!cleared) {
          logAdminWishlistOperation(
            'admin_clear_wishlist',
            adminUserId,
            userId,
            { reason: 'clear_failed' }
          );
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to clear user\'s wishlist',
              code: 'CLEAR_FAILED'
            },
            { status: 500 }
          );
        }

        const duration = Date.now() - startTime;
        
        logAdminWishlistOperation(
          'admin_clear_wishlist',
          adminUserId,
          userId,
          { duration: `${duration}ms` }
        );

        return NextResponse.json({
          success: true,
          message: `User's wishlist cleared by admin`,
          action: 'clear_all',
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            adminUserId
          }
        });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const adminUserId = authenticatedRequest.user?.userId || 'unknown';
      const userId = params?.id || 'unknown';
      
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };

      logAdminWishlistOperation(
        'admin_wishlist_action',
        adminUserId,
        userId,
        { duration: `${duration}ms` },
        error as Error
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to perform admin wishlist action',
          code: 'ADMIN_WISHLIST_ACTION_FAILED',
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