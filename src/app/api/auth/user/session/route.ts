import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getUserById } from '@/lib/database/mock-users';

export async function GET(request: NextRequest) {
  try {
    // Get session from request (cookies or Authorization header)
    let session = getSessionFromRequest(request);
    
    // If no session from cookies, try Authorization header
    if (!session) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { verifyToken } = await import('@/lib/auth/jwt');
        const payload = verifyToken(token);
        if (payload) {
          session = {
            user: {
              id: payload.userId,
              email: payload.email,
              name: '', // Will be filled from database
              role: payload.role
            },
            token,
            expiresAt: new Date(payload.exp! * 1000)
          };
        }
      }
    }
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          authenticated: false,
          error: 'No active session'
        },
        { status: 401 }
      );
    }
    
    // Check if session is expired
    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        { 
          success: false,
          authenticated: false,
          error: 'Session expired'
        },
        { status: 401 }
      );
    }
    
    // Get fresh user data from database
    console.log('Looking up user with ID:', session.user.id);
    const user = await getUserById(session.user.id);
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          authenticated: false,
          error: `User not found with ID: ${session.user.id}`
        },
        { status: 404 }
      );
    }
    
    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          authenticated: false,
          error: 'Account deactivated'
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        preferences: user.preferences
      },
      expiresAt: session.expiresAt
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { 
        success: false,
        authenticated: false,
        error: 'Session check failed'
      },
      { status: 500 }
    );
  }
}