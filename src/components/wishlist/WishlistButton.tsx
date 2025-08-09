'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { trackWishlistAdd, trackWishlistRemove } from '@/lib/activity-tracker';

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
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  const inWishlist = isInWishlist(propertyId);

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
  }, [inWishlist]);

  // Handle wishlist toggle
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    setIsToggling(true);

    try {
      const success = await toggleWishlist(propertyId);
      
      if (success) {
        // Track successful wishlist action
        if (inWishlist) {
          trackWishlistRemove(propertyId);
        } else {
          trackWishlistAdd(propertyId);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const config = sizeConfig[size];
  const isActive = inWishlist;

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        inline-flex items-center justify-center
        ${config.button}
        rounded-full
        transition-all duration-200
        ${isActive 
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
        }
        ${isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={
        !isAuthenticated 
          ? 'Sign in to add to wishlist'
          : isActive 
            ? 'Remove from wishlist' 
            : 'Add to wishlist'
      }
    >
      {isToggling ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${config.icon}`}>
          <div className="w-4 h-4"></div>
        </div>
      ) : (
        <>
          {isActive ? (
            <FaHeart className={`${config.icon} ${showText ? 'mr-2' : ''}`} />
          ) : (
            <FaRegHeart className={`${config.icon} ${showText ? 'mr-2' : ''}`} />
          )}
          {showText && (
            <span className={`font-medium ${config.text}`}>
              {isActive ? 'Saved' : 'Save'}
            </span>
          )}
        </>
      )}
    </button>
  );
}