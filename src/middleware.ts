import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Firebase session cookie name (matches set-token route)
const SESSION_COOKIE_NAME = "firebase-token";

// Define public paths that do not require authentication
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/plots",
  "/vacant",
  "/franchise",
  "/contact",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/horeca",
  "/sell-business",
  "/expand-franchise",
  "/brand-license",
  "/loan-property",
  "/restaurant-india",
  "/advertise",
  "/api/contact",
  "/api/properties",
  "/api/franchises",
  "/api/health",
  "/api/auth/set-token",
  "/api/auth/verify-firebase-token",
  "/_next",
  "/favicon",
  "/development.png",
  "/logo.svg",
];

// Admin paths (handled by separate admin middleware)
const ADMIN_PATHS = [
  "/api/admin",
  "/admin",
];

// Protected user paths that require authentication
const PROTECTED_PATHS = [
  "/wishlist",
  "/my-wishlist",
  "/saved-properties",
  "/dashboard",
  "/api/user",
  "/api/wishlist",
  "/api/activity",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  
  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname === "/development.png" ||
    pathname === "/logo.svg"
  ) {
    return NextResponse.next();
  }

  // Redirect wishlist to primary route
  if (pathname === "/wishlist") {
    const primaryUrl = new URL("/my-wishlist", req.url);
    primaryUrl.search = req.nextUrl.search;
    return NextResponse.redirect(primaryUrl, 301);
  }

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Skip auth for admin paths (handled by admin middleware)
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication for protected paths
  const isProtected = PROTECTED_PATHS.some((path) => 
    pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) {
      // Not authenticated, redirect to sign-in
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Token exists - we trust it for now (will be verified by Firebase Admin in API routes)
    // For full verification, we could call Firebase Admin SDK here
    const response = NextResponse.next();
    
    // Set user ID header if we can decode from token (optional optimization)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.user_id || payload.sub) {
        response.headers.set("x-user-id", payload.user_id || payload.sub);
      }
    } catch (e) {
      // Token decoding failed, but we still allow through (API routes will verify)
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
