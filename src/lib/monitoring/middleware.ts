import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from './performance';
import { AnalyticsTracker } from './analytics';
import { ErrorTracker } from './error-tracking';

export interface MonitoringContext {
  requestId: string;
  startTime: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Monitoring middleware to track API performance and usage
 */
export function withMonitoring<T extends any[]>(
  handler: (request: NextRequest, context: MonitoringContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Extract request context
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const sessionId = request.headers.get('x-session-id') || 
                     request.cookies.get('session-id')?.value ||
                     'unknown-session';
    
    // Get monitoring instances
    const performanceMonitor = PerformanceMonitor.getInstance();
    const analyticsTracker = AnalyticsTracker.getInstance();
    const errorTracker = ErrorTracker.getInstance();
    
    const context: MonitoringContext = {
      requestId,
      startTime,
      sessionId,
      userAgent,
      ipAddress
    };
    
    // Extract endpoint info
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;
    
    console.log(`[Monitoring] 📊 ${method} ${endpoint} - Request ${requestId} started`);
    
    // Record API request metric
    performanceMonitor.recordMetric('api_requests', 1, 'count', {
      endpoint,
      method,
      requestId
    });
    
    let response: NextResponse;
    let statusCode = 200;
    
    try {
      // Call the actual handler
      response = await handler(request, context, ...args);
      statusCode = response.status;
      
      // Extract user ID from response if available
      try {
        const responseBody = await response.clone().json();
        if (responseBody.user?.id) {
          context.userId = responseBody.user.id;
        }
      } catch {
        // Ignore JSON parsing errors for non-JSON responses
      }
      
    } catch (error) {
      statusCode = 500;
      
      // Track the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      errorTracker.trackAPIError(
        endpoint,
        method,
        statusCode,
        errorMessage,
        context.userId
      );
      
      // Record error metric
      performanceMonitor.recordMetric('api_errors', 1, 'count', {
        endpoint,
        method,
        statusCode,
        error: errorMessage,
        requestId
      });
      
      console.error(`[Monitoring] ❌ ${method} ${endpoint} - Request ${requestId} failed:`, error);
      
      // Return error response
      response = NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          requestId
        },
        { status: 500 }
      );
    }
    
    const duration = Date.now() - startTime;
    
    // Record performance metrics
    performanceMonitor.recordMetric('response_time', duration, 'ms', {
      endpoint,
      method,
      statusCode,
      requestId
    });
    
    // Track analytics
    analyticsTracker.track(
      'api_request',
      'navigation',
      {
        endpoint,
        method,
        statusCode,
        duration,
        success: statusCode < 400
      },
      context.userId,
      context.sessionId,
      context.userAgent,
      context.ipAddress
    );
    
    // Log completion
    const logLevel = statusCode >= 400 ? '❌' : '✅';
    console.log(`[Monitoring] ${logLevel} ${method} ${endpoint} - Request ${requestId} completed in ${duration}ms (${statusCode})`);
    
    // Add monitoring headers to response
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', `${duration}ms`);
    
    return response;
  };
}

/**
 * Middleware specifically for wishlist operations
 */
export function withWishlistMonitoring(
  handler: (request: NextRequest, context: MonitoringContext) => Promise<NextResponse>
) {
  return withMonitoring(async (request: NextRequest, context: MonitoringContext) => {
    const analyticsTracker = AnalyticsTracker.getInstance();
    
    // Parse request body for wishlist-specific tracking
    try {
      if (request.method === 'POST' || request.method === 'PUT') {
        const body = await request.clone().json();
        const { action, propertyId } = body;
        
        if (action && propertyId) {
          // Track wishlist action
          analyticsTracker.trackWishlistAction(
            action,
            propertyId,
            context.userId,
            context.sessionId,
            {
              endpoint: new URL(request.url).pathname,
              userAgent: context.userAgent
            }
          );
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }
    
    return handler(request, context);
  });
}

/**
 * Middleware specifically for activity tracking
 */
export function withActivityMonitoring(
  handler: (request: NextRequest, context: MonitoringContext) => Promise<NextResponse>
) {
  return withMonitoring(async (request: NextRequest, context: MonitoringContext) => {
    const analyticsTracker = AnalyticsTracker.getInstance();
    
    // Track activity-related requests
    const url = new URL(request.url);
    const endpoint = url.pathname;
    
    if (endpoint.includes('/activity')) {
      analyticsTracker.trackActivity(
        'api_access',
        context.userId,
        undefined,
        context.sessionId,
        {
          endpoint,
          method: request.method,
          userAgent: context.userAgent
        }
      );
    }
    
    return handler(request, context);
  });
}

/**
 * Real-time connection monitoring
 */
export function monitorRealTimeConnection(
  connectionId: string,
  userId: string | undefined,
  connectionType: 'sse' | 'websocket' | 'polling'
): () => void {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const analyticsTracker = AnalyticsTracker.getInstance();
  
  // Record connection establishment
  performanceMonitor.recordConnection(connectionId, userId, connectionType);
  
  // Track analytics
  analyticsTracker.track(
    'realtime_connection',
    'activity',
    {
      connectionType,
      connectionId
    },
    userId
  );
  
  console.log(`[Monitoring] 🔗 Real-time connection established: ${connectionId} (${connectionType})`);
  
  // Return cleanup function
  return () => {
    performanceMonitor.recordDisconnection(connectionId, 'normal_closure');
    
    analyticsTracker.track(
      'realtime_disconnection',
      'activity',
      {
        connectionType,
        connectionId
      },
      userId
    );
    
    console.log(`[Monitoring] 🔌 Real-time connection closed: ${connectionId}`);
  };
}

/**
 * Monitor real-time connection errors
 */
export function monitorRealTimeError(
  connectionId: string,
  error: string,
  userId?: string
): void {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const errorTracker = ErrorTracker.getInstance();
  
  // Record connection error
  performanceMonitor.recordConnectionError(connectionId, error);
  
  // Track error
  errorTracker.trackConnectionError(connectionId, 'sse', error, userId);
  
  console.log(`[Monitoring] ❌ Real-time connection error: ${connectionId} - ${error}`);
}

/**
 * Monitor client-side errors
 */
export function monitorClientError(
  message: string,
  stack: string,
  url: string,
  userId?: string,
  component?: string
): void {
  const errorTracker = ErrorTracker.getInstance();
  
  errorTracker.trackClientError(message, stack, url, userId, component);
  
  console.log(`[Monitoring] 🚨 Client error tracked: ${message}`);
}

/**
 * Get monitoring summary for health checks
 */
export function getMonitoringSummary(): {
  performance: any;
  errors: any;
  connections: any;
  timestamp: string;
} {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const errorTracker = ErrorTracker.getInstance();
  
  return {
    performance: {
      connectionStats: performanceMonitor.getConnectionStats(),
      systemHealth: performanceMonitor.getLatestSystemHealth()
    },
    errors: {
      stats: errorTracker.getErrorStats(60),
      unacknowledgedAlerts: errorTracker.getSystemHealthAlerts(false).length
    },
    connections: performanceMonitor.getConnectionStats(),
    timestamp: new Date().toISOString()
  };
}