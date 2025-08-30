'use client';

import React, { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { EnhancedWishlistProvider } from '@/contexts/EnhancedWishlistContext';
import { EnhancedActivityProvider } from '@/contexts/EnhancedActivityContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { WishlistErrorBoundary } from '@/components/error-boundaries/WishlistErrorBoundary';
import { ActivityErrorBoundary } from '@/components/error-boundaries/ActivityErrorBoundary';
import { AuthDebug } from '@/components/debug/AuthDebug';
import WishlistDebug from '@/components/debug/WishlistDebug';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

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
            <ActivityErrorBoundary>
              <ActivityProvider>
                <EnhancedActivityProvider>
                  <WishlistErrorBoundary>
                    <WishlistProvider>
                      <EnhancedWishlistProvider>
                        {children}
                        <ConnectionStatus />
                        {/* Debug components disabled for performance */}
                        {process.env.NODE_ENV === 'development' && false && (
                          <>
                            <AuthDebug />
                            <WishlistDebug />
                          </>
                        )}
                      </EnhancedWishlistProvider>
                    </WishlistProvider>
                  </WishlistErrorBoundary>
                </EnhancedActivityProvider>
              </ActivityProvider>
            </ActivityErrorBoundary>
          </AuthProvider>
        </AuthErrorBoundary>
      </ToastProvider>
    </div>
  );
} 