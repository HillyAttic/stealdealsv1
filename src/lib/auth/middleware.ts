import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from './session';
import { getUserById as getMockUserById } from '@/lib/database/mock-users';

// For development/testing, always use mock users
const getUserById = getMockUserById;

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  };
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session from request
    const session = getSessionFromRequest(request);
    
    // For development, always check for mock authentication headers first
    if (!session) {
      const mockUserId = request.headers.get('x-mock-user-id');
      const mockUserEmail = request.headers.get('x-mock-user-email');
      
      if (mockUserId && mockUserEmail) {
        try {
          const user = await getUserById(mockUserId);
          if (user) {
            const authenticatedRequest = request as AuthenticatedRequest;
            authenticatedRequest.user = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar
            };
            
            return await handler(authenticatedRequest);
          }
        } catch (error) {
          console.error('Mock authentication error:', error);
          // Fall through to regular authentication check
        }
      }
    }
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }
    
    // Check if session is expired
    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session expired'
        },
        { status: 401 }
      );
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
    
    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };
    
    // Call the handler with authenticated request
    return await handler(authenticatedRequest);
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication failed'
      },
      { status: 500 }
    );
  }
}

/**
 * Middleware to require admin authentication for API routes
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    // Check if user has admin role
    if (authenticatedRequest.user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      );
    }
    
    return await handler(authenticatedRequest);
  });
}

/**
 * Optional authentication middleware - adds user to request if authenticated
 */
export async function optionalAuth(
  request: NextRequest,
  handler: (request: NextRequest & { user?: AuthenticatedRequest['user'] }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session from request
    const session = getSessionFromRequest(request);
    
    if (session && session.expiresAt > new Date()) {
      // Get fresh user data from database
      const user = await getUserById(session.user.id);
      if (user && user.isActive) {
        // Add user to request object
        const requestWithUser = request as NextRequest & { user?: AuthenticatedRequest['user'] };
        requestWithUser.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        };
        
        return await handler(requestWithUser);
      }
    }
    
    // Call handler without user if not authenticated
    return await handler(request);
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without authentication on error
    return await handler(request);
  }
}