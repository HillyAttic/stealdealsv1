import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

interface AuthenticatedAdminRequest extends NextRequest {
  user: AdminUser;
}

/**
 * Middleware to require admin authentication
 */
export async function requireAdminAuth(
  request: NextRequest,
  handler: (authenticatedRequest: AuthenticatedAdminRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from cookies
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      );
    }
    
    // Create authenticated request object
    const authenticatedRequest = request as AuthenticatedAdminRequest;
    authenticatedRequest.user = {
      userId: decoded.userId.toString(),
      email: decoded.email,
      role: decoded.role
    };
    
    // Call the handler with authenticated request
    return await handler(authenticatedRequest);
    
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid token'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication failed'
      },
      { status: 500 }
    );
  }
}