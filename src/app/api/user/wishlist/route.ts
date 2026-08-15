import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server-session';
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlistStats,
  isInWishlist,
  updateWishlistItem
} from '@/lib/database/firestore-wishlist';
import { RealTimeService } from '@/lib/realtime/service';
import { withWishlistMonitoring } from '@/lib/monitoring/middleware';
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { AnalyticsTracker } from '@/lib/monitoring/analytics';
import { ActivityLogger } from '@/lib/services/activityLogger';

export const dynamic = 'force-dynamic';

// Extract user ID from Firebase session or x-user-id header
async function extractUserId(request?: NextRequest): Promise<string | null> {
  try {
    // Primary: Firebase server session (firebase-token cookie)
    const session = await getServerSession();
    if (session?.uid) {
      return session.uid;
    }

    // Fallback: x-user-id header
    if (request) {
      const headerUserId = request.headers.get('x-user-id');
      if (headerUserId && headerUserId.trim().length > 0) {
        return headerUserId;
      }
    }

    return null;
  } catch (error) {
    console.error('[Wishlist API] Error extracting user ID:', error);
    return null;
  }
}

// Input validation
interface WishlistRequestBody {
  propertyId: string;
  action: 'add' | 'remove' | 'update';
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

function validateWishlistRequest(body: any): { isValid: boolean; errors: string[]; data?: WishlistRequestBody } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return { isValid: false, errors };
  }

  const { propertyId, action, notes, priority } = body;

  if (!propertyId || typeof propertyId !== 'string' || propertyId.trim().length === 0) {
    errors.push('Property ID is required');
  }

  if (!action || !['add', 'remove', 'update'].includes(action)) {
    errors.push('Action must be: add, remove, or update');
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.push('Priority must be: low, medium, or high');
  }

  if (action === 'update' && notes === undefined && priority === undefined) {
    errors.push('Update requires notes or priority');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { propertyId, action, notes, priority } : undefined
  };
}

// GET /api/user/wishlist - Get user's wishlist
export const GET = withWishlistMonitoring(async (request: NextRequest, context) => {
  const startTime = Date.now();

  try {
    const userId = await extractUserId(request);
    context.userId = userId || undefined;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to identify user',
          code: 'USER_IDENTIFICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Record performance metric
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.recordMetric('wishlist_get_request', 1, 'count', {
      userId,
      requestId: context.requestId
    });

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 1000',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offset must be non-negative',
          code: 'INVALID_OFFSET'
        },
        { status: 400 }
      );
    }

    if (statsOnly) {
      const stats = await getWishlistStats(userId);
      return NextResponse.json({
        success: true,
        stats,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      });
    }

    // Cache headers - allow 5-minute browser cache for faster subsequent loads
    const headers = {
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
      'Vary': 'Cookie, Authorization'
    };

    const wishlistProperties = await getUserWishlist(userId);

    // Apply pagination
    const paginatedProperties = wishlistProperties.slice(offset, offset + limit);
    const hasMore = offset + limit < wishlistProperties.length;

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      properties: paginatedProperties,
      pagination: {
        total: wishlistProperties.length,
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null
      },
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      }
    }, { headers });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Wishlist API] GET failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve wishlist',
        code: 'WISHLIST_RETRIEVAL_FAILED',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? { message: error.message } : undefined : undefined,
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

