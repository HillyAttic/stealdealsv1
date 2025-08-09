'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  addToWishlist as addToWishlistDB, 
  removeFromWishlist as removeFromWishlistDB, 
  getRawWishlistItems,
  getUserWishlistRef 
} from '@/lib/database/wishlist';
import { onValue, off } from 'firebase/database';

interface WishlistContextType {
  wishlistItems: Set<string>;
  wishlistCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  addToWishlist: (propertyId: string) => Promise<boolean>;
  removeFromWishlist: (propertyId: string) => Promise<boolean>;
  isInWishlist: (propertyId: string) => boolean;
  toggleWishlist: (propertyId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'stealdeals_wishlist_temp';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isListenerActive, setIsListenerActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to get current user ID (with fallback for development)
  const getCurrentUserId = useCallback((): string => {
    if (user?.id) return user.id;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      return 'user-1'; // Development fallback
    }
    return 'anonymous';
  }, [user?.id]);

  // Setup Firebase real-time listener
  const setupRealtimeListener = useCallback(() => {
    const userId = getCurrentUserId();
    if (!userId || userId === 'anonymous' || isListenerActive) return;

    console.log(`[WishlistContext] 🔥 Setting up Firebase real-time listener for user ${userId}`);
    
    const wishlistRef = getUserWishlistRef(userId);
    
    const unsubscribe = onValue(wishlistRef, (snapshot) => {
      try {
        console.log(`[WishlistContext] 🔄 Real-time update received`);
        
        if (!snapshot.exists()) {
          console.log(`[WishlistContext] 📭 No wishlist data, setting empty`);
          setWishlistItems(new Set());
          return;
        }
        
        const propertyIds = new Set<string>();
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data && data.propertyId) {
            propertyIds.add(data.propertyId);
          }
        });
        
        console.log(`[WishlistContext] 🔄 Real-time update: ${propertyIds.size} items [${Array.from(propertyIds).join(', ')}]`);
        setWishlistItems(propertyIds);
        setIsLoading(false);
        
      } catch (error) {
        console.error('[WishlistContext] ❌ Error processing real-time update:', error);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('[WishlistContext] ❌ Firebase listener error:', error);
      setIsLoading(false);
    });

    setIsListenerActive(true);
    
