'use client';

import { useWishlistContext } from '@/contexts/WishlistContext';

export function useWishlist() {
  const context = useWishlistContext();
  
  return {
    items: Array.from(context.wishlistItems),
    wishlistCount: context.wishlistCount,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    error: context.error,
    addToWishlist: context.addToWishlist,
    removeFromWishlist: context.removeFromWishlist,
    isInWishlist: context.isInWishlist,
    toggleWishlist: context.toggleWishlist,
    refreshWishlist: context.refreshWishlist,
    clearError: context.clearError,
    isOperationLoading: context.isOperationLoading,
    // Legacy compatibility methods
    getWishlistCount: () => context.wishlistCount,
    loadWishlist: context.refreshWishlist
  };
}