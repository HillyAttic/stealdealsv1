'use client';

import { useEffect } from 'react';

/**
 * Component to suppress development-only errors that don't affect functionality
 */
export default function DevErrorSuppressor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Suppress Jest worker errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      
      // Suppress specific development errors
      if (
        errorString.includes('Jest worker encountered') ||
        errorString.includes('child process exceptions') ||
        errorString.includes('__N_SSP') ||
        errorString.includes('isrManifest') ||
        errorString.includes('React DevTools') ||
        errorString.includes('[HMR] Invalid message') ||
        errorString.includes('performing full reload') ||
        errorString.includes('rebuilding') ||
        errorString.includes('bis_skin_checked') ||
        errorString.includes('data-bit') ||
        errorString.includes('extension')
      ) {
        // Silently ignore these development-only errors
        return;
      }
      
      // Log other errors normally
      originalConsoleError.apply(console, args);
    };

    // Suppress window errors related to development tools
    const originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const messageStr = message?.toString() || '';
      
      if (
        messageStr.includes('Jest worker') ||
        messageStr.includes('child process') ||
        messageStr.includes('__N_SSP') ||
        messageStr.includes('React DevTools') ||
        messageStr.includes('bis_skin_checked') ||
        messageStr.includes('extension')
      ) {
        return true; // Prevent default handling
      }
      
      if (originalWindowError) {
        return originalWindowError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Suppress unhandled promise rejections from development tools
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      const reason = event.reason?.toString() || '';
      
      if (
        reason.includes('Jest worker') ||
        reason.includes('child process') ||
        reason.includes('__N_SSP') ||
        reason.includes('React DevTools') ||
        reason.includes('extension')
      ) {
        event.preventDefault();
        return;
      }
      
      if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event);
      }
    };

    // Cleanup function
    return () => {
      console.error = originalConsoleError;
      window.onerror = originalWindowError;
      window.onunhandledrejection = originalUnhandledRejection;
    };
  }, []);

  return null; // This component doesn't render anything
}