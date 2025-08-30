import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck, collectSystemMetrics, validateSystemConfiguration } from '@/lib/integration/system-integration';

// GET /api/system/health - Comprehensive system health check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    
    // Basic health check
    const healthChecks = await performHealthCheck();
    const systemMetrics = collectSystemMetrics();
    const configValidation = validateSystemConfiguration();
    
    const overallHealth = Object.values(healthChecks).every(check => check === true);
    
    const response = {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: systemMetrics.uptime,
      environment: systemMetrics.environment,
      version: process.env.npm_package_version || '1.0.0',
      checks: healthChecks,
      configuration: {
        isValid: configValidation.isValid,
        missingRequired: configValidation.missingRequired,
        missingOptional: configValidation.missingOptional
      }
    };
    
    if (detailed) {
      response.metrics = systemMetrics;
      response.configDetails = configValidation.configuration;
    }
    
    return NextResponse.json(response, {
      status: overallHealth ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}

// HEAD /api/system/health - Quick health check for load balancers
export async function HEAD(request: NextRequest) {
  try {
    const healthChecks = await performHealthCheck();
    const overallHealth = Object.values(healthChecks).every(check => check === true);
    
    return new NextResponse(null, {
      status: overallHealth ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}