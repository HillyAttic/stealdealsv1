'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface WishlistContextType {
  wishlistItems: Set<string>;
  wishlistCount: number;
  isLoading: boolean;
  addToWishlist: (propertyId: string) => Promise<boolean>;
  removeFromWishlist: (propertyId: string) => Promise<boolean>;
  isInWishlist: (propertyId: string) => boolean;
  toggleWishlist: (propertyId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshWishlist();
    } else {
      setWishlistItems(new Set());
    }
  }, [isAuthenticated, user]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // Prepare headers with mock auth if in development
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add mock auth headers for development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && user) {
        headers['x-mock-user-id'] = user.id;
        headers['x-mock-user-email'] = user.email;
      }
      
      const response = await fetch('/api/user/wishlist', {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const propertyIds = new Set(data.properties.map((p: any) => p.id));
        setWishlistItems(propertyIds);
      } else {
        console.error('Failed to load wishlist:', data.error);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (propertyId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    // Optimistic update
    setWishlistItems(prev => new Set([...prev, propertyId]));

    try {
      // Prepare headers with mock auth if in development
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add mock auth headers for development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && user) {
        headers['x-mock-user-id'] = user.id;
        headers['x-mock-user-email'] = user.email;
      }
      
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ propertyId, action: 'add' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Revert optimistic update
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        return false;
      }

      return true;
    } catch (error) {
      // Revert optimistic update
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      return false;
    }
  };

  const removeFromWishlist = async (propertyId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    // Optimistic update
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(propertyId);
      return newSet;
    });

    try {
      // Prepare headers with mock auth if in development
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add mock auth headers for development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && user) {
        headers['x-mock-user-id'] = user.id;
        headers['x-mock-user-email'] = user.email;
      }
      
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ propertyId, action: 'remove' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Revert optimistic update
        setWishlistItems(prev => new Set([...prev, propertyId]));
        return false;
      }

      return true;
    } catch (error) {
      // Revert optimistic update
      setWishlistItems(prev => new Set([...prev, propertyId]));
      return false;
    }
  };

  const isInWishlist = (propertyId: string): boolean => {
    return wishlistItems.has(propertyId);
  };

  const toggleWishlist = async (propertyId: string): Promise<boolean> => {
    if (isInWishlist(propertyId)) {
      return await removeFromWishlist(propertyId);
    } else {
      return await addToWishlist(propertyId);
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.size,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}