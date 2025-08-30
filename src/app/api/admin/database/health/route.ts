import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { monitoringService } from '@/lib/database/monitoring';

// GET /api/admin/database/health - Get database health status
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      // Check if user is admin (simplified check - implement proper admin role checking)
      const userId = authenticatedRequest.user.id;
      
      // For demo purposes, allow specific user IDs to access admin endpoints
      const adminUsers = ['user-1', 'user-2', 'admin-1'];
      if (!adminUsers.includes(userId)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Access denied. Admin privileges required.',
            code: 'INSUFFICIENT_PRIVILEGES'
          },
          { status: 403 }
        );
      }
      
      const { searchParams } = new URL(request.url);
      const includeHistory = searchParams.get('history') === 'true';
      const includeRecommendations = searchParams.get('recommendations') === 'true';
      const includeReport = searchParams.get('report') === 'true';
      
      const startTime = Date.now();
      
      // Get current health status
      const health = await monitoringService.getHealthStatus();
      const metrics = monitoringService.getPerformanceMetrics();
      
      const response: any = {
        success: true,
        timestamp: new Date().toISOString(),
        health,
        metrics
      };
      
      // Include history if requested
      if (includeHistory) {
        const historyLimit = parseInt(searchParams.get('historyLimit') || '50');
        response.history = {
          health: monitoringService.getHealthHistory(historyLimit),
          performance: monitoringService.getPerformanceHistory(historyLimit)
        };
      }
      
      // Include recommendations if requested
      if (includeRecommendations) {
        response.recommendations = await monitoringService.getOptimizationRecommendations();
      }
      
      // Include full report if requested
      if (includeReport) {
        response.report = await monitoringService.generatePerformanceReport();
      }
      
      const duration = Date.now() - startTime;
      response.metadata = {
        requestId: crypto.randomUUID(),
        duration: `${duration}ms`,
        generatedAt: new Date().toISOString()
      };
      
      console.log(`[Database Health API] ✅ Health check completed for admin ${userId} (${duration}ms)`);
      
      return NextResponse.json(response);
      
    } catch (error) {
      console.error('[Database Health API] ❌ Error getting database health:', error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get database health status',
          code: 'HEALTH_CHECK_FAILED',
          details: process.env.NODE_ENV === 'development' ? {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          } : undefined
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/admin/database/health - Trigger manual health check or reset monitoring
export async function POST(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      // Check if user is admin
      const userId = authenticatedRequest.user.id;
      const adminUsers = ['user-1', 'user-2', 'admin-1'];
      
      if (!adminUsers.includes(userId)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Access denied. Admin privileges required.',
            code: 'INSUFFICIENT_PRIVILEGES'
          },
          { status: 403 }
        );
      }
      
      const body = await request.json();
      const { action } = body;
      
      const startTime = Date.now();
      let result: any = {};
      
      switch (action) {
        case 'reset':
          monitoringService.reset();
          result = {
            action: 'reset',
            message: 'Monitoring data has been reset'
          };
          break;
          
        case 'health_check':
          const health = await monitoringService.getHealthStatus();
          const metrics = monitoringService.getPerformanceMetrics();
          result = {
            action: 'health_check',
            health,
            metrics
          };
          break;
          
        case 'generate_report':
          const report = await monitoringService.generatePerformanceReport();
          result = {
            action: 'generate_report',
            report
          };
          break;
          
        default:
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid action. Supported actions: reset, health_check, generate_report',
              code: 'INVALID_ACTION'
            },
            { status: 400 }
          );
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`[Database Health API] ✅ Action '${action}' completed for admin ${userId} (${duration}ms)`);
      
      return NextResponse.json({
        success: true,
        ...result,
        metadata: {
          requestId: crypto.randomUUID(),
          duration: `${duration}ms`,
          executedAt: new Date().toISOString(),
          executedBy: userId
        }
      });
      
    } catch (error) {
      console.error('[Database Health API] ❌ Error executing database health action:', error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to execute database health action',
          code: 'HEALTH_ACTION_FAILED',
          details: process.env.NODE_ENV === 'development' ? {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          } : undefined
        },
        { status: 500 }
      );
    }
  });
}