// POST /api/user/wishlist - Add/remove/update property in wishlist
export const POST = withWishlistMonitoring(async (request: NextRequest, context) => {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    userId = await extractUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to identify user',
          code: 'USER_IDENTIFICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let requestBody: any;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const validation = validateWishlistRequest(requestBody);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_FAILED',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { propertyId, action, notes, priority } = validation.data!;

    if (action === 'add') {
      // Note: isInWishlist check is now done in adminAddToWishlist to avoid duplicate query
      const wishlistItem = await addToWishlist(userId, propertyId, notes, priority || 'medium');

      // Log activity (truly non-blocking - don't await)
      void (async () => {
        try {
          const activityLogger = ActivityLogger.getInstance();
          await activityLogger.logWishlistActivity({
            userId,
            action: 'add',
            propertyId,
            metadata: { notes, priority: priority || 'medium' }
          });
        } catch (err) {
          // Ignore activity logging errors
        }
      })();

      // Broadcast real-time update (truly non-blocking - don't await)
      void (async () => {
        try {
          const realTimeService = RealTimeService.getInstance();
          realTimeService.broadcastWishlistUpdate(userId, 'add', propertyId, 0);
        } catch (err) {
          // Ignore broadcast errors
        }
      })();

      return NextResponse.json({
        success: true,
        message: 'Property added to wishlist',
        item: wishlistItem,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      });

    } else if (action === 'remove') {
      const removed = await removeFromWishlist(userId, propertyId);

      if (!removed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Property not found in wishlist',
            code: 'PROPERTY_NOT_IN_WISHLIST'
          },
          { status: 404 }
        );
      }

      // Clear cache (non-blocking)
      try {
        const { cacheService } = await import('@/lib/database/cache');
        cacheService.clearAll();
      } catch (err) {
        // Ignore cache errors
      }

      // Log activity (non-blocking)
      try {
        const activityLogger = ActivityLogger.getInstance();
        await activityLogger.logWishlistActivity({
          userId,
          action: 'remove',
          propertyId,
          metadata: {}
        });
      } catch (err) {
        // Ignore activity logging errors
      }

      // Broadcast real-time update (non-blocking)
      try {
        const realTimeService = RealTimeService.getInstance();
        realTimeService.broadcastWishlistUpdate(userId, 'remove', propertyId, 0);
      } catch (err) {
        // Ignore broadcast errors
      }

      return NextResponse.json({
        success: true,
        message: 'Property removed from wishlist',
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      });

    } else if (action === 'update') {
      const updatedItem = await updateWishlistItem(userId, propertyId, { notes, priority });

      if (!updatedItem) {
        return NextResponse.json(
          {
            success: false,
            error: 'Property not found in wishlist',
            code: 'PROPERTY_NOT_IN_WISHLIST'
          },
          { status: 404 }
        );
      }

      // Log activity (non-blocking)
      try {
        const activityLogger = ActivityLogger.getInstance();
        await activityLogger.logWishlistActivity({
          userId,
          action: 'update',
          propertyId,
          metadata: { notes, priority }
        });
      } catch (err) {
        // Ignore activity logging errors
      }

      return NextResponse.json({
        success: true,
        message: 'Wishlist item updated',
        item: updatedItem,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
          code: 'INVALID_ACTION'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Wishlist API] POST failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update wishlist',
        code: 'WISHLIST_OPERATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? { message: error.message } : undefined : undefined,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      },
      { status: 500 }
    );
  }
});

// PUT /api/user/wishlist - Update wishlist item metadata
export const PUT = withWishlistMonitoring(async (request: NextRequest, context) => {
  const startTime = Date.now();

  try {
    const userId = await extractUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to identify user',
          code: 'USER_IDENTIFICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let requestBody: any;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { propertyId, notes, priority } = requestBody;

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required',
          code: 'INVALID_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    if (notes === undefined && priority === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one field (notes or priority) must be provided',
          code: 'NO_UPDATE_FIELDS'
        },
        { status: 400 }
      );
    }

    if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Priority must be: low, medium, or high',
          code: 'INVALID_PRIORITY'
        },
        { status: 400 }
      );
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Notes must be a string',
          code: 'INVALID_NOTES'
        },
        { status: 400 }
      );
    }

    const updatedItem = await updateWishlistItem(userId, propertyId, { notes, priority });

    if (!updatedItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found in wishlist',
          code: 'PROPERTY_NOT_IN_WISHLIST'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wishlist item metadata updated',
      item: updatedItem,
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    console.error('[Wishlist API] PUT failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update wishlist item metadata',
        code: 'WISHLIST_UPDATE_FAILED',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? { message: error.message } : undefined : undefined,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      },
      { status: 500 }
    );
  }
});

// DELETE /api/user/wishlist?propertyId=xxx - Remove property from wishlist
export const DELETE = withWishlistMonitoring(async (request: NextRequest, context) => {
  const startTime = Date.now();

  try {
    const userId = await extractUserId(request);

    if (!userId) {
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
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required',
          code: 'MISSING_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    const removed = await removeFromWishlist(userId, propertyId);

    if (!removed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found in wishlist',
          code: 'PROPERTY_NOT_IN_WISHLIST'
        },
        { status: 404 }
      );
    }

    // Clear cache (non-blocking)
    try {
      const { cacheService } = await import('@/lib/database/cache');
      cacheService.clearAll();
    } catch (err) {
      // Ignore cache errors
    }

    // Broadcast real-time update (non-blocking)
    try {
      const realTimeService = RealTimeService.getInstance();
      const stats = await getWishlistStats(userId);
      realTimeService.broadcastWishlistUpdate(userId, 'remove', propertyId, stats.total);
    } catch (err) {
      // Ignore broadcast errors
    }

    return NextResponse.json({
      success: true,
      message: 'Property removed from wishlist',
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    console.error('[Wishlist API] DELETE failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove property from wishlist',
        code: 'WISHLIST_DELETE_FAILED',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? { message: error.message } : undefined : undefined,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        }
      },
      { status: 500 }
    );
  }
});
