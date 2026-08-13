import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { firestoreDb } from '@/lib/firestore';
import { collection, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Test] GET request received');

    return requireAdminAuth(request, async (authenticatedRequest) => {
      console.log('[Admin Test] Auth successful for:', authenticatedRequest.user.email);

      // Test Firestore connection
      let firestoreStatus = 'unknown';
      try {
        await getDocs(collection(firestoreDb, 'properties').limit(1));
        firestoreStatus = 'connected';
      } catch (error) {
        firestoreStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
      }

      // Check environment variables
      const envCheck = {
        JWT_SECRET: !!process.env.JWT_SECRET,
        FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      };

      return NextResponse.json({
        success: true,
        message: 'Admin authentication working properly',
        user: {
          email: authenticatedRequest.user.email,
          role: authenticatedRequest.user.role,
          userId: authenticatedRequest.user.userId
        },
        firestoreStatus,
        environmentVariables: envCheck,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[Admin Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}