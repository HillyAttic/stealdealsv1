import { NextRequest, NextResponse } from 'next/server';
import { validateApplicationSecurity, generateSecurityReport } from '@/lib/security/validation';
import { withErrorHandling } from '@/lib/api/error-handler';

async function securityValidationHandler(request: NextRequest) {
  // Only allow in development or with proper admin authentication
  if (process.env.NODE_ENV === 'production') {
    // In production, require admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Additional admin verification would go here
  }

  const validation = validateApplicationSecurity();
  const report = generateSecurityReport();

  return NextResponse.json({
    success: true,
    data: {
      validation,
      report,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  });
}

export const GET = withErrorHandling(securityValidationHandler);