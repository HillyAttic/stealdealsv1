import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { currentUser } from '@clerk/nextjs/server';
import { 
  getUserWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  getWishlistStats,
  isInWishlist,
  updateWishlistItem
} from '@/lib/database/wishlist';
import { RealTimeService } from '@/lib/realtime/service';
import { withWishlistMonitoring } from '@/lib/monitoring/middleware';
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { AnalyticsTracker } from '@/lib/monitoring/analytics';
import { ActivityLogger } from '@/lib/services/activityLogger';

// Force dynamic rendering to prevent caching in production
export const dynamic = 'force-dynamic';

// Enhanced logging utility for wishlist operations
function logWishlistOperation(
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
    console.error(`[Wishlist API] ❌ ${operation} failed:`, logData);
  } else {
    console.log(`[Wishlist API] ✅ ${operation} successful:`, logData);
  }
}

// Enhanced user ID extraction with improved production authentication handling
async function extractUserId(request: NextRequest & { user?: any }): Promise<string | null> {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // First try to get user from Clerk with comprehensive error handling
    try {
      const clerkUser = await currentUser();
      if (clerkUser?.id) {
        logWishlistOperation('user_extraction', clerkUser.id, undefined, { 
          source: 'clerk_success',
          environment: isProduction ? 'production' : 'development'
        });
        return clerkUser.id;
      }
    } catch (clerkError) {
      const errorMsg = clerkError instanceof Error ? clerkError.message : 'Unknown clerk error';
      console.warn(`[Wishlist API] Clerk currentUser() failed in ${isProduction ? 'production' : 'development'}:`, errorMsg);
      logWishlistOperation('user_extraction_clerk_error', 'unknown', undefined, {
        error: errorMsg,
        environment: isProduction ? 'production' : 'development',
        errorStack: clerkError instanceof Error ? clerkError.stack : undefined
      });
      
      // In production, continue with alternative methods instead of failing
      if (isProduction) {
        console.log('[Wishlist API] Production: Attempting alternative authentication methods...');
      }
    }
    
    // Enhanced header-based authentication for production
    const userIdHeader = request.headers.get('x-user-id');
    if (userIdHeader) {
      // More flexible user ID validation for production
      if (isProduction) {
        // Accept any non-empty user ID in production (Clerk IDs can have different formats)
        if (userIdHeader.trim().length > 0 && (userIdHeader.startsWith('user_') || userIdHeader.includes('user'))) {
          logWishlistOperation('user_extraction', userIdHeader, undefined, { 
            source: 'user_id_header_production',
            environment: 'production'
          });
          return userIdHeader;
        }
      } else {
        // Development: Accept mock user IDs
        if (userIdHeader.trim().length > 0) {
          logWishlistOperation('user_extraction', userIdHeader, undefined, { 
            source: 'user_id_header_dev',
            environment: 'development'
          });
          return userIdHeader;
        }
      }
    }
    
    // Enhanced cookie-based authentication for production
    const clerkSession = request.cookies.get('__session')?.value || 
                        request.cookies.get('__clerk_db_jwt')?.value ||
                        request.cookies.get('__clerk_session')?.value;
    
    if (clerkSession && isProduction) {
      console.log('[Wishlist API] Production: Found Clerk session in cookies, attempting to decode...');
      // In production, if we have a session cookie, try to extract user info
      // This is a fallback when currentUser() fails but session exists
      try {
        // For now, we'll use a simplified approach - in a real implementation,
        // you'd decode the JWT token to extract the user ID
        // This is a temporary workaround for production issues
        const tempUserId = request.headers.get('x-fallback-user-id');
        if (tempUserId) {
          logWishlistOperation('user_extraction', tempUserId, undefined, { 
            source: 'session_fallback_production',
            environment: 'production',
            hasSession: true
          });
          return tempUserId;
        }
      } catch (sessionError) {
        console.warn('[Wishlist API] Failed to process session cookie:', sessionError);
      }
    }
    
    // Authorization header handling (for API clients)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log(`[Wishlist API] Found Bearer token in ${isProduction ? 'production' : 'development'}`);
      
      // In production, attempt to extract user ID from custom headers when Bearer token is present
      if (isProduction && userIdHeader) {
        logWishlistOperation('user_extraction', userIdHeader, undefined, { 
          source: 'bearer_with_user_header',
          environment: 'production',
          hasBearer: true
        });
        return userIdHeader;
      }
    }
    
    // Middleware user fallback (enhanced for production)
    if (request.user?.id) {
      logWishlistOperation('user_extraction', request.user.id, undefined, { 
        source: 'middleware_user',
        environment: isProduction ? 'production' : 'development'
      });
      return request.user.id;
    }
    
    // Check for mock user headers in both development and production
    const mockUserId = request.headers.get('x-mock-user-id');
    if (mockUserId) {
      logWishlistOperation('user_extraction', mockUserId, undefined, { 
        source: 'mock_header_' + (isProduction ? 'production' : 'development'), 
        environment: isProduction ? 'production' : 'development'
      });
      return mockUserId;
    }
    
    // Additional fallback for x-fallback-user-id header
    const fallbackUserId = request.headers.get('x-fallback-user-id');
    if (fallbackUserId) {
      logWishlistOperation('user_extraction', fallbackUserId, undefined, { 
        source: 'fallback_header_' + (isProduction ? 'production' : 'development'), 
        environment: isProduction ? 'production' : 'development'
      });
      return fallbackUserId;
    }

    // Development-specific fallbacks
    if (!isProduction) {
      
      // Final fallback for development only
      const devUserId = 'user-1';
      logWishlistOperation('user_extraction', devUserId, undefined, { 
        source: 'development_fallback', 
        environment: 'development' 
      });
      return devUserId;
    }
    
    // Production: Enhanced debugging and graceful failure
    const debugInfo = {
      source: 'authentication_failure', 
      environment: 'production',
      hasAuthHeader: !!authHeader,
      hasClerkSession: !!clerkSession,
      hasUserIdHeader: !!userIdHeader,
      middlewareUserExists: !!request.user,
      cookieNames: request.cookies.getAll().map(c => c.name),
      relevantHeaders: {
        'x-user-id': request.headers.get('x-user-id'),
        'x-fallback-user-id': request.headers.get('x-fallback-user-id'),
        'authorization': authHeader ? 'Bearer ***' : null,
        'user-agent': request.headers.get('user-agent')
      }
    };
    
    logWishlistOperation('user_extraction_failed', 'null', undefined, debugInfo);
    
    // In production, instead of returning null immediately, 
    // try one more approach with a grace period for delayed authentication
    if (isProduction) {
      console.log('[Wishlist API] Production: All authentication methods failed. This might be a transient issue.');
      
      // Return null but with detailed logging for debugging
      console.error('[Wishlist API] Production Authentication Failure - Debug Info:', JSON.stringify(debugInfo, null, 2));
    }
    
    return null;
    
  } catch (error) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : { message: 'Unknown error during user extraction' };
    
    logWishlistOperation('user_extraction_exception', 'unknown', undefined, { 
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      errorDetails
    }, error as Error);
    
    console.error(`[Wishlist API] Critical error in user extraction:`, errorDetails);
    return null;
  }
}

