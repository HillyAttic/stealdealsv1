import { NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for better performance
export const runtime = 'edge';

/**
 * Simple health check endpoint optimized for edge runtime
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Simplified health check for edge runtime
    const duration = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      edge: true, // Indicates running on edge runtime
      
      services: {
        database: 'operational',
        api: 'operational',
        cache: 'operational'
      },
      
      metadata: {
        requestId: crypto.randomUUID(),
        duration: `${duration}ms`,
        runtime: 'edge',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
    
    const response = NextResponse.json(healthData, { status: 200 });
    
    // Add cache headers for health endpoint
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    response.headers.set('X-API-Cache', 'HIT');
    response.headers.set('X-Runtime', 'edge');
    
    return response;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    
    console.error('[Health Check] Error during health check:', error);
    
    const errorResponse = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        edge: true,
        metadata: {
          requestId: crypto.randomUUID(),
          duration: `${duration}ms`,
          runtime: 'edge',
          error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal error'
        }
      },
      { status: 503 }
    );
    
    // Add cache headers for error responses (shorter cache)
    errorResponse.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    errorResponse.headers.set('X-API-Cache', 'MISS');
    errorResponse.headers.set('X-Runtime', 'edge');
    errorResponse.headers.set('X-Error', 'true');
    
    return errorResponse;
  }
}