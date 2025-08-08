import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getSessionTimeoutStatus } from '@/lib/security/session-timeout';
import { withErrorHandling } from '@/lib/api/error-handler';

async function sessionStatusHandler(request: NextRequest) {
  const session = getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: 'No active session',
        code: 'NO_SESSION'
      },
      { status: 401 }
    );
  }
  
  // Get session timeout status
  const timeoutStatus = getSessionTimeoutStatus(session.token);
  
  return NextResponse.json({
    success: true,
    data: {
      active: timeoutStatus.active,
      timeRemaining: timeoutStatus.timeRemaining,
      showWarning: timeoutStatus.showWarning,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    }
  });
}

export const GET = withErrorHandling(sessionStatusHandler);