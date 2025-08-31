'use client';

import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useWishlistContext } from '@/contexts/WishlistContext';

interface WishlistIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function WishlistIndicator({ className = '', showText = false }: WishlistIndicatorProps) {
  const { isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlistContext();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/wishlist"
      className={`
        relative inline-flex items-center justify-center
        p-2 rounded-full
        bg-white text-red-500 border border-gray-200
        hover:bg-red-50 hover:border-red-200
        transition-all duration-200
        ${className}
      `}
      title="View Wishlist"
    >
      <FaHeart className="text-lg" />
      
      {/* Count Badge */}
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
      
      {/* Optional Text */}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
        </span>
      )}
    </Link>
  );
}