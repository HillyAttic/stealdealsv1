import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token found' },
        { status: 401 }
      );
    }
    
    // Verify token
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
      );
      
      const { payload } = await jwtVerify(token, secret);
      
      // Check if this is an admin user
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { authenticated: false, error: 'Not authorized as admin' },
          { status: 403 }
        );
      }
      
      // Token is valid and user is an admin
      return NextResponse.json({
        authenticated: true,
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        }
      });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { authenticated: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
} 