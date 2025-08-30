import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringSummary } from '@/lib/monitoring/middleware';
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { ErrorTracker } from '@/lib/monitoring/error-tracking';
import { RealTimeService } from '@/lib/realtime/service';

/**
 * Health check endpoint for system monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get monitoring instances
    const performanceMonitor = PerformanceMonitor.getInstance();
    const errorTracker = ErrorTracker.getInstance();
    const realTimeService = RealTimeService.getInstance();
    
    // Collect health data
    const systemHealth = performanceMonitor.getLatestSystemHealth();
    const connectionStats = performanceMonitor.getConnectionStats();
    const errorStats = errorTracker.getErrorStats(5); // Last 5 minutes
    const realTimeStats = realTimeService.getConnectionStats();
    const unacknowledgedAlerts = errorTracker.getSystemHealthAlerts(false);
    
    // Calculate overall health score
    let healthScore = 100;
    
    // Deduct points for high error rate
    if (errorStats.errorRate > 5) {
      healthScore -= Math.min(30, errorStats.errorRate * 2);
    }
    
    // Deduct points for high memory usage
    if (systemHealth && systemHealth.memoryUsage.percentage > 80) {
      healthScore -= Math.min(20, (systemHealth.memoryUsage.percentage - 80) * 2);
    }
    
    // Deduct points for unacknowledged alerts
    if (unacknowledgedAlerts.length > 0) {
      healthScore -= Math.min(25, unacknowledgedAlerts.length * 5);
    }
    
    // Deduct points for connection errors
    if (connectionStats.errorRate > 10) {
      healthScore -= Math.min(15, connectionStats.errorRate);
    }
    
    healthScore = Math.max(0, healthScore);
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthScore >= 80) {
      status = 'healthy';
    } else if (healthScore >= 50) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    const duration = Date.now() - startTime;
    
    // Record health check metric
    performanceMonitor.recordMetric('health_check', duration, 'ms', {
      status,
      healthScore
    });
    
    const healthData = {
      status,
      healthScore,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      
      system: {
        memory: systemHealth ? {
          used: systemHealth.memoryUsage.used,
          total: systemHealth.memoryUsage.total,
          percentage: systemHealth.memoryUsage.percentage
        } : null,
        
        performance: {
          averageResponseTime: systemHealth?.averageResponseTime || 0,
          throughput: systemHealth?.throughput || 0
        }
      },
      
      connections: {
        total: connectionStats.total,
        active: connectionStats.active,
        errorRate: connectionStats.errorRate,
        averageDuration: connectionStats.averageDuration,
        realTime: {
          total: realTimeStats.totalConnections,
          active: realTimeStats.totalConnections,
          byType: realTimeStats.userConnections + realTimeStats.globalConnections
        }
      },
      
      errors: {
        total: errorStats.total,
        rate: errorStats.errorRate,
        resolved: errorStats.resolved,
        unresolved: errorStats.unresolved,
        alerts: unacknowledgedAlerts.length
      },
      
      services: {
        database: 'operational', // Could be enhanced with actual DB health check
        realTime: realTimeStats.totalConnections >= 0 ? 'operational' : 'degraded',
        monitoring: 'operational'
      },
      
      metadata: {
        requestId: crypto.randomUUID(),
        duration: `${duration}ms`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
    
    // Return appropriate HTTP status based on health
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthData, { status: httpStatus });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    
    // Track the error
    try {
      const errorTracker = ErrorTracker.getInstance();
      errorTracker.trackAPIError('/api/health', 'GET', 500, errorMessage);
    } catch {
      // Ignore if error tracking fails
    }
    
    console.error('[Health Check] Error during health check:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        healthScore: 0,
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        metadata: {
          requestId: crypto.randomUUID(),
          duration: `${duration}ms`,
          error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal error'
        }
      },
      { status: 503 }
    );
  }
}

/**
 * Detailed health check with extended diagnostics
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { includeMetrics = false, includeErrors = false } = body;
    
    // Get basic health data
    const basicHealth = await GET(request);
    const basicData = await basicHealth.json();
    
    if (!includeMetrics && !includeErrors) {
      return NextResponse.json(basicData);
    }
    
    const performanceMonitor = PerformanceMonitor.getInstance();
    const errorTracker = ErrorTracker.getInstance();
    
    const extendedData = { ...basicData };
    
    if (includeMetrics) {
      extendedData.metrics = {
        responseTime: performanceMonitor.getMetrics('response_time', 50),
        apiRequests: performanceMonitor.getMetrics('api_requests', 50),
        apiErrors: performanceMonitor.getMetrics('api_errors', 50),
        memoryUsage: performanceMonitor.getMetrics('memory_usage', 50),
        systemHealth: performanceMonitor.getSystemHealth(10)
      };
    }
    
    if (includeErrors) {
      extendedData.recentErrors = errorTracker.getErrors({
        limit: 20,
        resolved: false,
        since: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }).map(error => ({
        id: error.id,
        level: error.level,
        message: error.message,
        timestamp: error.timestamp,
        component: error.context.component,
        resolved: error.resolved
      }));
      
      extendedData.alerts = errorTracker.getSystemHealthAlerts(false).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp
      }));
    }
    
    const duration = Date.now() - startTime;
    extendedData.metadata.duration = `${duration}ms`;
    extendedData.metadata.extended = true;
    
    return NextResponse.json(extendedData, { status: basicHealth.status });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Extended health check failed';
    
    console.error('[Health Check] Error during extended health check:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        healthScore: 0,
        timestamp: new Date().toISOString(),
        error: 'Extended health check failed',
        metadata: {
          requestId: crypto.randomUUID(),
          duration: `${duration}ms`,
          error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal error'
        }
      },
      { status: 503 }
    );
  }
}