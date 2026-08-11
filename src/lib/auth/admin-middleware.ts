import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
  permissions?: {
    editOthers?: boolean;
    viewOthers?: boolean;
    deleteOthers?: boolean;
    [key: string]: any;
  };
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
          error: 'Authentication required - No admin token found. Please login to admin panel first.'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if user has admin role
    if (decoded.role !== 'admin' && decoded.role !== 'superuser' && decoded.role !== 'subuser') {
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