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
    console.log('[Admin Auth] Checking authentication...');
    
    // Get token from cookies
    const token = request.cookies.get('adminToken')?.value;
    console.log('[Admin Auth] Token present:', !!token);
    
    if (!token) {
      console.log('[Admin Auth] No admin token found in cookies');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required - No admin token found. Please login to admin panel first.'
        },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    console.log('[Admin Auth] Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('[Admin Auth] Token decoded successfully for user:', decoded.email, 'role:', decoded.role);
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      console.log('[Admin Auth] User does not have admin role:', decoded.role);
      return NextResponse.json(
        { 
          success: false,
          error: `Admin access required - Current role: ${decoded.role}. Contact administrator to grant admin access.`
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
    
    console.log('[Admin Auth] Authentication successful, calling handler for user:', decoded.email);
    
    // Call the handler with authenticated request
    return await handler(authenticatedRequest);
    
  } catch (error) {
    console.error('[Admin Auth] Authentication error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof jwt.JsonWebTokenError) {
      let errorMessage = 'Invalid authentication token';
      
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Authentication token has expired. Please login again.';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid authentication token format. Please login again.';
      } else if (error.name === 'NotBeforeError') {
        errorMessage = 'Authentication token not active yet.';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication system error. Please try logging in again.'
      },
      { status: 500 }
    );
  }
}