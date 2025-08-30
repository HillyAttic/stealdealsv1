import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { clientSession } from '@/lib/auth/client-session';

export async function GET(request: NextRequest) {
  try {
    // Debug information gathering
    const debug = {
      timestamp: new Date().toISOString(),
      
      // Check cookies
      cookies: {
        auth_session: request.cookies.get('auth_session')?.value,
        auth_user: request.cookies.get('auth_user')?.value,
        all_cookies: Array.from(request.cookies.entries()).map(([name, cookie]) => ({
          name,
          value: name.includes('auth') ? cookie.value?.substring(0, 20) + '...' : cookie.value
        }))
      },
      
      // Check headers
      headers: {
        authorization: request.headers.get('Authorization'),
        user_agent: request.headers.get('User-Agent'),
        origin: request.headers.get('Origin'),
        referer: request.headers.get('Referer')
      },
      
      // Try to get session
      session: null,
      sessionError: null
    };
    
    try {
      debug.session = getSessionFromRequest(request);
    } catch (error) {
      debug.sessionError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      debug
    });
    
  } catch (error) {
    console.error('Debug auth status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get auth debug info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}