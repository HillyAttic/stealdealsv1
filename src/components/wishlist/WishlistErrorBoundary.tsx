'use client';

import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface WishlistErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface WishlistErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export class WishlistErrorBoundary extends React.Component<
  WishlistErrorBoundaryProps,
  WishlistErrorBoundaryState
> {
  constructor(props: WishlistErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WishlistErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[WishlistErrorBoundary] Error caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to Load Wishlist
            </h3>
            <p className="text-gray-600 mb-4">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? this.state.error.message
                : 'There was an error loading your saved properties. Please try again.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaRedo className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}