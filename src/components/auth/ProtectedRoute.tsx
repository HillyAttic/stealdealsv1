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
  const { isAuthenticated, isLoading } = useAuthContext();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback or auth prompt if not authenticated
  return (
    <>
      {fallback || (
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => setShowAuthPrompt(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title={title}
        message={message}
        feature={feature}
        redirectPath={redirectTo}
      />
    </>
  );
}

// Specific protected route for user dashboard
export function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      feature="dashboard"
      title="Dashboard Access Required"
      message="Please sign in to access your personalized dashboard with saved properties and viewing history."
      redirectTo="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
}