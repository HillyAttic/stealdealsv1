import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths should be protected
const PROTECTED_PATHS = [
  // Protected API routes that need authentication
  '/api/admin'
];

// POST, PUT, DELETE on properties should be protected
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE'];

// Paths that should skip middleware processing
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/contact',
  '/api/properties' // Allow all requests to properties API
];

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const method = request.method;
  
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if path requires protection
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    // No token provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' }, 
        { status: 401 }
      );
    }
    
    // In a real application, you would validate the token here
    // Example:
    // const token = authHeader.split(' ')[1];
    // try {
    //   const decoded = verify(token, process.env.JWT_SECRET);
    //   if (!decoded) throw new Error('Invalid token');
    // } catch (error) {
    //   return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    // }
    
    // For demo purposes, we'll just check if token exists
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token format' }, 
        { status: 401 }
      );
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*'
  ],
}; 