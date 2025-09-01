'use client';

// WishlistContext with fixed infinite loop prevention using refs
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useActivityContext } from '@/contexts/ActivityContext';
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
  error: string | null;
  operationLoading: Set<string>; // Track loading state per property
  addToWishlist: (propertyId: string) => Promise<boolean>;
  removeFromWishlist: (propertyId: string) => Promise<boolean>;
  isInWishlist: (propertyId: string) => boolean;
  toggleWishlist: (propertyId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
  isOperationLoading: (propertyId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'stealdeals_wishlist_temp';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { logActivity } = useActivityContext();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<Set<string>>(new Set());
  
  // Use refs for internal state that doesn't need to trigger re-renders
  const isListenerActiveRef = useRef(false);
  const isInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if operation is loading for specific property
  const isOperationLoading = useCallback((propertyId: string): boolean => {
    return operationLoading.has(propertyId);
  }, [operationLoading]);

  // Set operation loading state
  const setOperationLoadingState = useCallback((propertyId: string, loading: boolean) => {
    setOperationLoading(prev => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(propertyId);
      } else {
        newSet.delete(propertyId);
      }
      return newSet;
    });
  }, []);

  // Function to get current user ID with production environment awareness
  const getCurrentUserId = useCallback((): string => {
    if (userId) {
      console.log(`[WishlistContext] 🔑 Auth successful: userId=${userId}`);
      return userId;
    }
    
    // In production, we should wait for Clerk to initialize properly
    // instead of immediately falling back to anonymous
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && isSignedIn === undefined) {
      // Clerk is still initializing in production, wait for it
      console.log(`[WishlistContext] ⏳ Clerk initializing in production, waiting...`);
      return 'initializing';
    }
    
    if (isProduction && isSignedIn === false) {
      // User is confirmed not signed in in production
      console.log(`[WishlistContext] 🚫 User confirmed not signed in production`);
      return 'anonymous';
    }
    
    // Development fallback - only in development
    if (!isProduction) {
      console.log(`[WishlistContext] 🔧 Development mode: using anonymous`);
      return 'anonymous';
    }
    
    console.log(`[WishlistContext] ⚠️ Unexpected auth state in production: isSignedIn=${isSignedIn}, userId=${userId}`);
    return 'anonymous';
  }, [userId, isSignedIn]);

  // Setup Firebase real-time listener
  const setupRealtimeListener = useCallback(() => {
    const userId = getCurrentUserId();
    if (!userId || userId === 'anonymous' || userId === 'user-1' || userId === 'initializing' || isListenerActiveRef.current) {
      if (userId === 'initializing') {
        console.log(`[WishlistContext] ⏳ Skipping listener setup - Clerk still initializing`);
      }
      return;
    }

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
        setError(null); // Clear any previous errors
        
      } catch (error) {
        console.error('[WishlistContext] ❌ Error processing real-time update:', error);
        setError('Failed to process wishlist update');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('[WishlistContext] ❌ Firebase listener error:', error);
      setError('Connection to wishlist service failed');
      setIsLoading(false);
    });

    isListenerActiveRef.current = true;
    
    // Return cleanup function
    return () => {
      console.log(`[WishlistContext] 🔥 Cleaning up Firebase listener for user ${userId}`);
      unsubscribe();
      isListenerActiveRef.current = false;
    };
  }, [getCurrentUserId]);

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
      setError('Failed to load saved wishlist items');
    }
  }, []);

  // Save to localStorage for non-authenticated users
  const saveToLocalStorage = useCallback((items: Set<string>) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...items]));
    } catch (error) {
      console.error('[WishlistContext] ❌ Failed to save to localStorage:', error);
      setError('Failed to save wishlist changes');
    }
  }, []);

  // Initial load and listener setup with stable dependencies
  useEffect(() => {
    // Get current user ID with proper production handling
    const currentUserId = getCurrentUserId();
    
    // Enhanced debugging for production
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.log(`[WishlistContext] 🔍 Production Debug - Auth State:`, {
        isSignedIn,
        userId,
        userObj: user ? {
          id: user.id,
          emailAddresses: user.emailAddresses?.length || 0,
          hasImage: !!user.imageUrl
        } : null,
        currentUserId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user changed - if so, reset everything
    if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
      console.log(`[WishlistContext] 👤 User changed from ${lastUserIdRef.current} to ${currentUserId}, resetting...`);
      console.log(`[WishlistContext] 📊 State before reset: initialized=${isInitializedRef.current}, listenerActive=${isListenerActiveRef.current}`);
      
      // Cleanup previous listener if exists
      if (cleanupFunctionRef.current) {
        console.log(`[WishlistContext] 🧹 Cleaning up previous listener for user change`);
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
      
      setWishlistItems(new Set());
      isInitializedRef.current = false;
      isListenerActiveRef.current = false;
      setIsLoading(false);
      setError(null);
    }
    
    // Don't proceed if Clerk is still initializing in production
    if (currentUserId === 'initializing') {
      console.log(`[WishlistContext] ⏳ Clerk still initializing, will retry when ready`);
      return;
    }
    
    lastUserIdRef.current = currentUserId;
    
    // Prevent double initialization during development mode or re-renders
    if (isInitializedRef.current && lastUserIdRef.current === currentUserId) {
      console.log(`[WishlistContext] ⚡ Already initialized for user ${currentUserId}, skipping`);
      return;
    }
    
    console.log(`[WishlistContext] 🚀 Initializing for user: ${currentUserId}, authenticated: ${isSignedIn}, production: ${process.env.NODE_ENV === 'production'}`);
    
    if (isSignedIn && currentUserId !== 'anonymous' && currentUserId !== 'user-1') {
      // Authenticated user - use Firebase with real-time listener
      if (!isListenerActiveRef.current) {
        console.log(`[WishlistContext] 🔥 Setting up Firebase real-time listener for user ${currentUserId}`);
        setIsLoading(true);
        
        const wishlistRef = getUserWishlistRef(currentUserId);
        
        const unsubscribe = onValue(wishlistRef, (snapshot) => {
          try {
            const timestamp = new Date().toISOString();
            console.log(`[WishlistContext] 🔄 Real-time update received at ${timestamp} for user ${currentUserId}`);
            console.log(`[WishlistContext] 📊 Current state: initialized=${isInitializedRef.current}, listenerActive=${isListenerActiveRef.current}`);
            
            if (!snapshot.exists()) {
              console.log(`[WishlistContext] 📭 No wishlist data found, setting empty set`);
              setWishlistItems(new Set());
              setIsLoading(false);
              isInitializedRef.current = true;
              return;
            }
            
            const propertyIds = new Set<string>();
            let processedCount = 0;
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              processedCount++;
              if (data && data.propertyId) {
                propertyIds.add(data.propertyId);
              } else {
                console.warn(`[WishlistContext] ⚠️ Invalid wishlist item data at ${childSnapshot.key}:`, data);
              }
            });
            
            console.log(`[WishlistContext] 🔄 Real-time update processed: ${processedCount} total items, ${propertyIds.size} valid items [${Array.from(propertyIds).join(', ')}]`);
            setWishlistItems(propertyIds);
            setIsLoading(false);
            isInitializedRef.current = true;
            setError(null); // Clear any previous errors
            
          } catch (error) {
            console.error('[WishlistContext] ❌ Error processing real-time update:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[WishlistContext] Error details:', {
              errorName: error instanceof Error ? error.name : 'Unknown',
              errorStack: error instanceof Error ? error.stack : undefined,
              userId: currentUserId,
              timestamp: new Date().toISOString()
            });
            setError(`Failed to process wishlist update: ${errorMessage}`);
            setIsLoading(false);
            isInitializedRef.current = true;
          }
        }, (error) => {
          console.error('[WishlistContext] ❌ Firebase listener error for user', currentUserId, ':', error);
          console.error('[WishlistContext] Firebase error details:', {
            errorCode: error.code || 'unknown',
            errorMessage: error.message || 'Unknown error',
            errorName: error.name || 'Unknown',
            userId: currentUserId,
            timestamp: new Date().toISOString(),
            firebaseConfig: {
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
            }
          });
          setError(`Connection to wishlist service failed: ${error.message || 'Unknown error'}`);
          setIsLoading(false);
          isInitializedRef.current = true;
        });

        isListenerActiveRef.current = true;
        
        // Store cleanup function
        cleanupFunctionRef.current = () => {
          console.log(`[WishlistContext] 🔥 Cleaning up Firebase listener for user ${currentUserId}`);
          unsubscribe();
          isListenerActiveRef.current = false;
        };
      }
    } else {
      // Non-authenticated user - use localStorage
      console.log(`[WishlistContext] 📱 Using localStorage for non-authenticated user`);
      setIsLoading(false);
      isInitializedRef.current = true;
      
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
          setError('Failed to load saved wishlist items');
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isSignedIn, userId]); // Only stable dependencies

  // Manual refresh function (mainly for debugging)
  const refreshWishlist = async () => {
    const currentUserId = getCurrentUserId();
    console.log(`[WishlistContext] 🔄 Manual refresh requested for user ${currentUserId}`);
    
    if (!isSignedIn || currentUserId === 'anonymous' || currentUserId === 'user-1' || currentUserId === 'initializing') {
      if (currentUserId === 'initializing') {
        console.log(`[WishlistContext] ⏳ Cannot refresh - Clerk still initializing`);
        return;
      }
      loadFromLocalStorage();
      return;
    }
    
    try {
      setIsLoading(true);
      const items = await getRawWishlistItems(currentUserId);
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
    
    // Don't proceed if Clerk is still initializing
    if (userId === 'initializing') {
      console.log(`[WishlistContext] ⏳ Cannot add to wishlist - Clerk still initializing`);
      setError('Authentication is loading. Please try again in a moment.');
      return false;
    }
    
    // Check if already exists
    if (wishlistItems.has(propertyId)) {
      console.log(`[WishlistContext] ⚠️ Property ${propertyId} already in wishlist`);
      return true;
    }

    // Set loading state for this specific property
    setOperationLoadingState(propertyId, true);
    
    // Optimistic update
    const previousItems = new Set(wishlistItems);
    const newItems = new Set([...wishlistItems, propertyId]);
    setWishlistItems(newItems);
    
    try {
      if (isSignedIn && userId !== 'anonymous' && userId !== 'user-1') {
        // Use API endpoint instead of direct Firebase
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': userId,
            'x-mock-user-email': 'user@example.com'
          },
          body: JSON.stringify({
            propertyId,
            action: 'add',
            priority: 'medium'
          })
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to add to wishlist');
        }
        
        console.log(`[WishlistContext] ✅ Successfully added ${propertyId} via API`);
        // Real-time listener will update the UI
      } else {
        // localStorage operation
        saveToLocalStorage(newItems);
        console.log(`[WishlistContext] ✅ Successfully added ${propertyId} to localStorage`);
      }
      
      // Log activity for wishlist addition
      try {
        await logActivity('wishlist_add', propertyId, {
          timestamp: new Date().toISOString(),
          source: 'wishlist_button'
        });
        console.log(`[WishlistContext] 📊 Activity logged: wishlist_add for ${propertyId}`);
        
        // Broadcast real-time update
        try {
          await fetch('/api/realtime/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'wishlist_update',
              userId,
              data: {
                action: 'add',
                propertyId,
                wishlistCount: newItems.size
              }
            })
          });
        } catch (broadcastError) {
          console.warn(`[WishlistContext] ⚠️ Failed to broadcast wishlist update:`, broadcastError);
        }
      } catch (activityError) {
        console.warn(`[WishlistContext] ⚠️ Failed to log wishlist_add activity:`, activityError);
        // Don't fail the wishlist operation if activity logging fails
      }
      
      // Clear any previous errors
      setError(null);
      return true;
    } catch (error) {
      console.error(`[WishlistContext] ❌ Failed to add ${propertyId}:`, error);
      // Revert optimistic update
      setWishlistItems(previousItems);
      setError(`Failed to add property to wishlist`);
      return false;
    } finally {
      // Clear loading state for this property
      setOperationLoadingState(propertyId, false);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (propertyId: string): Promise<boolean> => {
    const userId = getCurrentUserId();
    console.log(`[WishlistContext] ➖ Removing property ${propertyId} for user ${userId}`);
    
    // Don't proceed if Clerk is still initializing
    if (userId === 'initializing') {
      console.log(`[WishlistContext] ⏳ Cannot remove from wishlist - Clerk still initializing`);
      setError('Authentication is loading. Please try again in a moment.');
      return false;
    }
    
    // Check if exists
    if (!wishlistItems.has(propertyId)) {
      console.log(`[WishlistContext] ⚠️ Property ${propertyId} not in wishlist`);
      return false;
    }

    // Check if already being processed
    if (isOperationLoading(propertyId)) {
      console.log(`[WishlistContext] 🔄 Property ${propertyId} removal already in progress`);
      return false;
    }

    // Set loading state for this specific property
    setOperationLoadingState(propertyId, true);
    
    // Optimistic update
    const previousItems = new Set(wishlistItems);
    const newItems = new Set(wishlistItems);
    newItems.delete(propertyId);
    setWishlistItems(newItems);
    
    try {
      if (isSignedIn && userId !== 'anonymous' && userId !== 'user-1') {
        // Use API endpoint instead of direct Firebase
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': userId,
            'x-mock-user-email': 'user@example.com'
          },
          body: JSON.stringify({
            propertyId,
            action: 'remove'
          })
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to remove from wishlist');
        }
        
        console.log(`[WishlistContext] ✅ Successfully removed ${propertyId} via API`);
        // Real-time listener will update the UI
      } else {
        // localStorage operation
        saveToLocalStorage(newItems);
        console.log(`[WishlistContext] ✅ Successfully removed ${propertyId} from localStorage`);
      }
      
      // Log activity for wishlist removal
      try {
        await logActivity('wishlist_remove', propertyId, {
          timestamp: new Date().toISOString(),
          source: 'wishlist_button'
        });
        console.log(`[WishlistContext] 📊 Activity logged: wishlist_remove for ${propertyId}`);
        
        // Broadcast real-time update
        try {
          await fetch('/api/realtime/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'wishlist_update',
              userId,
              data: {
                action: 'remove',
                propertyId,
                wishlistCount: newItems.size
              }
            })
          });
        } catch (broadcastError) {
          console.warn(`[WishlistContext] ⚠️ Failed to broadcast wishlist update:`, broadcastError);
        }
      } catch (activityError) {
        console.warn(`[WishlistContext] ⚠️ Failed to log wishlist_remove activity:`, activityError);
        // Don't fail the wishlist operation if activity logging fails
      }
      
      // Clear any previous errors
      setError(null);
      return true;
    } catch (error) {
      console.error(`[WishlistContext] ❌ Failed to remove ${propertyId}:`, error);
      // Revert optimistic update
      setWishlistItems(previousItems);
      setError(`Failed to remove property from wishlist`);
      return false;
    } finally {
      // Clear loading state for this property
      setOperationLoadingState(propertyId, false);
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
    if (!isSignedIn && typeof window !== 'undefined') {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...wishlistItems]));
      } catch (error) {
        console.error('[WishlistContext] ❌ Failed to save to localStorage:', error);
      }
    }
  }, [wishlistItems, isSignedIn]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.size,
    isLoading: isLoading && !isInitializedRef.current, // Only show loading during initial setup
    isInitialized: isInitializedRef.current,
    error,
    operationLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,
    clearError,
    isOperationLoading
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
    // Check if we're in a server-side rendering context
    if (typeof window === 'undefined') {
      // Return a mock context for SSR to prevent build errors
      return {
        wishlistItems: new Set<string>(),
        wishlistCount: 0,
        isLoading: false,
        isInitialized: false,
        error: null,
        operationLoading: new Set<string>(),
        addToWishlist: async () => false,
        removeFromWishlist: async () => false,
        isInWishlist: () => false,
        toggleWishlist: async () => false,
        refreshWishlist: async () => {},
        clearError: () => {},
        isOperationLoading: () => false
      };
    }
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}