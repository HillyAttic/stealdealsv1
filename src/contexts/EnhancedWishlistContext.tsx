'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useActivityContext } from '@/contexts/ActivityContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  addToWishlist as addToWishlistDB, 
  removeFromWishlist as removeFromWishlistDB, 
  getRawWishlistItems,
  getUserWishlistRef 
} from '@/lib/database/wishlist';
import { onValue, off } from 'firebase/database';
import { retryWithBackoff, DEFAULT_RETRY_OPTIONS } from '@/lib/utils/retry';
import { getOfflineQueue } from '@/lib/utils/offline-queue';
import { useWishlistErrorHandler } from '@/components/error-boundaries/WishlistErrorBoundary';

interface WishlistContextType {
  wishlistItems: Set<string>;
  wishlistCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  operationLoading: Set<string>;
  isOnline: boolean;
  queuedOperations: number;
  addToWishlist: (propertyId: string) => Promise<boolean>;
  removeFromWishlist: (propertyId: string) => Promise<boolean>;
  isInWishlist: (propertyId: string) => boolean;
  toggleWishlist: (propertyId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
  isOperationLoading: (propertyId: string) => boolean;
  retryFailedOperations: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'stealdeals_wishlist_temp';

export function EnhancedWishlistProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { logActivity } = useActivityContext();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { handleError: handleBoundaryError } = useWishlistErrorHandler();
  
  // Create stable references for toast functions to prevent infinite re-renders
  const showSuccessRef = useCallback((title: string, message?: string) => {
    showSuccess(title, message);
  }, [showSuccess]);
  
  const showErrorRef = useCallback((title: string, message?: string) => {
    showError(title, message);
  }, [showError]);
  
  const showWarningRef = useCallback((title: string, message?: string) => {
    showWarning(title, message);
  }, [showWarning]);
  
  const showInfoRef = useCallback((title: string, message?: string) => {
    showInfo(title, message);
  }, [showInfo]);
  
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isListenerActive, setIsListenerActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [queuedOperations, setQueuedOperations] = useState(0);
  
  const offlineQueue = getOfflineQueue();

  // Update queued operations count
  const updateQueuedOperationsCount = useCallback(() => {
    const status = offlineQueue.getStatus();
    const wishlistOps = status.operations.filter(op => 
      op.type === 'wishlist_add' || op.type === 'wishlist_remove'
    ).length;
    setQueuedOperations(wishlistOps);
  }, [offlineQueue]);

  // Setup online/offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      showSuccessRef('Connection restored', 'Syncing your wishlist changes...');
      updateQueuedOperationsCount();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showWarningRef('Connection lost', 'Your changes will be saved and synced when connection is restored');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // No dependencies needed - functions are stable and operations are self-contained

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

  // Function to get current user ID (with fallback for development)
  const getCurrentUserId = useCallback((): string => {
    if (user?.id) return user.id;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      return 'user-1'; // Development fallback
    }
    return 'anonymous';
  }, [user?.id]);

  // Enhanced add to wishlist with retry and offline support
  const addToWishlist = async (propertyId: string): Promise<boolean> => {
    const userId = getCurrentUserId();
    
    // Check if already exists
    if (wishlistItems.has(propertyId)) {
      return true;
    }

    // Set loading state for this specific property
    setOperationLoadingState(propertyId, true);
    
    // Optimistic update
    const previousItems = new Set(wishlistItems);
    const newItems = new Set([...wishlistItems, propertyId]);
    setWishlistItems(newItems);
    
    try {
      if (isSignedIn && userId !== 'anonymous') {
        if (isOnline) {
          // Try online operation with retry
          await retryWithBackoff(
            () => addToWishlistDB(userId, propertyId),
            {
              ...DEFAULT_RETRY_OPTIONS,
              maxAttempts: 3,
              retryCondition: (error) => {
                // Retry on network errors, but not on validation errors
                return error?.status >= 500 || 
                       error?.message?.includes('network') ||
                       error?.message?.includes('timeout');
              }
            }
          );
          showSuccessRef('Added to wishlist', 'Property saved to your wishlist');
        } else {
          // Queue for offline processing
          offlineQueue.add({
            type: 'wishlist_add',
            data: { propertyId, userId },
            maxRetries: 5
          });
          updateQueuedOperationsCount();
          showWarningRef('Added to wishlist', 'Will sync when connection is restored');
        }
      } else {
        // localStorage operation for non-authenticated users
        saveToLocalStorage(newItems);
        showSuccessRef('Added to wishlist', 'Property saved locally');
      }
      
      // Log activity
      try {
        await logActivity('wishlist_add', propertyId, {
          timestamp: new Date().toISOString(),
          source: 'wishlist_button'
        });
      } catch (activityError) {
        console.warn(`[EnhancedWishlistContext] ⚠️ Failed to log wishlist_add activity:`, activityError);
      }
      
      // Clear any previous errors
      setError(null);
      return true;
      
    } catch (error) {
      console.error(`[EnhancedWishlistContext] ❌ Failed to add ${propertyId}:`, error);
      
      // Revert optimistic update
      setWishlistItems(previousItems);
      
      const errorMessage = `Failed to add property to wishlist`;
      setError(errorMessage);
      handleBoundaryError(error as Error);
      showErrorRef('Wishlist Error', errorMessage);
      
      return false;
    } finally {
      // Clear loading state for this property
      setOperationLoadingState(propertyId, false);
    }
  };

