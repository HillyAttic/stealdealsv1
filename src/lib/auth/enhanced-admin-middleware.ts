import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { AdminUserService } from '@/lib/admin/adminUserService';
import { AdminUser } from '@/lib/firebase-server-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

// Permission cache to improve performance
interface CachedPermissions {
  user: AdminUser;
  cachedAt: number;
  expiresAt: number;
}

// In-memory cache for permissions (5 minute TTL)
const permissionCache = new Map<string, CachedPermissions>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface EnhancedAdminUser extends AdminUser {
  // Add computed permissions for easier access
  effectivePermissions: {
    pages: AdminUser['permissions']['pages'];
    viewOthers: boolean;
    editOthers: boolean;
    manageUsers: boolean; // Only superusers can manage users
  };
}

interface EnhancedAuthenticatedAdminRequest extends NextRequest {
  user: EnhancedAdminUser;
}

/**
 * Clear expired entries from permission cache
 */
function cleanupPermissionCache(): void {
  const now = Date.now();
  const entries = Array.from(permissionCache.entries());
  for (const [uid, cached] of entries) {
    if (cached.expiresAt <= now) {
      permissionCache.delete(uid);
    }
  }
}

/**
 * Get user permissions from cache or database
 */
async function getUserPermissions(uid: string): Promise<AdminUser | null> {
  // Clean up expired cache entries
  cleanupPermissionCache();

  // Check cache first
  const cached = permissionCache.get(uid);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[Enhanced Admin Auth] Using cached permissions for user:', uid);
    return cached.user;
  }

  // Fetch from database
  console.log('[Enhanced Admin Auth] Fetching permissions from database for user:', uid);
  const adminUser = await AdminUserService.getAdminUser(uid);

  if (adminUser) {
    // Cache the permissions
    permissionCache.set(uid, {
      user: adminUser,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_TTL
    });
  }

  return adminUser;
}

/**
 * Calculate effective permissions based on role
 */
function getEffectivePermissions(user: AdminUser): EnhancedAdminUser['effectivePermissions'] {
  if (user.role === 'superuser') {
    return {
      pages: { 
        vacant: true, 
        plots: true, 
        franchise: true, 
        preleased: true,
        // NEW PERMISSIONS FOR SUPERUSER
        dashboard: true,
        users: true,
        wishlist: true,
        analytics: true,
        migration: true
      },
      viewOthers: true,
      editOthers: true,
      manageUsers: true
    };
  }

  return {
    pages: user.permissions.pages,
    viewOthers: user.permissions.viewOthers,
    editOthers: user.permissions.editOthers,
    manageUsers: false // Only superusers can manage users
  };
}

/**
 * Enhanced middleware to require admin authentication with permission verification
 */