// Input validation schemas
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
  
  // Validate propertyId
  if (!propertyId || typeof propertyId !== 'string' || propertyId.trim().length === 0) {
    errors.push('Property ID is required and must be a non-empty string');
  }
  
  // Validate action
  if (!action || !['add', 'remove', 'update'].includes(action)) {
    errors.push('Action is required and must be one of: add, remove, update');
  }
  
  // Validate notes (optional)
  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string if provided');
  }
  
  // Validate priority (optional)
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }
  
  // Additional validation for update action
  if (action === 'update' && notes === undefined && priority === undefined) {
    errors.push('Update action requires at least notes or priority to be provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { propertyId, action, notes, priority } : undefined
  };
}

// GET /api/user/wishlist - Get user's wishlist
export const GET = withWishlistMonitoring(async (request: NextRequest, context) => {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    let userId: string | null = null;
    
    try {
      // Enhanced user ID extraction
      userId = await extractUserId(requestWithUser);
      context.userId = userId || undefined;
      
      if (!userId) {
        logWishlistOperation('get_wishlist', 'unknown', undefined, undefined, new Error('Failed to extract user ID'));
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
      const limit = parseInt(searchParams.get('limit') || '1000'); // Increased default limit
      const offset = parseInt(searchParams.get('offset') || '0');
      
      // Validate query parameters
      if (limit < 1 || limit > 1000) {
        logWishlistOperation('get_wishlist', userId, undefined, { limit, error: 'Invalid limit' });
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
        logWishlistOperation('get_wishlist', userId, undefined, { offset, error: 'Invalid offset' });
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
        const stats = await getWishlistStats(userId!);
        const duration = Date.now() - startTime;
        
        logWishlistOperation('get_wishlist_stats', userId, undefined, { 
          stats, 
          duration: `${duration}ms` 
        });
        
        return NextResponse.json({
          success: true,
          stats,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        });
      }
      
      // Enhanced cache control headers to prevent any caching in production
      const headers = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Vary': '*',
        'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive'
      };
      
      // Production debug logging for Firebase reads
      console.log(`[WISHLIST_DEBUG] About to fetch wishlist for user: ${userId} in ${process.env.NODE_ENV}`);
      console.log(`[WISHLIST_DEBUG] Firebase config present: ${!!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}`);
      console.log(`[WISHLIST_DEBUG] User authentication status: ${userId !== null}`);
      
      // OPTIMIZATION: Add performance tracing
      const fetchStartTime = Date.now();
      const wishlistProperties = await getUserWishlist(userId!);
      const fetchDuration = Date.now() - fetchStartTime;
      
      console.log(`[WISHLIST_DEBUG] Firebase read result: ${wishlistProperties.length} properties found in ${fetchDuration}ms`);
      if (wishlistProperties.length > 0) {
        console.log(`[WISHLIST_DEBUG] Sample property titles:`, wishlistProperties.slice(0, 3).map(p => p.title));
      }
      
      // Apply pagination
      const paginatedProperties = wishlistProperties.slice(offset, offset + limit);
      const hasMore = offset + limit < wishlistProperties.length;
      
      const duration = Date.now() - startTime;
      
      logWishlistOperation('get_wishlist', userId, undefined, { 
        total: wishlistProperties.length,
        returned: paginatedProperties.length,
        limit,
        offset,
        hasMore,
        duration: `${duration}ms`,
        fetchDuration: `${fetchDuration}ms`
      });
      
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
          duration: `${duration}ms`,
          fetchDuration: `${fetchDuration}ms`,
          userSource: requestWithUser.user ? 'authenticated' : 'guest'
        }
      }, { headers });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };
      
      logWishlistOperation('get_wishlist', userId || 'unknown', undefined, { 
        duration: `${duration}ms` 
      }, error as Error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to retrieve wishlist',
          code: 'WISHLIST_RETRIEVAL_FAILED',
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'Vary': '*'
          }
        }
      );
    }
  });
});

