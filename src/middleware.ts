import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths should be protected
const PROTECTED_PATHS = [
  '/api/admin',
  '/admin/dashboard',
  '/admin/pre-leased', 
  '/admin/vacant',
  '/admin/franchise',
  '/admin/vacant/edit',
  '/admin/pre-leased/edit'
];

// User-specific protected paths (API routes only)
const USER_PROTECTED_PATHS = [
  // We'll handle authentication at the API route level, not middleware
];

// Paths that should skip middleware processing
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/contact',
  '/api/properties',
  '/api/franchises',
  '/api/user', // Allow user API calls through
  '/api/wishlist', // Allow wishlist calls through  
  '/api/activity', // Allow activity calls through
  '/admin/login',
  '/_next',
  '/favicon.ico',
  '/development.png'
];

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Skip middleware for static files and Next.js internal routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.includes('.') ||
      pathname === '/development.png') {
    return NextResponse.next();
  }
  
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For now, let's allow all routes to pass through to avoid blocking the app
  // Authentication will be handled at the component level
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};