export async function requireEnhancedAdminAuth(
  request: NextRequest,
  handler: (authenticatedRequest: EnhancedAuthenticatedAdminRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    console.log('[Enhanced Admin Auth] 🔐 Checking authentication and permissions...');
    console.log('[Enhanced Admin Auth] Environment:', process.env.NODE_ENV);
    console.log('[Enhanced Admin Auth] Request URL:', request.url);
    console.log('[Enhanced Admin Auth] Request method:', request.method);

    // Get token from cookies
    const token = request.cookies.get('adminToken')?.value;
    console.log('[Enhanced Admin Auth] 🎫 AdminToken present:', !!token);

    if (!token) {
      console.log('[Enhanced Admin Auth] No admin token found in cookies');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required - No admin token found. Please login to admin panel first.'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    console.log('[Enhanced Admin Auth] Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('[Enhanced Admin Auth] Token decoded successfully for user:', decoded.email, 'role:', decoded.role);

    // Check if user has admin role in JWT
    if (decoded.role !== 'admin' && decoded.role !== 'superuser' && decoded.role !== 'subuser') {
      console.log('[Enhanced Admin Auth] User does not have admin role in JWT:', decoded.role);
      return NextResponse.json(
        {
          success: false,
          error: `Admin access required - Current role: ${decoded.role}. Contact administrator to grant admin access.`
        },
        { status: 403 }
      );
    }

    // Get detailed permissions from database
    console.log('[Enhanced Admin Auth] Fetching detailed permissions for user:', decoded.userId);
    const adminUser = await getUserPermissions(decoded.userId.toString());
    
    let userForRequest: AdminUser;
    
    if (!adminUser) {
      console.log('[Enhanced Admin Auth] Admin user not found in database:', decoded.userId);
      // Create a minimal user object based on the JWT token for users that exist in Firebase but not in our admin DB
      // This prevents the infinite redirect loop while still requiring database registration for full access
      userForRequest = {
        uid: decoded.userId,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || {
          pages: { 
            vacant: false, 
            plots: false, 
            franchise: false, 
            preleased: false,
            dashboard: false,
            users: false,
            wishlist: false,
            analytics: false,
            migration: false
          },
          viewOthers: false,
          editOthers: false
        },
        createdAt: new Date().toISOString(),
        createdBy: decoded.userId
      };
    } else {
      userForRequest = adminUser;
    }

    // Calculate effective permissions
    const effectivePermissions = getEffectivePermissions(userForRequest);

    // Create enhanced admin user object
    const enhancedAdminUser: EnhancedAdminUser = {
      ...userForRequest,
      effectivePermissions
    };

    // Create authenticated request object
    const authenticatedRequest = request as EnhancedAuthenticatedAdminRequest;
    authenticatedRequest.user = enhancedAdminUser;

    console.log('[Enhanced Admin Auth] Authentication and permission verification successful');
    console.log('[Enhanced Admin Auth] User role:', enhancedAdminUser.role);
    console.log('[Enhanced Admin Auth] Effective permissions:', effectivePermissions);

    // Call the handler with authenticated request
    return await handler(authenticatedRequest);

  } catch (error) {
    console.error('[Enhanced Admin Auth] Authentication error:', {
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

/**
 * Middleware to require specific page permissions
 */
export async function requirePagePermission(
  page: keyof AdminUser['permissions']['pages'],
  request: NextRequest,
  handler: (authenticatedRequest: EnhancedAuthenticatedAdminRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireEnhancedAdminAuth(request, async (authenticatedRequest) => {
    const { user } = authenticatedRequest;

    // Check if user has permission for this page
    if (!user.effectivePermissions.pages[page]) {
      console.log(`[Enhanced Admin Auth] User ${user.email} lacks permission for page: ${String(page)}`);
      return NextResponse.json(
        {
          success: false,
          error: `Access denied - You don't have permission to access ${String(page)} section.`
        },
        { status: 403 }
      );
    }

    return await handler(authenticatedRequest);
  });
}

/**
 * Middleware to require user management permissions (superuser only)
 */
export async function requireUserManagementPermission(
  request: NextRequest,
  handler: (authenticatedRequest: EnhancedAuthenticatedAdminRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireEnhancedAdminAuth(request, async (authenticatedRequest) => {
    const { user } = authenticatedRequest;

    // Check if user can manage users (superuser only)
    if (!user.effectivePermissions.manageUsers) {
      console.log(`[Enhanced Admin Auth] User ${user.email} lacks user management permission`);
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied - Only superusers can manage admin users.'
        },
        { status: 403 }
      );
    }

    return await handler(authenticatedRequest);
  });
}

/**
 * Middleware to require property editing permissions
 */
export async function requirePropertyEditPermission(
  propertyCreatedBy: string,
  request: NextRequest,
  handler: (authenticatedRequest: EnhancedAuthenticatedAdminRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireEnhancedAdminAuth(request, async (authenticatedRequest) => {
    const { user } = authenticatedRequest;

    // Check if user can edit this property
    const canEdit = user.uid === propertyCreatedBy || // Owner can always edit
      user.effectivePermissions.editOthers; // Or has editOthers permission

    if (!canEdit) {
      console.log(`[Enhanced Admin Auth] User ${user.email} lacks permission to edit property created by: ${propertyCreatedBy}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied - You can only edit properties you created, or need editOthers permission.'
        },
        { status: 403 }
      );
    }

    return await handler(authenticatedRequest);
  });
}

/**
 * Clear permission cache for a specific user (useful when permissions are updated)
 */
export function clearUserPermissionCache(uid: string): void {
  permissionCache.delete(uid);
  console.log('[Enhanced Admin Auth] Cleared permission cache for user:', uid);
}

/**
 * Clear all permission cache (useful for testing or system maintenance)
 */
export function clearAllPermissionCache(): void {
  permissionCache.clear();
  console.log('[Enhanced Admin Auth] Cleared all permission cache');
}

/**
 * Get cache statistics for monitoring
 */
export function getPermissionCacheStats(): {
  size: number;
  entries: Array<{ uid: string; cachedAt: number; expiresAt: number }>;
} {
  return {
    size: permissionCache.size,
    entries: Array.from(permissionCache.entries()).map(([uid, cached]) => ({
      uid,
      cachedAt: cached.cachedAt,
      expiresAt: cached.expiresAt
    }))
  };
}

// Export types for use in other modules
export type { EnhancedAdminUser, EnhancedAuthenticatedAdminRequest };