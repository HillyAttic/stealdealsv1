"use client";

import React, { Component, ReactNode } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { FaHeart, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

// Counter for generating unique error IDs
let errorIdCounter = 0;

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showToast?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class WishlistErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `wishlist-error-${++errorIdCounter}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[WishlistErrorBoundary] Caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { component: 'wishlist' },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('[WishlistErrorBoundary] Max retries exceeded');
      return;
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reset error state and increment retry count
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If we just caught an error and haven't exceeded max retries, auto-retry after delay
    if (!prevState.hasError && this.state.hasError && this.state.retryCount < this.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
      
      this.retryTimeoutId = setTimeout(() => {
        console.log(`[WishlistErrorBoundary] Auto-retrying after ${delay}ms`);
        this.handleRetry();
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <WishlistErrorFallback 
          error={this.state.error} 
          onRetry={this.handleRetry}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

interface WishlistErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  errorId: string | null;
  retryCount: number;
  maxRetries: number;
}

const WishlistErrorFallback: React.FC<WishlistErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  errorId, 
  retryCount, 
  maxRetries 
}) => {
  const canRetry = retryCount < maxRetries;
  
  return (
    <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center mb-3">
          <FaHeart className="text-red-500 mr-2" />
          <FaExclamationTriangle className="text-red-500" />
        </div>
        
        <h3 className="text-sm font-medium text-red-800 mb-2">
          Wishlist Error
        </h3>
        
        <p className="text-xs text-red-600 mb-3">
          {error.message || 'Something went wrong with your wishlist'}
        </p>

        <div className="space-y-2">
          {canRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaRedo className="mr-1" />
              Try Again ({maxRetries - retryCount} left)
            </button>
          )}
          
          {!canRetry && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>

        {errorId && (
          <p className="text-xs text-gray-400 mt-2">
            Error ID: {errorId}
          </p>
        )}
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with wishlist error boundary
export function withWishlistErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <WishlistErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </WishlistErrorBoundary>
  );

  WrappedComponent.displayName = `withWishlistErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook-based error boundary for functional components
export function useWishlistErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const handleError = React.useCallback((error: Error) => {
    console.error('[WishlistErrorHandler] Handling error:', error);
    setError(error);
    
    // Report to error tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { component: 'wishlist' }
      });
    }
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
}