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
    // Function to remove browser extension attributes across the entire DOM
    const cleanupBrowserExtensionAttributes = () => {
      // Target common extension attributes like Bitdefender's bis_skin_checked
      const extensionAttributes = [
        'bis_skin_checked',
        'data-bit',
        'data-bitdefender',
        'data-bd-',
        'data-surfingkeys-',
        'data-adguard',
        'data-hint'
      ];
      
      // Function to process an element and its children recursively
      function processElement(element: Element) {
        // Check and remove extension attributes
        extensionAttributes.forEach(attr => {
          if (attr.endsWith('-')) {
            // Handle prefix matching
            Array.from(element.attributes).forEach(elementAttr => {
              if (elementAttr.name.startsWith(attr)) {
                element.removeAttribute(elementAttr.name);
              }
            });
          } else if (element.hasAttribute(attr)) {
            // Direct attribute match
            element.removeAttribute(attr);
          }
        });
        
        // Process children recursively
        Array.from(element.children).forEach(child => {
          processElement(child);
        });
      }
      
      // Start processing from body
      if (document.body) {
        processElement(document.body);
      }
    };
    
    // Run cleanup immediately after mount
    cleanupBrowserExtensionAttributes();
    
    // Set up a mutation observer to handle dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          // Check if it's one of our target attributes
          const node = mutation.target as Element;
          const attrName = mutation.attributeName || '';
          
          if (attrName.startsWith('bis_') || attrName.startsWith('data-bit') ||
              attrName.startsWith('data-bd-') || attrName.startsWith('data-adguard')) {
            node.removeAttribute(attrName);
          }
        }
      });
    });
    
    // Configure and start the observer
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'data-bit*', 'data-bd-*', 'data-adguard*']
    });
    
    // Clean up observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Return children wrapped in providers with suppressHydrationWarning
  return (
    <div suppressHydrationWarning>
      <ToastProvider>
        <AuthErrorBoundary>
          <AuthProvider>
            <WishlistProvider>
              {children}
              <AuthDebug />
              <WishlistDebug />
            </WishlistProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </ToastProvider>
    </div>
  );
} 