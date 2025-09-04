import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
const isUserProtectedRoute = createRouteMatcher([
  '/wishlist',
  '/my-wishlist',
  '/saved-properties', 
  '/wishlist-simple',
  '/api/user(.*)',
  '/api/wishlist(.*)',
  '/api/activity(.*)'
]);

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

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = new URL(req.url);
  
  // Skip middleware for static files and Next.js internal routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.includes('.') ||
      pathname === '/development.png') {
    return NextResponse.next();
  }

  // Primary redirect for all wishlist traffic (fallback if Next.js redirects don't work)
  if (pathname === '/wishlist') {
    console.log('[MIDDLEWARE] Redirecting wishlist to primary route');
    const primaryUrl = new URL('/my-wishlist', req.url);
    primaryUrl.search = req.nextUrl.search;
    return NextResponse.redirect(primaryUrl, 301); // Permanent redirect
  }

  // Skip Clerk auth for admin paths - let Firebase handle them
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip auth for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Protect user routes with Clerk
  if (isUserProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};