"use client";

import React, { Component, ReactNode } from 'react';
import { AuthError, getUserErrorMessage } from '@/lib/errors/auth-errors';
import { AuthErrorCodes } from '@/types/auth';

// Counter for generating unique error IDs without Date.now() or Math.random()
let errorIdCounter = 0;

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error-${++errorIdCounter}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  handleAutoRetry = () => {
    // Auto-retry after a delay for retryable errors
    if (this.state.error && this.state.error instanceof AuthError && this.state.error.retryable) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 3000);
    }
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If we just caught an error, check if we should auto-retry
    if (!prevState.hasError && this.state.hasError) {
      this.handleAutoRetry();
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
        <AuthErrorFallback 
          error={this.state.error} 
          onRetry={this.handleRetry}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

interface AuthErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  errorId: string | null;
}

const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({ error, onRetry, errorId }) => {
  const isAuthError = error instanceof AuthError;
  const userMessage = getUserErrorMessage(error);
  const isRetryable = isAuthError ? error.retryable : true;

  const handleReportError = () => {
    // Create error report
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy to clipboard for user to send
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error details copied to clipboard. Please send this to support.');
    });
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Authentication Error
        </h3>
        
        <p className="text-gray-600 mb-6">
          {userMessage}
        </p>

        <div className="space-y-3">
          {isRetryable && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Refresh Page
          </button>
          
          <button
            onClick={handleReportError}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Report Error
          </button>
        </div>

        {errorId && (
          <p className="text-xs text-gray-400 mt-4">
            Error ID: {errorId}
          </p>
        )}
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with auth error boundary
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AuthErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AuthErrorBoundary>
  );

  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}