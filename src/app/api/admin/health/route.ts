import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const envChecks = {
        firebase: {
          projectId: {
            exists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            isValid: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing'
          },
          apiKey: {
            exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            isValid: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...` : 'missing'
          },
          adminPrivateKey: {
            exists: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
            isValid: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY && !process.env.FIREBASE_ADMIN_PRIVATE_KEY.includes('YOUR_'),
            value: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'configured' : 'missing'
          }
        }
      };

      const firebaseHealth = envChecks.firebase.projectId.isValid && envChecks.firebase.apiKey.isValid;

      let firebaseConnectionTest = { success: false, error: 'Not tested', userCount: 0 };
      try {
        const userCount = await FirebaseAdminUserService.getUserCount();
        firebaseConnectionTest = { success: true, userCount };
      } catch (error) {
        firebaseConnectionTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          userCount: 0
        };
      }

      const issues = [];
      if (!firebaseHealth) issues.push('Firebase configuration incomplete');
      if (!firebaseConnectionTest.success) issues.push('Firebase connection failed');

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        status: {
          overall: firebaseHealth && firebaseConnectionTest.success ? 'healthy' : 'issues_detected',
          firebase: firebaseHealth ? 'configured' : 'not_configured',
        },
        checks: envChecks,
        tests: { firebaseConnection: firebaseConnectionTest },
        issues,
      });
    } catch (error) {
      console.error('[Health API] Error:', error);
      return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
    }
  });
}
