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
  // For backward compatibility, just render children
  // Routes are protected by Clerk middleware at the application level
  return <>{children}</>;
}

// UserProtectedRoute has been removed - use Clerk authentication directly with useAuth() hook