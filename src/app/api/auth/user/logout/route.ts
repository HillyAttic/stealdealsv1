import { NextRequest, NextResponse } from 'next/server';
import { clearSession, getSessionFromRequest } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Get current session for logging purposes
    const session = getSessionFromRequest(request);
    
    if (session) {
      console.log(`User ${session.user.email} logging out`);
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear session cookies
    clearSession(response);
    
    // Also clear any admin cookies if they exist (for admin users)
    response.cookies.set({
      name: 'adminToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set({
      name: 'adminUser',
      value: '',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, still try to clear cookies
    const response = NextResponse.json(
      { 
        success: false,
        error: 'Logout failed. Please try again.'
      },
      { status: 500 }
    );
    
    clearSession(response);
    
    return response;
  }
}