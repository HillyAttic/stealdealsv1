import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, setSessionCookie, clearSessionCookie } from '@/lib/auth/firebase-session-cookies';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Missing ID token' },
        { status: 400 }
      );
    }

    // Create session cookie from Firebase ID token
    const sessionCookie = await createSessionCookie(idToken);
    
    // Set cookie on response
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, sessionCookie);
    
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Session clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
