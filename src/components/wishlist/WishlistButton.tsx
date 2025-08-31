'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useActivity } from '@/hooks/useActivity';

interface WishlistButtonProps {
  propertyId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onAuthRequired?: () => void;
  onWishlistChange?: (inWishlist: boolean) => void;
}


export function WishlistButton({ 
  propertyId, 
  className = '', 
  size = 'md',
  showText = false,
  onAuthRequired,
  onWishlistChange
}: WishlistButtonProps) {
  const { isSignedIn, userId } = useAuth();
  const { 
    isInWishlist, 
    toggleWishlist, 
    isLoading, 
    error, 
    clearError,
    isOperationLoading 
  } = useWishlistContext();
  const { logWishlistAdd, logWishlistRemove } = useActivity();
  const [showError, setShowError] = useState(false);

  const inWishlist = isInWishlist(propertyId);
  const isOperationInProgress = isOperationLoading(propertyId);

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'text-sm',
      button: 'p-2',
      text: 'text-xs'
    },
    md: {
      icon: 'text-base',
      button: 'p-2.5',
      text: 'text-sm'
    },
    lg: {
      icon: 'text-lg',
      button: 'p-3',
      text: 'text-base'
    }
  };

  // Notify parent component when wishlist state changes
  useEffect(() => {
    if (onWishlistChange) {
      onWishlistChange(inWishlist);
    }
  }, [inWishlist, onWishlistChange]);

  // Handle error display
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 3000); // Show error for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle wishlist toggle
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is signed in - redirect to sign in if not
    if (!isSignedIn) {
      // Redirect to sign-in page instead of showing modal
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
      return;
    }

    // Don't allow multiple operations on the same property
    if (isOperationInProgress) {
      return;
    }

    try {
      const wasInWishlist = inWishlist;
      console.log(`[WishlistButton] Toggling property ${propertyId}, currently in wishlist: ${wasInWishlist}`);
      
      const success = await toggleWishlist(propertyId);
      
      if (success) {
        console.log(`[WishlistButton] Successfully toggled property ${propertyId}, new state: ${!wasInWishlist}`);
        // Track successful wishlist action with new activity system
        try {
          if (wasInWishlist) {
            await logWishlistRemove(propertyId);
          } else {
            await logWishlistAdd(propertyId);
          }
        } catch (activityError) {
          console.warn('[WishlistButton] Failed to log activity:', activityError);
          // Don't fail wishlist operation if activity logging fails
        }
      } else {
        console.warn(`[WishlistButton] Toggle operation failed for property ${propertyId}`);
      }
    } catch (error) {
      console.error(`[WishlistButton] Error toggling wishlist for property ${propertyId}:`, error);
    }
  };

  const config = sizeConfig[size];
  const isActive = inWishlist;

  return (
    <>
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={isOperationInProgress || isLoading}
          className={`
            inline-flex items-center justify-center
            ${config.button}
            rounded-full
            transition-all duration-200
            ${isActive 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }
            ${isOperationInProgress || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            ${showError ? 'ring-2 ring-red-300' : ''}
            ${!isSignedIn ? 'hover:bg-blue-50 hover:border-blue-300' : ''}
            ${className}
          `}
          title={
            !isSignedIn
              ? 'Sign in to save to wishlist'
              : isOperationInProgress
              ? 'Processing...'
              : isActive 
                ? 'Remove from wishlist' 
                : 'Add to wishlist'
          }
        >
          {isOperationInProgress ? (
            <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${config.icon}`}>
              <div className="w-4 h-4"></div>
            </div>
          ) : (
            <>
              {isActive && isSignedIn ? (
                <FaHeart className={`${config.icon} ${showText ? 'mr-2' : ''}`} />
              ) : (
                <FaRegHeart className={`${config.icon} ${showText ? 'mr-2' : ''}`} />
              )}
              {showText && (
                <span className={`font-medium ${config.text}`}>
                  {!isSignedIn ? 'Sign in to Save' : isActive ? 'Saved' : 'Save'}
                </span>
              )}
            </>
          )}
        </button>
        
        {/* Error tooltip */}
        {showError && error && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap z-10">
            {error}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
          </div>
        )}
      </div>
    </>
  );
}