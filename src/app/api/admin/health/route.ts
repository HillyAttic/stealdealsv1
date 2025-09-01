import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';

// GET /api/admin/health - Health check for admin functionality
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      // Check environment variables
      const envChecks = {
        clerk: {
          secretKey: {
            exists: !!process.env.CLERK_SECRET_KEY,
            isValid: !!process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes('YOUR_CLERK_SECRET_KEY_HERE'),
            value: process.env.CLERK_SECRET_KEY ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'missing'
          },
          publishableKey: {
            exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            isValid: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE'),
            value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10)}...` : 'missing'
          }
        },
        firebase: {
          projectId: {
            exists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            isValid: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== '',
            value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing'
          },
          apiKey: {
            exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            isValid: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== '',
            value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...` : 'missing'
          },
          databaseUrl: {
            exists: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            isValid: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL && process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL.includes('firebasedatabase.app'),
            value: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'missing'
          }
        }
      };

      // Check overall health status
      const clerkHealth = envChecks.clerk.secretKey.isValid && envChecks.clerk.publishableKey.isValid;
      const firebaseHealth = envChecks.firebase.projectId.isValid && envChecks.firebase.apiKey.isValid && envChecks.firebase.databaseUrl.isValid;
      
      const issues = [];
      if (!clerkHealth) {
        issues.push('Clerk configuration incomplete - check CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      }
      if (!firebaseHealth) {
        issues.push('Firebase configuration incomplete - check Firebase environment variables');
      }

      // Test Clerk connection (if configured)
      let clerkConnectionTest = { success: false, error: 'Not tested' };
      if (clerkHealth) {
        try {
          const { clerkClient } = await import('@clerk/nextjs/server');
          const client = await clerkClient();
          const testResponse = await client.users.getCount();
          clerkConnectionTest = { success: true, userCount: testResponse };
        } catch (error) {
          clerkConnectionTest = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        status: {
          overall: clerkHealth && firebaseHealth ? 'healthy' : 'issues_detected',
          clerk: clerkHealth ? 'configured' : 'not_configured',
          firebase: firebaseHealth ? 'configured' : 'not_configured'
        },
        checks: envChecks,
        tests: {
          clerkConnection: clerkConnectionTest
        },
        issues: issues.length > 0 ? issues : null,
        recommendations: issues.length > 0 ? [
          'Visit Clerk Dashboard (https://dashboard.clerk.com) to get your production API keys',
          'Set CLERK_SECRET_KEY=sk_live_... in your production environment',
          'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... in your production environment',
          'Ensure Firebase configuration is complete and valid'
        ] : null
      });

    } catch (error) {
      console.error('[Admin Health API] Error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Health check failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  });
}