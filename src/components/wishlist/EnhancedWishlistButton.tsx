"use client";

import React, { useState, useEffect } from 'react';
import { FaHeart, FaSpinner, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useEnhancedWishlistContext } from '@/contexts/EnhancedWishlistContext';
import { WishlistErrorBoundary } from '@/components/error-boundaries/WishlistErrorBoundary';

interface EnhancedWishlistButtonProps {
  propertyId: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

function WishlistButtonContent({
  propertyId,
  showText = false,
  size = 'md',
  variant = 'default',
  className = '',
  onToggle
}: EnhancedWishlistButtonProps) {
  const { isAuthenticated, openAuthModal } = useAuthContext();
  const {
    isInWishlist,
    toggleWishlist,
    isOperationLoading,
    error,
    clearError,
    isOnline,
    queuedOperations
  } = useEnhancedWishlistContext();
  
  const [showError, setShowError] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const isInWishlistState = isInWishlist(propertyId);
  const isLoading = isOperationLoading(propertyId);
  const hasError = error || localError;
  const isOfflineWithQueue = !isOnline && queuedOperations > 0;

  // Show error temporarily
  useEffect(() => {
    if (hasError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError, clearError]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const handleClick = async () => {
    if (!isAuthenticated) {
      openAuthModal?.();
      return;
    }

    if (isLoading) {
      return;
    }

    try {
      setLocalError(null);
      const newState = await toggleWishlist(propertyId);
      onToggle?.(newState);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setLocalError('Failed to update wishlist');
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <FaSpinner className={`${getIconSize()} animate-spin`} />
          {showText && <span className="ml-2">Updating...</span>}
        </>
      );
    }

    if (showError && hasError) {
      return (
        <>
          <FaExclamationTriangle className={`${getIconSize()} text-red-500`} />
          {showText && <span className="ml-2 text-red-500">Error</span>}
        </>
      );
    }

    if (isOfflineWithQueue) {
      return (
        <>
          <FaClock className={`${getIconSize()} text-yellow-500`} />
          {showText && <span className="ml-2 text-yellow-500">Queued</span>}
        </>
      );
    }

    return (
      <>
        <FaHeart 
          className={`${getIconSize()} transition-colors duration-200 ${
            isInWishlistState 
              ? 'text-red-500 fill-current' 
              : 'text-gray-400 hover:text-red-400'
          }`} 
        />
        {showText && (
          <span className="ml-2">
            {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </span>
        )}
      </>
    );
  };

  const getButtonClasses = () => {
    const baseClasses = `
      inline-flex items-center justify-center rounded-lg font-medium
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    if (variant === 'icon-only') {
      return `${baseClasses} p-2 hover:bg-gray-100 focus:ring-gray-300`;
    }

    if (variant === 'compact') {
      return `${baseClasses} ${getSizeClasses()} bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-300`;
    }

    // Default variant
    const stateClasses = isInWishlistState
      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 focus:ring-red-300'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300';

    return `${baseClasses} ${getSizeClasses()} border ${stateClasses}`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${getButtonClasses()} ${className}`}
        title={
          !isAuthenticated 
            ? 'Sign in to save properties' 
            : isInWishlistState 
              ? 'Remove from wishlist' 
              : 'Add to wishlist'
        }
        aria-label={
          isInWishlistState 
            ? `Remove property ${propertyId} from wishlist` 
            : `Add property ${propertyId} to wishlist`
        }
      >
        {getButtonContent()}
      </button>

      {/* Error tooltip */}
      {showError && hasError && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
          {hasError}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )}

      {/* Offline indicator */}
      {isOfflineWithQueue && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white">
          <div className="w-full h-full bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export function EnhancedWishlistButton(props: EnhancedWishlistButtonProps) {
  return (
    <WishlistErrorBoundary>
      <WishlistButtonContent {...props} />
    </WishlistErrorBoundary>
  );
}