  // Enhanced remove from wishlist with retry and offline support
  const removeFromWishlist = async (propertyId: string): Promise<boolean> => {
    const userId = getCurrentUserId();
    console.log(`[EnhancedWishlistContext] ➖ Removing property ${propertyId} for user ${userId}`);
    
    // Check if exists
    if (!wishlistItems.has(propertyId)) {
      console.log(`[EnhancedWishlistContext] ⚠️ Property ${propertyId} not in wishlist`);
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
      if (isSignedIn && userId !== 'anonymous') {
        if (isOnline) {
          // Try online operation with retry
          const success = await retryWithBackoff(
            () => removeFromWishlistDB(userId, propertyId),
            {
              ...DEFAULT_RETRY_OPTIONS,
              maxAttempts: 3,
              retryCondition: (error) => {
                return error?.status >= 500 || 
                       error?.message?.includes('network') ||
                       error?.message?.includes('timeout');
              }
            }
          );
          
          if (!success) {
            throw new Error('Remove operation returned false');
          }
          
          console.log(`[EnhancedWishlistContext] ✅ Successfully removed ${propertyId} from Firebase`);
          showSuccessRef('Removed from wishlist', 'Property removed from your wishlist');
        } else {
          // Queue for offline processing
          offlineQueue.add({
            type: 'wishlist_remove',
            data: { propertyId, userId },
            maxRetries: 5
          });
          updateQueuedOperationsCount();
          showWarningRef('Removed from wishlist', 'Will sync when connection is restored');
        }
      } else {
        // localStorage operation for non-authenticated users
        saveToLocalStorage(newItems);
        console.log(`[EnhancedWishlistContext] ✅ Successfully removed ${propertyId} from localStorage`);
        showSuccessRef('Removed from wishlist', 'Property removed locally');
      }
      
      // Log activity
      try {
        await logActivity('wishlist_remove', propertyId, {
          timestamp: new Date().toISOString(),
          source: 'wishlist_button'
        });
      } catch (activityError) {
        console.warn(`[EnhancedWishlistContext] ⚠️ Failed to log wishlist_remove activity:`, activityError);
      }
      
      // Clear any previous errors
      setError(null);
      return true;
      
    } catch (error) {
      console.error(`[EnhancedWishlistContext] ❌ Failed to remove ${propertyId}:`, error);
      
      // Revert optimistic update
      setWishlistItems(previousItems);
      
      const errorMessage = `Failed to remove property from wishlist`;
      setError(errorMessage);
      handleBoundaryError(error as Error);
      showErrorRef('Wishlist Error', errorMessage);
      
      return false;
    } finally {
      // Clear loading state for this property
      setOperationLoadingState(propertyId, false);
    }
  };

