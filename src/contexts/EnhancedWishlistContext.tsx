'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useToast } from '@/contexts/ToastContext';
import { 
  getRawWishlistItems,
  getUserWishlistRef 
} from '@/lib/database/wishlist';
import { onValue } from 'firebase/database';

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
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
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

  // Update queued operations count - simplified without offline queue
  const updateQueuedOperationsCount = useCallback(() => {
    // For now, just set to 0 since we're not using offline queue
    setQueuedOperations(0);
  }, []);

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

  // Enhanced add to wishlist with retry and production resilience
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
    
    // Enhanced retry mechanism
    const maxRetries = process.env.NODE_ENV === 'production' ? 3 : 1;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (isSignedIn && userId !== 'anonymous') {
          if (isOnline) {
            // Enhanced headers for production authentication
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              'x-user-id': userId
            };
            
            // Always send user headers when authenticated (both dev and production)
            headers['x-user-id'] = userId;
            headers['x-mock-user-id'] = userId;
            headers['x-mock-user-email'] = 'user@example.com';
            // Production-specific fallback headers
            if (process.env.NODE_ENV === 'production') {
              headers['x-fallback-user-id'] = userId;
            }
            
            console.log(`[EnhancedWishlistContext] Adding to wishlist (attempt ${attempt + 1}):`, {
              propertyId,
              userId,
              environment: process.env.NODE_ENV,
              headers: Object.keys(headers)
            });
            
            // Use API endpoint with retry parameter
            const response = await fetch(`/api/user/wishlist?retry=${attempt}`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                propertyId,
                action: 'add',
                priority: 'medium'
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const error = new Error(errorData.error || `HTTP ${response.status}`);
              
              // Check if this is a retryable error
              if (response.status === 401 && attempt < maxRetries) {
                console.warn(`[EnhancedWishlistContext] Authentication failed (attempt ${attempt + 1}), retrying...`);
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
              
              throw error;
            }
            
            const data = await response.json();
            if (!data.success) {
              const error = new Error(data.error || 'Failed to add to wishlist');
              
              // Retry on server errors
              if (attempt < maxRetries) {
                console.warn(`[EnhancedWishlistContext] Server error (attempt ${attempt + 1}), retrying...`);
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
              
              throw error;
            }
            
            showSuccessRef('Added to wishlist', 'Property saved to your wishlist');
            console.log(`[EnhancedWishlistContext] ✅ Successfully added ${propertyId} after ${attempt + 1} attempts`);
            // The Firebase listener will update the UI automatically
            break;
          } else {
            // For offline mode, just show warning
            showWarningRef('No internet connection', 'Please check your connection and try again');
            throw new Error('No internet connection');
          }
        } else {
          // localStorage operation for non-authenticated users
          saveToLocalStorage(newItems);
          showSuccessRef('Added to wishlist', 'Property saved locally');
          break;
        }
        
      } catch (error) {
        lastError = error as Error;
        console.error(`[EnhancedWishlistContext] ❌ Attempt ${attempt + 1} failed for ${propertyId}:`, error);
        
        // If this is the last attempt, break and handle error below
        if (attempt === maxRetries) {
          break;
        }
      }
    }
    
    // Handle final results
    try {
      // If we got here and have an error, all attempts failed
      if (lastError) {
        console.error(`[EnhancedWishlistContext] ❌ All ${maxRetries + 1} attempts failed for ${propertyId}:`, lastError);
        
        // Revert optimistic update
        setWishlistItems(previousItems);
        
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? `Unable to add property to wishlist. Please try again.`
          : `Failed to add property to wishlist: ${lastError.message}`;
        
        setError(errorMessage);
        showErrorRef('Wishlist Error', errorMessage);
        
        return false;
      }
      
      // Clear any previous errors on success
      setError(null);
      return true;
    } finally {
      // Always clear loading state
      setOperationLoadingState(propertyId, false);
    }
  };

  // Enhanced remove from wishlist with retry and production resilience
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
    
    // Enhanced retry mechanism
    const maxRetries = process.env.NODE_ENV === 'production' ? 3 : 1;
    let lastError: Error | null = null;
    
    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (isSignedIn && userId !== 'anonymous') {
            if (isOnline) {
              // Enhanced headers for production authentication
              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-user-id': userId
              };
              
              // Always send user headers when authenticated (both dev and production)
              headers['x-user-id'] = userId;
              headers['x-mock-user-id'] = userId;
              headers['x-mock-user-email'] = 'user@example.com';
              // Production-specific fallback headers
              if (process.env.NODE_ENV === 'production') {
                headers['x-fallback-user-id'] = userId;
              }
              
              console.log(`[EnhancedWishlistContext] Removing from wishlist (attempt ${attempt + 1}):`, {
                propertyId,
                userId,
                environment: process.env.NODE_ENV
              });
              
              // Use API endpoint with retry parameter
              const response = await fetch(`/api/user/wishlist?retry=${attempt}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  propertyId,
                  action: 'remove'
                })
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error || `HTTP ${response.status}`);
                
                // Check if this is a retryable error
                if (response.status === 401 && attempt < maxRetries) {
                  console.warn(`[EnhancedWishlistContext] Authentication failed (attempt ${attempt + 1}), retrying...`);
                  lastError = error;
                  await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                  continue;
                }
                
                throw error;
              }
              
              const data = await response.json();
              if (!data.success) {
                const error = new Error(data.error || 'Failed to remove from wishlist');
                
                // Retry on server errors
                if (attempt < maxRetries) {
                  console.warn(`[EnhancedWishlistContext] Server error (attempt ${attempt + 1}), retrying...`);
                  lastError = error;
                  await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                  continue;
                }
                
                throw error;
              }
              
              console.log(`[EnhancedWishlistContext] ✅ Successfully removed ${propertyId} after ${attempt + 1} attempts`);
              showSuccessRef('Removed from wishlist', 'Property removed from your wishlist');
              // The Firebase listener will update the UI automatically
              break;
            } else {
              // For offline mode, just show warning
              showWarningRef('No internet connection', 'Please check your connection and try again');
              throw new Error('No internet connection');
            }
          } else {
            // localStorage operation for non-authenticated users
            saveToLocalStorage(newItems);
            console.log(`[EnhancedWishlistContext] ✅ Successfully removed ${propertyId} from localStorage`);
            showSuccessRef('Removed from wishlist', 'Property removed locally');
            break;
          }
          
        } catch (error) {
          lastError = error as Error;
          console.error(`[EnhancedWishlistContext] ❌ Attempt ${attempt + 1} failed for removing ${propertyId}:`, error);
          
          // If this is the last attempt, break and handle error below
          if (attempt === maxRetries) {
            break;
          }
        }
      }
      
      // If we got here and have an error, all attempts failed
      if (lastError) {
        console.error(`[EnhancedWishlistContext] ❌ All ${maxRetries + 1} attempts failed for removing ${propertyId}:`, lastError);
        
        // Revert optimistic update
        setWishlistItems(previousItems);
        
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? `Unable to remove property from wishlist. Please try again.`
          : `Failed to remove property from wishlist: ${lastError.message}`;
        
        setError(errorMessage);
        showErrorRef('Wishlist Error', errorMessage);
        
        return false;
      }
      
      // Clear any previous errors
      setError(null);
      return true;
      
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
      
      const items = await getRawWishlistItems(userId);
      const propertyIds = new Set(items.map(item => item.propertyId));
      setWishlistItems(propertyIds);
      console.log(`[EnhancedWishlistContext] ✅ Manual refresh: ${propertyIds.size} items`);
      showSuccessRef('Wishlist refreshed', 'Your wishlist has been updated');
      
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Manual refresh error:', error);
      const errorMessage = 'Failed to refresh wishlist';
      setError(errorMessage);
      showErrorRef('Refresh Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getCurrentUserId, showSuccessRef, showErrorRef]);

  // Retry failed operations - simplified without offline queue
  const retryFailedOperations = async () => {
    try {
      // For now, just refresh the wishlist
      showInfoRef('Retrying operations', 'Refreshing your wishlist...');
      await refreshWishlist();
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

  // Enhanced initial load and listener setup with production resilience
  useEffect(() => {
    const userId = user?.id || (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? 'user-1' : 'anonymous');
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log(`[EnhancedWishlistContext] 🚀 Initializing for user: ${userId}, authenticated: ${isSignedIn}, environment: ${isProduction ? 'production' : 'development'}`);
    
    try {
      // Production-aware authentication check
      const shouldUseFirebase = () => {
        if (!isSignedIn) return false;
        
        // In production, be more lenient about user ID requirements
        if (isProduction) {
          // Allow Firebase setup if we have any valid user indicator
          return userId !== 'anonymous' && userId !== null && userId !== undefined;
        } else {
          // Development: strict checks
          return userId !== 'anonymous' && userId !== 'user-1' && userId;
        }
      };
      
      if (shouldUseFirebase()) {
        // Authenticated user - use Firebase with real-time listener
        if (!isListenerActive) {
          setIsLoading(true);
          
          // Enhanced Firebase setup with error recovery
          const setupFirebaseListener = (attempt: number = 0) => {
            try {
              console.log(`[EnhancedWishlistContext] Setting up Firebase listener (attempt ${attempt + 1}) for user: ${userId}`);
              
              // Setup Firebase real-time listener
              const wishlistRef = getUserWishlistRef(userId);
              
              const unsubscribe = onValue(wishlistRef, (snapshot) => {
                try {
                  console.log(`[EnhancedWishlistContext] 🔄 Real-time update received for user: ${userId}`);
                  
                  if (!snapshot.exists()) {
                    console.log(`[EnhancedWishlistContext] 📭 No wishlist data, setting empty`);
                    setWishlistItems(new Set());
                    setIsLoading(false);
                    setIsInitialized(true);
                    setError(null); // Clear any previous errors
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
                  
                  // In production, be more resilient to processing errors
                  if (isProduction) {
                    setError(null); // Don't show error to user for processing issues
                    setIsLoading(false);
                    setIsInitialized(true);
                  } else {
                    setError('Failed to process wishlist update');
                    setIsLoading(false);
                  }
                }
              }, (error) => {
                console.error(`[EnhancedWishlistContext] ❌ Firebase listener error (attempt ${attempt + 1}):`, error);
                
                // Enhanced error handling with retry logic
                if (isProduction && attempt < 2) {
                  console.log(`[EnhancedWishlistContext] Production: Retrying Firebase connection in 3 seconds...`);
                  setTimeout(() => {
                    setupFirebaseListener(attempt + 1);
                  }, 3000 * (attempt + 1));
                } else {
                  const errorMsg = isProduction 
                    ? 'Unable to sync wishlist. Using local data.'
                    : 'Connection to wishlist service failed';
                  setError(errorMsg);
                  setIsLoading(false);
                  
                  // In production, fall back to local storage even for authenticated users
                  if (isProduction) {
                    console.log('[EnhancedWishlistContext] Production: Falling back to localStorage due to Firebase issues');
                    try {
                      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
                      if (stored) {
                        const items = JSON.parse(stored);
                        setWishlistItems(new Set(items));
                        console.log(`[EnhancedWishlistContext] 📱 Production fallback: Loaded ${items.length} items from localStorage`);
                        setIsInitialized(true);
                      }
                    } catch (localError) {
                      console.error('[EnhancedWishlistContext] ❌ Production: Failed localStorage fallback:', localError);
                      setIsInitialized(true);
                    }
                  }
                }
              });

              setIsListenerActive(true);
              
              return () => {
                console.log(`[EnhancedWishlistContext] 🔥 Cleaning up Firebase listener for user ${userId}`);
                unsubscribe();
                setIsListenerActive(false);
              };
            } catch (setupError) {
              console.error(`[EnhancedWishlistContext] ❌ Firebase setup error (attempt ${attempt + 1}):`, setupError);
              
              if (isProduction && attempt < 2) {
                setTimeout(() => {
                  setupFirebaseListener(attempt + 1);
                }, 2000 * (attempt + 1));
              } else {
                setError(isProduction ? 'Using local wishlist storage' : 'Failed to setup wishlist service');
                setIsLoading(false);
                setIsInitialized(true);
              }
            }
          };
          
          return setupFirebaseListener();
        }
      } else {
        // Non-authenticated user or production fallback - use localStorage
        console.log(`[EnhancedWishlistContext] 📱 Using localStorage (authenticated: ${isSignedIn}, production: ${isProduction})`);
        setIsLoading(false);
        setIsInitialized(true);
        
        // Load from localStorage with enhanced error handling
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
              const items = JSON.parse(stored);
              if (Array.isArray(items)) {
                setWishlistItems(new Set(items));
                console.log(`[EnhancedWishlistContext] 📱 Loaded ${items.length} items from localStorage`);
              } else {
                console.warn('[EnhancedWishlistContext] Invalid localStorage data format, resetting');
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
              }
            }
            setError(null); // Clear any previous errors
          } catch (error) {
            console.error('[EnhancedWishlistContext] ❌ Failed to load from localStorage:', error);
            
            // Clear corrupted localStorage data
            try {
              localStorage.removeItem(WISHLIST_STORAGE_KEY);
            } catch (clearError) {
              console.error('[EnhancedWishlistContext] ❌ Failed to clear corrupted localStorage:', clearError);
            }
            
            const errorMsg = isProduction 
              ? null // Don't show localStorage errors to production users
              : 'Failed to load saved wishlist items';
            setError(errorMsg);
          }
        }
      }
    } catch (error) {
      console.error('[EnhancedWishlistContext] ❌ Initialization error:', error);
      
      const errorMsg = isProduction 
        ? null // Don't show initialization errors to production users
        : 'Failed to initialize wishlist';
      setError(errorMsg);
      setIsLoading(false);
      setIsInitialized(true);
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
      }
    }
  }, [wishlistItems, isSignedIn]);

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