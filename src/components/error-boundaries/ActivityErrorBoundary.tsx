"use client";

import React, { Component, ReactNode } from 'react';
import { FaChartLine, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

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

export class ActivityErrorBoundary extends Component<Props, State> {
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
      errorId: `activity-error-${++errorIdCounter}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ActivityErrorBoundary] Caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { component: 'activity' },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }  han
dleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('[ActivityErrorBoundary] Max retries exceeded');
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
        console.log(`[ActivityErrorBoundary] Auto-retrying after ${delay}ms`);
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
        <ActivityErrorFallback 
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

interface ActivityErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  errorId: string | null;
  retryCount: number;
  maxRetries: number;
}

const ActivityErrorFallback: React.FC<ActivityErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  errorId, 
  retryCount, 
  maxRetries 
}) => {
  const canRetry = retryCount < maxRetries;
  
  return (
    <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center mb-3">
          <FaChartLine className="text-orange-500 mr-2" />
          <FaExclamationTriangle className="text-orange-500" />
        </div>
        
        <h3 className="text-sm font-medium text-orange-800 mb-2">
          Activity Tracking Error
        </h3>
        
        <p className="text-xs text-orange-600 mb-3">
          {error.message || 'Something went wrong with activity tracking'}
        </p>

        <div className="space-y-2">
          {canRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
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

// Higher-order component for wrapping components with activity error boundary
export function withActivityErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ActivityErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ActivityErrorBoundary>
  );

  WrappedComponent.displayName = `withActivityErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook-based error boundary for functional components
export function useActivityErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const handleError = React.useCallback((error: Error) => {
    console.error('[ActivityErrorHandler] Handling error:', error);
    setError(error);
    
    // Report to error tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { component: 'activity' }
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