'use client';

import { useWishlistContext } from '@/contexts/WishlistContext';

export function useWishlist() {
  const context = useWishlistContext();
  
  return {
    items: Array.from(context.wishlistItems),
    isLoading: context.isLoading,
    error: null, // Context doesn't expose errors, but we maintain compatibility
    addToWishlist: context.addToWishlist,
    removeFromWishlist: context.removeFromWishlist,
    isInWishlist: context.isInWishlist,
    toggleWishlist: context.toggleWishlist,
    getWishlistCount: () => context.wishlistCount,
    loadWishlist: context.refreshWishlist,
    clearError: () => {} // No-op for compatibility
  };
}