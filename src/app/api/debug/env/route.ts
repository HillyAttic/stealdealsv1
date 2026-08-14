import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check environment variables in production
export async function GET(request: NextRequest) {
  // Only allow in development or with specific debug token
  const debugToken = request.nextUrl.searchParams.get('debug');
  const isDebugAllowed = process.env.NODE_ENV === 'development' || 
                        debugToken === 'stealdeals_debug_2024';
  
  if (!isDebugAllowed) {
    return NextResponse.json(
      { error: 'Debug endpoint not available' },
      { status: 403 }
    );
  }

  // Environment variables check
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // Firebase configuration
    NEXT_PUBLIC_FIREBASE_API_KEY: {
      exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    },
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
      exists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    FIREBASE_SERVICE_ACCOUNT_KEY: {
      exists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    },

    // Admin configuration
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_EXISTS: !!process.env.ADMIN_PASSWORD,

    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      isPlaceholder: process.env.JWT_SECRET?.includes('your_production_jwt_secret_change_this_in_production') || false
    },
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: envCheck
  });
}