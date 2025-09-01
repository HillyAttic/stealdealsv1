'use client';

import React, { ReactNode, useEffect } from 'react';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { EnhancedWishlistProvider } from '@/contexts/EnhancedWishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { WishlistErrorBoundary } from '@/components/error-boundaries/WishlistErrorBoundary';
import { ActivityErrorBoundary } from '@/components/error-boundaries/ActivityErrorBoundary';
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
        <ActivityErrorBoundary>
          <ActivityProvider>
            <WishlistErrorBoundary>
              <EnhancedWishlistProvider>
                {children}
                <ConnectionStatus />
                {/* Debug components disabled for performance */}
                {process.env.NODE_ENV === 'development' && false && (
                  <>
                    <WishlistDebug />
                  </>
                )}
              </EnhancedWishlistProvider>
            </WishlistErrorBoundary>
          </ActivityProvider>
        </ActivityErrorBoundary>
      </ToastProvider>
    </div>
  );
} 