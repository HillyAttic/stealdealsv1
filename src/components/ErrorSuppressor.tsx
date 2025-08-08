'use client';

import { useEffect } from 'react';

/**
 * Component to suppress common development and browser extension errors
 */
export default function ErrorSuppressor() {
  useEffect(() => {
    // List of error messages to suppress
    const suppressedErrors = [
      'message channel closed',
      'signal is aborted without reason',
      'A listener indicated an asynchronous response',
      'Extension context invalidated',
      'Could not establish connection',
      'The message port closed before a response was received'
    ];

    // Original console.error
    const originalConsoleError = console.error;

    // Override console.error to filter out noisy errors
    console.error = (...args: any[]) => {
      const message = args.join(' ').toLowerCase();
      
      // Check if this is a suppressed error
      const shouldSuppress = suppressedErrors.some(suppressedError => 
        message.includes(suppressedError.toLowerCase())
      );

      if (!shouldSuppress) {
        originalConsoleError.apply(console, args);
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason || '';
      const messageStr = String(message).toLowerCase();
      
      const shouldSuppress = suppressedErrors.some(suppressedError => 
        messageStr.includes(suppressedError.toLowerCase())
      );

      if (shouldSuppress) {
        event.preventDefault();
      }
    };

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || '';
      
      const shouldSuppress = suppressedErrors.some(suppressedError => 
        message.includes(suppressedError.toLowerCase())
      );

      if (shouldSuppress) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    // Cleanup
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return null;
}