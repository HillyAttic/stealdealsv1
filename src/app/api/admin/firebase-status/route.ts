import { NextResponse } from 'next/server';
import { isAdminInitialized, getAdminInitStatus } from '@/lib/firebase-server-admin';

export async function GET() {
  try {
    const status = getAdminInitStatus();
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccountKeyLength = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0;
    
    return NextResponse.json({
      success: true,
      firebaseAdmin: {
        initialized: isAdminInitialized(),
        ...status,
      },
      environment: {
        hasServiceAccountKey,
        serviceAccountKeyLength,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      firebaseAdmin: {
        initialized: false,
      }
    }, { status: 500 });
  }
}