    // Return cleanup function
    return () => {
      console.log(`[WishlistContext] 🔥 Cleaning up Firebase listener for user ${userId}`);
      unsubscribe();
      setIsListenerActive(false);
    };
  }, [getCurrentUserId, isListenerActive]);

  // Load from localStorage for non-authenticated users
  const loadFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        setWishlistItems(new Set(items));
        console.log(`[WishlistContext] 📱 Loaded ${items.length} items from localStorage`);
      }
    } catch (error) {
      console.error('[WishlistContext] ❌ Failed to load from localStorage:', error);
    }
  }, []);

  // Save to localStorage for non-authenticated users
  const saveToLocalStorage = useCallback((items: Set<string>) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...items]));
    } catch (error) {
      console.error('[WishlistContext] ❌ Failed to save to localStorage:', error);
    }
  }, []);

  // Initial load and listener setup
  useEffect(() => {
    // Get current user ID directly
    const userId = user?.id || (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? 'user-1' : 'anonymous');
    
    console.log(`[WishlistContext] 🚀 Initializing for user: ${userId}, authenticated: ${isAuthenticated}`);
    
    if (isAuthenticated && userId !== 'anonymous') {
      // Authenticated user - use Firebase with real-time listener
      if (!isListenerActive) {
        console.log(`[WishlistContext] 🔥 Setting up Firebase real-time listener for user ${userId}`);
        setIsLoading(true);
        
        const wishlistRef = getUserWishlistRef(userId);
        
        const unsubscribe = onValue(wishlistRef, (snapshot) => {
          try {
            console.log(`[WishlistContext] 🔄 Real-time update received`);
            
            if (!snapshot.exists()) {
              console.log(`[WishlistContext] 📭 No wishlist data, setting empty`);
              setWishlistItems(new Set());
              setIsLoading(false);
              setIsInitialized(true);
              return;
            }
            
            const propertyIds = new Set<string>();
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              if (data && data.propertyId) {
                propertyIds.add(data.propertyId);
              }
            });
            
            console.log(`[WishlistContext] 🔄 Real-time update: ${propertyIds.size} items [${Array.from(propertyIds).join(', ')}]`);
            setWishlistItems(propertyIds);
            setIsLoading(false);
            setIsInitialized(true);
            
          } catch (error) {
            console.error('[WishlistContext] ❌ Error processing real-time update:', error);
            setIsLoading(false);
          }
        }, (error) => {
          console.error('[WishlistContext] ❌ Firebase listener error:', error);
          setIsLoading(false);
        });

        setIsListenerActive(true);
        
        // Return cleanup function
        return () => {
          console.log(`[WishlistContext] 🔥 Cleaning up Firebase listener for user ${userId}`);
          unsubscribe();
          setIsListenerActive(false);
        };
      } else {
        // Listener already active, don't set loading
        setIsLoading(false);
      }
    } else {
      // Non-authenticated user - use localStorage
      console.log(`[WishlistContext] 📱 Using localStorage for non-authenticated user`);
      setIsLoading(false); // Ensure loading is false for non-authenticated users
      setIsInitialized(true);
      
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (stored) {
            const items = JSON.parse(stored);
            setWishlistItems(new Set(items));
            console.log(`[WishlistContext] 📱 Loaded ${items.length} items from localStorage`);
          }
        } catch (error) {
          console.error('[WishlistContext] ❌ Failed to load from localStorage:', error);
        }
      }
    }
  }, [isAuthenticated, user?.id]);

  // Manual refresh function (mainly for debugging)
  const refreshWishlist = async () => {
    const userId = getCurrentUserId();
    console.log(`[WishlistContext] 🔄 Manual refresh requested for user ${userId}`);
    
    if (!isAuthenticated || userId === 'anonymous') {
      loadFromLocalStorage();
      return;
    }
    
    try {
      setIsLoading(true);
      const items = await getRawWishlistItems(userId);
      const propertyIds = new Set(items.map(item => item.propertyId));
      setWishlistItems(propertyIds);
      console.log(`[WishlistContext] ✅ Manual refresh: ${propertyIds.size} items`);
    } catch (error) {
      console.error('[WishlistContext] ❌ Manual refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to wishlist
  const addToWishlist = async (propertyId: string): Promise<boolean> => {
    const userId = getCurrentUserId();
    console.log(`[WishlistContext] ➕ Adding property ${propertyId} for user ${userId}`);
    
    // Check if already exists
    if (wishlistItems.has(propertyId)) {
      console.log(`[WishlistContext] ⚠️ Property ${propertyId} already in wishlist`);
      return true;
    }
    
    // Optimistic update
    const previousItems = new Set(wishlistItems);
    const newItems = new Set([...wishlistItems, propertyId]);
    setWishlistItems(newItems);
    
    try {
      if (isAuthenticated && userId !== 'anonymous') {
        // Firebase operation
        await addToWishlistDB(userId, propertyId);
        console.log(`[WishlistContext] ✅ Successfully added ${propertyId} to Firebase`);
        // Real-time listener will update the UI
      } else {
        // localStorage operation
        saveToLocalStorage(newItems);
        console.log(`[WishlistContext] ✅ Successfully added ${propertyId} to localStorage`);
      }
      
      return true;
    } catch (error) {
      console.error(`[WishlistContext] ❌ Failed to add ${propertyId}:`, error);
      // Revert optimistic update
      setWishlistItems(previousItems);
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (propertyId: string): Promise<boolean> => {
    const userId = getCurrentUserId();
    console.log(`[WishlistContext] ➖ Removing property ${propertyId} for user ${userId}`);
    
    // Check if exists
    if (!wishlistItems.has(propertyId)) {
      console.log(`[WishlistContext] ⚠️ Property ${propertyId} not in wishlist`);
      return false;
    }
    
    // Optimistic update
    const previousItems = new Set(wishlistItems);
    const newItems = new Set(wishlistItems);
    newItems.delete(propertyId);
    setWishlistItems(newItems);
    
    try {
      if (isAuthenticated && userId !== 'anonymous') {
        // Firebase operation
        const success = await removeFromWishlistDB(userId, propertyId);
        if (success) {
          console.log(`[WishlistContext] ✅ Successfully removed ${propertyId} from Firebase`);
          // Real-time listener will update the UI
        } else {
          throw new Error('Remove operation returned false');
        }
      } else {
        // localStorage operation
        saveToLocalStorage(newItems);
        console.log(`[WishlistContext] ✅ Successfully removed ${propertyId} from localStorage`);
      }
      
      return true;
    } catch (error) {
      console.error(`[WishlistContext] ❌ Failed to remove ${propertyId}:`, error);
      // Revert optimistic update
      setWishlistItems(previousItems);
      return false;
    }
  };

  // Check if property is in wishlist
  const isInWishlist = (propertyId: string): boolean => {
    return wishlistItems.has(propertyId);
  };

  // Toggle wishlist
  const toggleWishlist = async (propertyId: string): Promise<boolean> => {
    if (isInWishlist(propertyId)) {
      return await removeFromWishlist(propertyId);
    } else {
      return await addToWishlist(propertyId);
    }
  };

  // Save localStorage whenever wishlistItems changes for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...wishlistItems]));
      } catch (error) {
        console.error('[WishlistContext] ❌ Failed to save to localStorage:', error);
      }
    }
  }, [wishlistItems, isAuthenticated]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.size,
    isLoading: isLoading && !isInitialized, // Only show loading during initial setup
    isInitialized,
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