  // Save to localStorage for non-authenticated users (helper function)
  const saveToLocalStorage = useCallback((items: Set<string>) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...items]));
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Failed to save to localStorage:', error);
      setError('Failed to save wishlist changes');
    }
  }, []);

  // Simplified listener management - removed redundant function
  // Firebase listener is now only managed in the main useEffect

  // Manual refresh function with error handling
  const refreshWishlist = useCallback(async () => {
    const userId = getCurrentUserId();
    console.log(`[EnhancedWishlistContext] 🔄 Manual refresh requested for user ${userId}`);
    
    if (!isSignedIn || userId === 'anonymous') {
      // Load from localStorage inline to avoid dependency issues
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (stored) {
            const items = JSON.parse(stored);
            setWishlistItems(new Set(items));
            console.log(`[EnhancedWishlistContext] 📱 Refreshed ${items.length} items from localStorage`);
          }
        } catch (error) {
          console.error('[EnhancedWishlistContext] ❌ Failed to refresh from localStorage:', error);
          setError('Failed to load saved wishlist items');
        }
      }
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const items = await retryWithBackoff(
        () => getRawWishlistItems(userId),
        DEFAULT_RETRY_OPTIONS
      );
      
      const propertyIds = new Set(items.map(item => item.propertyId));
      setWishlistItems(propertyIds);
      console.log(`[EnhancedWishlistContext] ✅ Manual refresh: ${propertyIds.size} items`);
      showSuccessRef('Wishlist refreshed', 'Your wishlist has been updated');
      
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Manual refresh error:', error);
      const errorMessage = 'Failed to refresh wishlist';
      setError(errorMessage);
      try {
        handleBoundaryError(error as Error);
      } catch (boundaryError) {
        console.error('[EnhancedWishlistContext] ❌ Error boundary handler failed:', boundaryError);
      }
      showErrorRef('Refresh Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getCurrentUserId, showSuccessRef, showErrorRef]);

  // Retry failed operations
  const retryFailedOperations = async () => {
    try {
      // This would trigger the offline queue to process pending operations
      const status = offlineQueue.getStatus();
      if (status.queueSize > 0) {
        showInfoRef('Retrying operations', `Attempting to sync ${status.queueSize} pending changes...`);
        // The offline queue will automatically process when online
        updateQueuedOperationsCount();
      } else {
        showInfoRef('No pending operations', 'All changes are already synced');
      }
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Error retrying operations:', error);
      showErrorRef('Retry Error', 'Failed to retry pending operations');
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

  // Initial load and listener setup with error handling - stable dependencies only
  useEffect(() => {
    const userId = user?.id || (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? 'user-1' : 'anonymous');
    
    console.log(`[EnhancedWishlistContext] 🚀 Initializing for user: ${userId}, authenticated: ${isSignedIn}`);
    
    try {
      if (isSignedIn && userId !== 'anonymous') {
        // Authenticated user - use Firebase with real-time listener
        if (!isListenerActive) {
          setIsLoading(true);
          
          // Setup Firebase real-time listener inline to avoid dependency issues
          const wishlistRef = getUserWishlistRef(userId);
          
          const unsubscribe = onValue(wishlistRef, (snapshot) => {
            try {
              console.log(`[EnhancedWishlistContext] 🔄 Real-time update received`);
              
              if (!snapshot.exists()) {
                console.log(`[EnhancedWishlistContext] 📭 No wishlist data, setting empty`);
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
              
              console.log(`[EnhancedWishlistContext] 🔄 Real-time update: ${propertyIds.size} items`);
              setWishlistItems(propertyIds);
              setIsLoading(false);
              setIsInitialized(true);
              setError(null);
              
            } catch (error) {
              console.error('[EnhancedWishlistContext] ❌ Error processing real-time update:', error);
              setError('Failed to process wishlist update');
              handleBoundaryError(error as Error);
              setIsLoading(false);
            }
          }, (error) => {
            console.error('[EnhancedWishlistContext] ❌ Firebase listener error:', error);
            setError('Connection to wishlist service failed');
            handleBoundaryError(error);
            setIsLoading(false);
          });

          setIsListenerActive(true);
          
          return () => {
            console.log(`[EnhancedWishlistContext] 🔥 Cleaning up Firebase listener for user ${userId}`);
            unsubscribe();
            setIsListenerActive(false);
          };
        }
      } else {
        // Non-authenticated user - use localStorage
        console.log(`[EnhancedWishlistContext] 📱 Using localStorage for non-authenticated user`);
        setIsLoading(false);
        setIsInitialized(true);
        
        // Load from localStorage inline to avoid dependency issues
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
              const items = JSON.parse(stored);
              setWishlistItems(new Set(items));
              console.log(`[EnhancedWishlistContext] 📱 Loaded ${items.length} items from localStorage`);
            }
          } catch (error) {
            console.error('[EnhancedWishlistContext] ❌ Failed to load from localStorage:', error);
            setError('Failed to load saved wishlist items');
            handleBoundaryError(error as Error);
          }
        }
      }
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Initialization error:', error);
      setError('Failed to initialize wishlist');
      handleBoundaryError(error as Error);
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id]);

  // Update queued operations count periodically
  useEffect(() => {
    const interval = setInterval(updateQueuedOperationsCount, 5000);
    return () => clearInterval(interval);
  }, [updateQueuedOperationsCount]);

  // Save localStorage whenever wishlistItems changes for non-authenticated users
  useEffect(() => {
    if (!isSignedIn && typeof window !== 'undefined') {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...wishlistItems]));
      } catch (error) {
        console.error('[EnhancedWishlistContext] ❌ Failed to save to localStorage:', error);
        handleBoundaryError(error as Error);
      }
    }
  }, [wishlistItems, isSignedIn, handleBoundaryError]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.size,
    isLoading: isLoading && !isInitialized,
    isInitialized,
    error,
    operationLoading,
    isOnline,
    queuedOperations,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,
    clearError,
    isOperationLoading,
    retryFailedOperations
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useEnhancedWishlistContext() {
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
        isOnline: true,
        queuedOperations: 0,
        addToWishlist: async () => false,
        removeFromWishlist: async () => false,
        isInWishlist: () => false,
        toggleWishlist: async () => false,
        refreshWishlist: async () => {},
        clearError: () => {},
        isOperationLoading: () => false,
        retryFailedOperations: async () => {}
      };
    }
    throw new Error('useEnhancedWishlistContext must be used within an EnhancedWishlistProvider');
  }
  return context;
}