import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-server-admin';

/**
 * POST /api/auth/set-token
 * Sets the Firebase ID token as an httpOnly cookie after client-side sign-in
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      uid: decodedToken.uid,
    });

    // Set the httpOnly cookie
    response.cookies.set({
      name: 'firebase-token',
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Set token error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/set-token
 * Clears the Firebase token cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'firebase-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
