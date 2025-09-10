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
    
    // Clerk configuration (show only existence and format)
    CLERK_SECRET_KEY: {
      exists: !!process.env.CLERK_SECRET_KEY,
      format: process.env.CLERK_SECRET_KEY ? 
        process.env.CLERK_SECRET_KEY.substring(0, 15) + '...' : 'MISSING',
      isPlaceholder: process.env.CLERK_SECRET_KEY?.includes('YOUR_CLERK_SECRET_KEY_HERE') || false
    },
    
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
      exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      format: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 15) + '...' : 'MISSING',
      isPlaceholder: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE') || false
    },
    
    // Admin configuration
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_EXISTS: !!process.env.ADMIN_PASSWORD,
    ADMIN_PASSWORD_IS_PLACEHOLDER: process.env.ADMIN_PASSWORD?.includes('your_secure_production_admin_password') || false,
    
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      isPlaceholder: process.env.JWT_SECRET?.includes('your_production_jwt_secret_change_this_in_production') || false
    },
    
    // Check for env file conflicts
    envFileConflicts: {
      hasLocalOverride: process.env.NODE_ENV === 'production' && !!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_'),
      suggestion: 'Check if .env.production.local is overriding production settings'
    }
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: envCheck
  });
}