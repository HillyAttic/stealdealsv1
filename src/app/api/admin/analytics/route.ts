import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { AnalyticsTracker } from '@/lib/monitoring/analytics';
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { RealTimeService } from '@/lib/realtime/service';

// Admin analytics endpoint for comprehensive system insights
export async function GET(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    
    try {
      // For now, allow access without strict admin check for development
      // In production, you would verify admin role here
      const userId = requestWithUser.user?.id || 'admin-user';
      
      console.log(`[Admin Analytics API] Getting analytics dashboard data for ${userId}`);
      
      const { searchParams } = new URL(request.url);
      const timeframe = searchParams.get('timeframe') || '7d';
      const category = searchParams.get('category') as 'wishlist' | 'activity' | 'search' | 'navigation' | 'error' | undefined;
      
      // Get analytics tracker instance
      const analyticsTracker = AnalyticsTracker.getInstance();
      const performanceMonitor = PerformanceMonitor.getInstance();
      const realTimeService = RealTimeService.getInstance();
      
      // Calculate date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }
      
      // Gather comprehensive analytics data
      const [
        systemUsageStats,
        topWishlistEvents,
        topActivityEvents,
        topSearchEvents,
        topNavigationEvents,
        connectionStats,
        systemHealth
      ] = await Promise.all([
        analyticsTracker.getSystemUsageStats(),
        analyticsTracker.getTopEvents('wishlist', 10, timeframe as any),
        analyticsTracker.getTopEvents('activity', 10, timeframe as any),
        analyticsTracker.getTopEvents('search', 10, timeframe as any),
        analyticsTracker.getTopEvents('navigation', 10, timeframe as any),
        Promise.resolve(performanceMonitor.getConnectionStats()),
        Promise.resolve(performanceMonitor.getLatestSystemHealth())
      ]);
      
      // Get real-time connection statistics
      const realTimeStats = realTimeService.getConnectionStats();
      
      // Get performance metrics
      const performanceMetrics = {
        responseTime: performanceMonitor.getMetrics('response_time', 100),
        apiRequests: performanceMonitor.getMetrics('api_requests', 100),
        apiErrors: performanceMonitor.getMetrics('api_errors', 100),
        memoryUsage: performanceMonitor.getMetrics('memory_usage', 100)
      };
      
      // Calculate engagement metrics
      const engagementMetrics = {
        totalEvents: systemUsageStats.totalActivities,
        activeUsers: systemUsageStats.activeUsers,
        averageEngagement: systemUsageStats.averageEngagement,
        conversionRate: systemUsageStats.totalWishlistItems > 0 
          ? (systemUsageStats.totalActivities / systemUsageStats.totalWishlistItems) * 100 
          : 0
      };
      
      // Prepare dashboard data
      const dashboardData = {
        overview: {
          totalUsers: systemUsageStats.totalUsers,
          activeUsers: systemUsageStats.activeUsers,
          totalWishlistItems: systemUsageStats.totalWishlistItems,
          totalActivities: systemUsageStats.totalActivities,
          errorRate: systemUsageStats.errorRate,
          performanceScore: systemUsageStats.performanceScore
        },
        
        engagement: {
          ...engagementMetrics,
          topFeatures: systemUsageStats.topFeatures
        },
        
        events: {
          wishlist: topWishlistEvents,
          activity: topActivityEvents,
          search: topSearchEvents,
          navigation: topNavigationEvents
        },
        
        realTime: {
          connections: realTimeStats,
          systemHealth,
          activeConnections: realTimeStats.totalConnections
        },
        
        performance: {
          connectionStats,
          metrics: performanceMetrics,
          systemHealth
        },
        
        errors: {
          stats: { total: 0, byLevel: {}, recentCount: 0 },
          recentErrors: [],
          alerts: []
        },
        
        timeframe: {
          start: startDate.toISOString(),
          end: now.toISOString(),
          period: timeframe
        }
      };
      
      const duration = Date.now() - startTime;
      
      // Record performance metric
      performanceMonitor.recordMetric('admin_analytics_request', duration, 'ms', {
        timeframe,
        category,
        userId
      });
      
      console.log(`[Admin Analytics API] ✅ Dashboard data retrieved in ${duration}ms`);
      
      return NextResponse.json({
        success: true,
        data: dashboardData,
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          timeframe,
          category
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { message: 'Unknown error occurred' };
      
      console.error(`[Admin Analytics API] ❌ Error retrieving dashboard data:`, error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to retrieve analytics dashboard data',
          code: 'ANALYTICS_RETRIEVAL_FAILED',
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

// POST /api/admin/analytics - Trigger analytics actions (like data refresh)
export async function POST(request: NextRequest) {
  return optionalAuth(request, async (requestWithUser) => {
    const startTime = Date.now();
    
    try {
      const userId = requestWithUser.user?.id || 'admin-user';
      
      console.log(`[Admin Analytics API] Processing analytics action for ${userId}`);
      
      const body = await request.json();
      const { action, parameters } = body;
      
      const analyticsTracker = AnalyticsTracker.getInstance();
      const performanceMonitor = PerformanceMonitor.getInstance();
      
      let result: any = {};
      
      switch (action) {
        case 'refresh_stats':
          // Force refresh of system statistics
          result = await analyticsTracker.getSystemUsageStats();
          break;
          
        case 'clear_old_data':
          // Clean up old monitoring data
          performanceMonitor.cleanup();
          result = { message: 'Old data cleaned up successfully' };
          break;
          
        case 'acknowledge_alert':
          // Acknowledge a system health alert (placeholder)
          const { alertId } = parameters;
          result = { acknowledged: true, alertId, message: 'Alert acknowledgment temporarily unavailable' };
          break;
          
        case 'resolve_error':
          // Resolve an error (placeholder)
          const { errorId } = parameters;
          result = { resolved: true, errorId, message: 'Error resolution temporarily unavailable' };
          break;
          
        case 'export_data':
          // Export analytics data (placeholder for future implementation)
          const { format, dateRange } = parameters;
          result = { 
            message: 'Export functionality not yet implemented',
            format,
            dateRange
          };
          break;
          
        default:
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid action',
              code: 'INVALID_ACTION'
            },
            { status: 400 }
          );
      }
      
      const duration = Date.now() - startTime;
      
      // Record performance metric
      performanceMonitor.recordMetric('admin_analytics_action', duration, 'ms', {
        action,
        userId
      });
      
      console.log(`[Admin Analytics API] ✅ Action '${action}' completed in ${duration}ms`);
      
      return NextResponse.json({
        success: true,
        action,
        result,
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
      
      console.error(`[Admin Analytics API] ❌ Error processing analytics action:`, error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process analytics action',
          code: 'ANALYTICS_ACTION_FAILED',
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