'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { AuthPrompt } from './AuthPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  feature?: string;
  title?: string;
  message?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo,
  feature = 'dashboard',
  title = 'Authentication Required',
  message = 'Please sign in to access this feature',
  fallback
}: ProtectedRouteProps) {
  console.warn('⚠️ [DEPRECATED] ProtectedRoute is deprecated. Use Clerk authentication directly with useAuth() hook instead.');
  
  // For backward compatibility, just render children
  // This prevents breaking changes while encouraging migration to Clerk
  return <>{children}</>;
}

// Specific protected route for user dashboard
export function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  console.warn('⚠️ [DEPRECATED] UserProtectedRoute is deprecated. Use Clerk authentication directly with useAuth() hook instead.');
  
  // For backward compatibility, just render children
  // This prevents breaking changes while encouraging migration to Clerk
  return <>{children}</>;
}