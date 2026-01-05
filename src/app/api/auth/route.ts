import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-server-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For backward compatibility and other auth methods
    // This route will now redirect to the new Firebase verification method
    return NextResponse.json(
      { 
        error: 'This endpoint has been updated. Please use /api/auth/verify-firebase-token for Firebase authentication.' 
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Check auth status endpoint
export async function GET(request: NextRequest) {
  try {
    // This can be used to check if the user is still authenticated
    const tokenCookie = request.cookies.get('adminToken');
    
    if (!tokenCookie) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'No token found' },
        { status: 401 }
      );
    }
    
    try {
      // Verify our JWT token
      const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: string; email: string; role: string };
      
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (verifyError) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
} 