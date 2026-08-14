import { NextRequest, NextResponse } from 'next/server';
import { getConfigHealth } from '@/lib/config/validation';

export async function GET(request: NextRequest) {
  try {
    const health = getConfigHealth();
    
    const response = {
      success: true,
      environment: process.env.NODE_ENV,
      status: health.status,
      timestamp: new Date().toISOString(),
      configuration: {
        hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasFirebaseDatabaseUrl: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        firebaseDatabaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      },
      validation: health.details
    };
    
    // Return appropriate status code based on validation result
    const statusCode = health.status === 'error' ? 500 : 
                      health.status === 'warning' ? 200 : 200;
    
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Configuration health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}