import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Next.js edge runtime compatible JWT verification

// Define which paths should be protected
const PROTECTED_PATHS = [
  // Protected API routes that need authentication
  '/api/admin',
  // Admin panel routes
  '/admin/dashboard',
  '/admin/pre-leased', 
  '/admin/vacant',
  '/admin/franchise',
  // Include edit routes explicitly
  '/admin/vacant/edit',
  '/admin/pre-leased/edit'
];

// Paths that should skip middleware processing
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/auth/check', // Allow auth check endpoint
  '/api/contact',
  '/api/properties', // Allow all requests to properties API
  '/api/franchises', // Allow franchise API for public pages
  '/api/admin/migrate-franchises', // Allow migration API for easier access
  '/admin/login'     // Admin login page is public
];

// Added check for admin role on these endpoints
const ADMIN_COOKIE_PATHS: string[] = [
  '/api/franchises'  // Allow franchise API with cookie auth
];

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    console.log(`[Middleware] Skipping auth check for public path: ${pathname}`);
    return NextResponse.next();
  }

  // Check if path requires cookie-based protection (admin API endpoints)
  const isAdminCookiePath = ADMIN_COOKIE_PATHS.some(path => pathname.startsWith(path));
  if (isAdminCookiePath) {
    console.log(`[Middleware] Checking cookie auth for admin API path: ${pathname}`);
    const token = request.cookies.get('adminToken')?.value;
    
    // No token provided in cookie
    if (!token) {
      console.log('[Middleware] Missing admin token cookie');
      return NextResponse.json(
        { error: 'Unauthorized - Missing authentication' }, 
        { status: 401 }
      );
    }
    
    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
      );
      
      await jwtVerify(token, secret);
      console.log('[Middleware] Admin token cookie verified successfully');
      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      // Token verification failed
      console.log('[Middleware] Admin token cookie verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication' }, 
        { status: 401 }
      );
    }
  }
  
  // Check if path requires protection
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path)) || 
                         pathname.startsWith('/admin/');
  
  if (isProtectedPath) {
    console.log(`[Middleware] Protected path accessed: ${pathname}`);
    
    // For API routes, check Authorization header
    if (pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('authorization');
      
      // No token provided
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Middleware] Missing or invalid auth header for API route');
        return NextResponse.json(
          { error: 'Unauthorized - Missing or invalid token' }, 
          { status: 401 }
        );
      }
      
      const token = authHeader.split(' ')[1];
      
      try {
        // Verify JWT token
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
        );
        
        await jwtVerify(token, secret);
        console.log('[Middleware] API token verified successfully');
        // Token is valid, continue
      } catch (error) {
        // Token verification failed
        console.log('[Middleware] API token verification failed:', error);
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' }, 
          { status: 401 }
        );
      }
    } 
    // For frontend admin routes, redirect to login if no token in cookie
    else {
      // Check for token in cookies
      const token = request.cookies.get('adminToken')?.value;
      
      if (!token) {
        console.log(`[Middleware] No token in cookies for admin route: ${pathname}`);
        // Redirect to login page
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
      }
      
      try {
        // Verify JWT token
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
        );
        
        await jwtVerify(token, secret);
        console.log('[Middleware] Admin cookie token verified successfully');
        // Token is valid, continue to the admin page
      } catch (error) {
        // Token verification failed
        console.log('[Middleware] Admin cookie token verification failed:', error);
        // Redirect to login page
        const url = new URL('/admin/login', request.url);
        return NextResponse.redirect(url);
      }
      
      console.log('[Middleware] Token found in cookies for admin route');
    }
  }
  
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Apply to all admin routes
    '/admin/:path*'
  ],
}; 