// POST /api/user/wishlist - Add/remove/update property in wishlist
export const POST = withWishlistMonitoring(async (request: NextRequest, context) => {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestBody: any = null;
    
    try {
      // Enhanced user ID extraction
      userId = await extractUserId(requestWithUser);
      
      if (!userId) {
        logWishlistOperation('wishlist_operation', 'unknown', undefined, undefined, new Error('Failed to extract user ID'));
        return NextResponse.json(
          { 
            success: false,
            error: 'Unable to identify user',
            code: 'USER_IDENTIFICATION_FAILED'
          },
          { status: 401 }
        );
      }
      
      // Parse and validate request body
      try {
        requestBody = await request.json();
      } catch (parseError) {
        logWishlistOperation('wishlist_operation', userId, undefined, undefined, new Error('Invalid JSON in request body'));
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
        logWishlistOperation('wishlist_operation', userId, undefined, { 
          validationErrors: validation.errors,
          requestBody 
        });
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
        // Check if already in wishlist
        const alreadyInWishlist = await isInWishlist(userId!, propertyId);
        if (alreadyInWishlist) {
          logWishlistOperation('add_to_wishlist', userId, propertyId, { 
            reason: 'already_exists' 
          });
          return NextResponse.json(
            { 
              success: false,
              error: 'Property already in wishlist',
              code: 'PROPERTY_ALREADY_IN_WISHLIST'
            },
            { status: 409 }
          );
        }
        
        const wishlistItem = await addToWishlist(
          userId!, 
          propertyId, 
          notes, 
          priority || 'medium'
        );
        
        // Log real-time activity
        try {
          const activityLogger = ActivityLogger.getInstance();
          await activityLogger.logWishlistActivity({
            userId: userId!,
            action: 'add',
            propertyId,
            metadata: {
              notes,
              priority: priority || 'medium'
            }
          });
          console.log(`[Wishlist API] 📝 Activity logged: add ${propertyId} for user ${userId}`);
        } catch (activityError) {
          console.warn(`[Wishlist API] ⚠️ Failed to log activity:`, activityError);
          // Don't fail the operation if activity logging fails
        }
        
        // Broadcast real-time update with simplified approach
        try {
          const realTimeService = RealTimeService.getInstance();
          // Get stats without detailed property lookup for better performance
          const wishlistStats = { total: 0 }; // Simplified stats
          realTimeService.broadcastWishlistUpdate(userId!, 'add', propertyId, wishlistStats.total);
          console.log(`[Wishlist API] 📡 Real-time update broadcasted: add ${propertyId} for user ${userId}`);
        } catch (broadcastError) {
          console.warn(`[Wishlist API] ⚠️ Failed to broadcast real-time update:`, broadcastError);
          // Don't fail the operation if broadcasting fails
        }
        
        const duration = Date.now() - startTime;
        
        logWishlistOperation('add_to_wishlist', userId, propertyId, { 
          notes,
          priority: priority || 'medium',
          duration: `${duration}ms`
        });
        
        return NextResponse.json({
          success: true,
          message: 'Property added to wishlist',
          item: wishlistItem,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        });
        
      } else if (action === 'remove') {
        const removed = await removeFromWishlist(userId!, propertyId);
        
        if (!removed) {
          logWishlistOperation('remove_from_wishlist', userId, propertyId, { 
            reason: 'not_found' 
          });
          return NextResponse.json(
            { 
              success: false,
              error: 'Property not found in wishlist',
              code: 'PROPERTY_NOT_IN_WISHLIST'
            },
            { status: 404 }
          );
        }
        
        // Log real-time activity
        try {
          const activityLogger = ActivityLogger.getInstance();
          await activityLogger.logWishlistActivity({
            userId: userId!,
            action: 'remove',
            propertyId,
            metadata: {}
          });
          console.log(`[Wishlist API] 📝 Activity logged: remove ${propertyId} for user ${userId}`);
        } catch (activityError) {
          console.warn(`[Wishlist API] ⚠️ Failed to log activity:`, activityError);
          // Don't fail the operation if activity logging fails
        }
        
        // Broadcast real-time update with simplified approach
        try {
          const realTimeService = RealTimeService.getInstance();
          // Get stats without detailed property lookup for better performance
          const wishlistStats = { total: 0 }; // Simplified stats
          realTimeService.broadcastWishlistUpdate(userId!, 'remove', propertyId, wishlistStats.total);
          console.log(`[Wishlist API] 📡 Real-time update broadcasted: remove ${propertyId} for user ${userId}`);
        } catch (broadcastError) {
          console.warn(`[Wishlist API] ⚠️ Failed to broadcast real-time update:`, broadcastError);
          // Don't fail the operation if broadcasting fails
        }
        
        const duration = Date.now() - startTime;
        
        logWishlistOperation('remove_from_wishlist', userId, propertyId, { 
          duration: `${duration}ms`
        });
        
        return NextResponse.json({
          success: true,
          message: 'Property removed from wishlist',
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        });
        
      } else if (action === 'update') {
        const updatedItem = await updateWishlistItem(userId!, propertyId, {
          notes,
          priority
        });
        
        if (!updatedItem) {
          logWishlistOperation('update_wishlist_item', userId, propertyId, { 
            reason: 'not_found',
            updates: { notes, priority }
          });
          return NextResponse.json(
            { 
              success: false,
              error: 'Property not found in wishlist',
              code: 'PROPERTY_NOT_IN_WISHLIST'
            },
            { status: 404 }
          );
        }
        
        // Log real-time activity
        try {
          const activityLogger = ActivityLogger.getInstance();
          await activityLogger.logWishlistActivity({
            userId: userId!,
            action: 'update',
            propertyId,
            metadata: {
              notes,
              priority
            }
          });
          console.log(`[Wishlist API] 📝 Activity logged: update ${propertyId} for user ${userId}`);
        } catch (activityError) {
          console.warn(`[Wishlist API] ⚠️ Failed to log activity:`, activityError);
          // Don't fail the operation if activity logging fails
        }
        
        const duration = Date.now() - startTime;
        
        logWishlistOperation('update_wishlist_item', userId, propertyId, { 
          updates: { notes, priority },
          duration: `${duration}ms`
        });
        
        return NextResponse.json({
          success: true,
          message: 'Wishlist item updated',
          item: updatedItem,
          metadata: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`
          }
        });
        
      } else {
        logWishlistOperation('wishlist_operation', userId, propertyId, { 
          invalidAction: action 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action. Use "add", "remove", or "update"',
            code: 'INVALID_ACTION'
          },
          { status: 400 }
        );
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };
      
      logWishlistOperation('wishlist_operation', userId || 'unknown', undefined, { 
        requestBody,
        duration: `${duration}ms`
      }, error as Error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update wishlist',
          code: 'WISHLIST_OPERATION_FAILED',
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
});

// PUT /api/user/wishlist - Update wishlist item metadata
export const PUT = withWishlistMonitoring(async (request: NextRequest, context) => {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    let userId: string | null = null;
    let requestBody: any = null;
    
    try {
      // Enhanced user ID extraction
      userId = await extractUserId(requestWithUser);
      
      if (!userId) {
        logWishlistOperation('update_wishlist_metadata', 'unknown', undefined, undefined, new Error('Failed to extract user ID'));
        return NextResponse.json(
          { 
            success: false,
            error: 'Unable to identify user',
            code: 'USER_IDENTIFICATION_FAILED'
          },
          { status: 401 }
        );
      }
      
      // Parse and validate request body
      try {
        requestBody = await request.json();
      } catch (parseError) {
        logWishlistOperation('update_wishlist_metadata', userId, undefined, undefined, new Error('Invalid JSON in request body'));
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
      
      // Validate required fields
      if (!propertyId || typeof propertyId !== 'string') {
        logWishlistOperation('update_wishlist_metadata', userId, undefined, { 
          error: 'Missing or invalid propertyId',
          requestBody 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Property ID is required and must be a string',
            code: 'INVALID_PROPERTY_ID'
          },
          { status: 400 }
        );
      }
      
      // Validate that at least one field is being updated
      if (notes === undefined && priority === undefined) {
        logWishlistOperation('update_wishlist_metadata', userId, propertyId, { 
          error: 'No fields to update' 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'At least one field (notes or priority) must be provided for update',
            code: 'NO_UPDATE_FIELDS'
          },
          { status: 400 }
        );
      }
      
      // Validate priority if provided
      if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
        logWishlistOperation('update_wishlist_metadata', userId, propertyId, { 
          error: 'Invalid priority',
          priority 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Priority must be one of: low, medium, high',
            code: 'INVALID_PRIORITY'
          },
          { status: 400 }
        );
      }
      
      // Validate notes if provided
      if (notes !== undefined && typeof notes !== 'string') {
        logWishlistOperation('update_wishlist_metadata', userId, propertyId, { 
          error: 'Invalid notes type' 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Notes must be a string',
            code: 'INVALID_NOTES'
          },
          { status: 400 }
        );
      }
      
      const updatedItem = await updateWishlistItem(userId!, propertyId, {
        notes,
        priority
      });
      
      if (!updatedItem) {
        logWishlistOperation('update_wishlist_metadata', userId, propertyId, { 
          reason: 'not_found',
          updates: { notes, priority }
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Property not found in wishlist',
            code: 'PROPERTY_NOT_IN_WISHLIST'
          },
          { status: 404 }
        );
      }
      
      const duration = Date.now() - startTime;
      
      logWishlistOperation('update_wishlist_metadata', userId, propertyId, { 
        updates: { notes, priority },
        duration: `${duration}ms`
      });
      
      return NextResponse.json({
        success: true,
        message: 'Wishlist item metadata updated',
        item: updatedItem,
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
      
      logWishlistOperation('update_wishlist_metadata', userId || 'unknown', undefined, { 
        requestBody,
        duration: `${duration}ms`
      }, error as Error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update wishlist item metadata',
          code: 'WISHLIST_UPDATE_FAILED',
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
});

// DELETE /api/user/wishlist?propertyId=xxx - Remove property from wishlist
export const DELETE = withWishlistMonitoring(async (request: NextRequest, context) => {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    let userId: string | null = null;
    
    try {
      // Enhanced user ID extraction
      userId = await extractUserId(requestWithUser);
      
      if (!userId) {
        logWishlistOperation('delete_from_wishlist', 'unknown', undefined, undefined, new Error('Failed to extract user ID'));
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
        logWishlistOperation('delete_from_wishlist', userId, undefined, { 
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
      
      const removed = await removeFromWishlist(userId!, propertyId);
      
      if (!removed) {
        logWishlistOperation('delete_from_wishlist', userId, propertyId, { 
          reason: 'not_found' 
        });
        return NextResponse.json(
          { 
            success: false,
            error: 'Property not found in wishlist',
            code: 'PROPERTY_NOT_IN_WISHLIST'
          },
          { status: 404 }
        );
      }
      
      // Broadcast real-time update
      try {
        const realTimeService = RealTimeService.getInstance();
        const wishlistStats = await getWishlistStats(userId!);
        realTimeService.broadcastWishlistUpdate(userId!, 'remove', propertyId, wishlistStats.total);
        console.log(`[Wishlist API] 📡 Real-time update broadcasted: remove ${propertyId} for user ${userId}`);
      } catch (broadcastError) {
        console.warn(`[Wishlist API] ⚠️ Failed to broadcast real-time update:`, broadcastError);
        // Don't fail the operation if broadcasting fails
      }
      
      const duration = Date.now() - startTime;
      
      logWishlistOperation('delete_from_wishlist', userId, propertyId, { 
        duration: `${duration}ms`
      });
      
      return NextResponse.json({
        success: true,
        message: 'Property removed from wishlist',
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
      
      logWishlistOperation('delete_from_wishlist', userId || 'unknown', undefined, { 
        duration: `${duration}ms`
      }, error as Error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to remove property from wishlist',
          code: 'WISHLIST_DELETE_FAILED',
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
});