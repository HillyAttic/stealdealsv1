import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { isAdminInitialized, getAdminInitStatus } from '@/lib/firebase-server-admin';

/**
 * Debug endpoint to check authentication status and Firebase Admin SDK initialization
 * Only available in development or with debug token
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with specific debug token
  const debugToken = request.nextUrl.searchParams.get('debug');
  const isDebugAllowed = process.env.NODE_ENV === 'development' ||
                        debugToken === 'stealdeals_debug_2024';

  if (!isDebugAllowed) {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production without debug token' },
      { status: 403 }
    );
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

  // Get admin token from cookies
  const adminToken = request.cookies.get('adminToken')?.value;
  const adminUser = request.cookies.get('adminUser')?.value;

  let tokenInfo = null;
  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
      tokenInfo = {
        present: true,
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        expiresIn: `${Math.floor((decoded.exp - Date.now() / 1000) / 3600)} hours`
      };
    } catch (error) {
      tokenInfo = {
        present: true,
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown'
      };
    }
  }

  let userInfo = null;
  if (adminUser) {
    try {
      userInfo = JSON.parse(adminUser);
    } catch (error) {
      userInfo = { error: 'Failed to parse adminUser cookie' };
    }
  }

  // Check Firebase Admin SDK status
  const firebaseAdminStatus = getAdminInitStatus();

  // Check environment variables
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0,
      preview: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'MISSING'
    },
    FIREBASE_SERVICE_ACCOUNT_KEY: {
      exists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      length: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
    NEXT_PUBLIC_FIREBASE_API_KEY: {
      exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      preview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10) + '...' : 'MISSING'
    },
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET'
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    firebaseAdmin: {
      initialized: firebaseAdminStatus.initialized,
      projectId: firebaseAdminStatus.projectId,
      appCount: isAdminInitialized() ? 1 : 0
    },
    cookies: {
      adminToken: tokenInfo,
      adminUser: userInfo
    },
    environment: envCheck,
    jwtSecret: JWT_SECRET.substring(0, 10) + '...',
    diagnostics: {
      hasToken: !!adminToken,
      hasUser: !!adminUser,
      tokenValid: tokenInfo?.valid || false,
      firebaseReady: firebaseAdminStatus.initialized
    }
  });
}
