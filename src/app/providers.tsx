'use client';

import React, { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { AuthDebug } from '@/components/debug/AuthDebug';
import WishlistDebug from '@/components/debug/WishlistDebug';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global providers component to handle hydration issues and browser extension attributes
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Disabled heavy DOM operations for performance
    // TODO: Re-enable if needed after performance is optimized
    return () => {};
  }, []);
  
  // Return children wrapped in providers with suppressHydrationWarning
  return (
    <div suppressHydrationWarning>
      <ToastProvider>
        <AuthErrorBoundary>
          <AuthProvider>
            <WishlistProvider>
              {children}
              {/* Debug components disabled for performance */}
              {process.env.NODE_ENV === 'development' && false && (
                <>
                  <AuthDebug />
                  <WishlistDebug />
                </>
              )}
            </WishlistProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </ToastProvider>
    </div>
  );
} 