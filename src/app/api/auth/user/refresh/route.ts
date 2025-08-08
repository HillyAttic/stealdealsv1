import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, createSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/database/mock-users';
import { isTokenExpired } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active session to refresh'
        },
        { status: 401 }
      );
    }
    
    // Check if token is close to expiring (within 5 minutes)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    const shouldRefresh = session.expiresAt <= fiveMinutesFromNow;
    
    if (!shouldRefresh) {
      // Token is still valid for more than 5 minutes
      return NextResponse.json({
        success: true,
        message: 'Token is still valid',
        token: session.token,
        expiresAt: session.expiresAt
      });
    }
    
    // Get fresh user data from database
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }
    
    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account deactivated'
        },
        { status: 403 }
      );
    }
    
    // Create new session with fresh token
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      token: '', // Will be set by createSession
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        preferences: user.preferences
      }
    });
    
    // Create new session and set cookies
    const newToken = createSession(user, response);
    
    // Update response with new token
    const responseData = await response.json();
    responseData.token = newToken;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Token refresh failed'
      },
      { status: 500 }
    );
  }
}