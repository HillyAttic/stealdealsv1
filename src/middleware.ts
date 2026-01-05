import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Conditionally import and use Clerk middleware with proper error handling
let clerkMiddleware: any;
let createRouteMatcher: any;
let clerkAvailable = false;

try {
  const clerkModule = require('@clerk/nextjs/server');
  clerkMiddleware = clerkModule.clerkMiddleware;
  createRouteMatcher = clerkModule.createRouteMatcher;
  
  // Check if Clerk keys are actually available
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                       process.env.CLERK_SECRET_KEY &&
                       !process.env.CLERK_SECRET_KEY.includes('YOUR_CLERK_SECRET_KEY_HERE');
  
  clerkAvailable = hasClerkKeys ? true : false;
  
  if (!clerkAvailable) {
    console.warn('[Middleware] Clerk keys not properly configured, running without Clerk auth');
  }
} catch (error) {
  console.error('[Middleware] Clerk initialization failed:', error);
  clerkAvailable = false;
}

// Define admin paths that should use Firebase auth (not Clerk)
const ADMIN_PATHS = [
  '/api/admin',
  '/admin/dashboard',
  '/admin/pre-leased', 
  '/admin/vacant',
  '/admin/franchise',
  '/admin/vacant/edit',
  '/admin/pre-leased/edit',
  '/admin/login',
  '/admin/users',
  '/api/auth' // This handles Firebase admin auth
];

// Define user paths that should be protected by Clerk
const isUserProtectedRoute = clerkAvailable && createRouteMatcher ? createRouteMatcher([
  '/wishlist',
  '/my-wishlist',
  '/saved-properties', 
  '/wishlist-simple',
  '/api/user(.*)',
  '/api/wishlist(.*)',
  '/api/activity(.*)'
]) : () => false;

// Paths that should skip all auth checks
const PUBLIC_PATHS = [
  '/api/contact',
  '/api/properties',
  '/api/franchises',
  '/_next',
  '/favicon.svg',
  '/development.png',
  '/',
  '/about',
  '/plots',
  '/vacant',
  '/franchise',
  '/contact',
  '/privacy',
  '/terms'
];

export default async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  
  // Skip middleware for static files and Next.js internal routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.includes('.') ||
      pathname === '/development.png') {
    return NextResponse.next();
  }

  // Primary redirect for all wishlist traffic
  if (pathname === '/wishlist') {
    console.log('[MIDDLEWARE] Redirecting wishlist to primary route');
    const primaryUrl = new URL('/my-wishlist', req.url);
    primaryUrl.search = req.nextUrl.search;
    return NextResponse.redirect(primaryUrl, 301);
  }

  // Skip Clerk auth for admin paths - let Firebase handle them
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip auth for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If Clerk is not available, skip auth checks
  if (!clerkAvailable || !clerkMiddleware) {
    console.warn('[Middleware] Skipping Clerk auth - not configured');
    return NextResponse.next();
  }

  // Protect user routes with Clerk if available
  return clerkMiddleware(async (auth: any, request: NextRequest) => {
    if (isUserProtectedRoute && typeof isUserProtectedRoute === 'function' && isUserProtectedRoute(request)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
    return NextResponse.next();
  })(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};