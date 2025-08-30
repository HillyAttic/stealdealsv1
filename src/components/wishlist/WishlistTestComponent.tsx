'use client';

import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistTestComponentProps {
  propertyId: string;
}

export function WishlistTestComponent({ propertyId }: WishlistTestComponentProps) {
  const {
    items,
    wishlistCount,
    isLoading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isOperationLoading,
    clearError
  } = useWishlist();

  const inWishlist = isInWishlist(propertyId);
  const operationLoading = isOperationLoading(propertyId);

  return (
    <div data-testid="wishlist-test-component">
      <div data-testid="wishlist-count">{wishlistCount}</div>
      <div data-testid="wishlist-items">{items.join(',')}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'none'}</div>
      <div data-testid="in-wishlist">{inWishlist.toString()}</div>
      <div data-testid="operation-loading">{operationLoading.toString()}</div>
      
      <button
        data-testid="add-button"
        onClick={() => addToWishlist(propertyId)}
        disabled={operationLoading}
      >
        Add to Wishlist
      </button>
      
      <button
        data-testid="remove-button"
        onClick={() => removeFromWishlist(propertyId)}
        disabled={operationLoading}
      >
        Remove from Wishlist
      </button>
      
      {error && (
        <button data-testid="clear-error-button" onClick={clearError}>
          Clear Error
        </button>
      )}
    </div>
  );
}