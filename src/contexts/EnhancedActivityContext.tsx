'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useToast } from '@/contexts/ToastContext';
import { UserActivity, ActivityResponse, EngagementData, ActivityType } from '@/types/auth';
import { retryWithBackoff, DEFAULT_RETRY_OPTIONS } from '@/lib/utils/retry';
import { getOfflineQueue } from '@/lib/utils/offline-queue';
import { useActivityErrorHandler } from '@/components/error-boundaries/ActivityErrorBoundary';
import { clientSession } from '@/lib/auth/client-session';

interface ActivityStats {
  totalViews: number;
  totalSearches: number;
  totalWishlistActions: number;
  totalActivities: number;
  recentActivities: UserActivity[];
}

interface ActivityContextType {
  activities: UserActivity[];
  stats: ActivityStats;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  queuedActivities: number;
  logActivity: (
    type: UserActivity['type'], 
    propertyId?: string, 
    metadata?: Record<string, any>
  ) => Promise<void>;
  getActivityHistory: (limit?: number) => Promise<UserActivity[]>;
  refreshActivities: () => Promise<void>;
  clearError: () => void;
  retryFailedActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Activity batching configuration
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000; // 5 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

interface PendingActivity {
  type: UserActivity['type'];
  propertyId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  retryCount: number;
}

export function EnhancedActivityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { handleError: handleBoundaryError } = useActivityErrorHandler();
  
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
  
  // Create stable reference for error handler
  const handleBoundaryErrorStable = useCallback((error: Error) => {
    handleBoundaryError(error);
  }, [handleBoundaryError]);
  
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalViews: 0,
    totalSearches: 0,
    totalWishlistActions: 0,
    totalActivities: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [queuedActivities, setQueuedActivities] = useState(0);
  
  // Batching state
  const pendingActivities = useRef<PendingActivity[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingBatch = useRef(false);
  
  const offlineQueue = getOfflineQueue();

  // Update queued activities count
  const updateQueuedActivitiesCount = useCallback(() => {
    const status = offlineQueue.getStatus();
    const activityOps = status.operations.filter(op => op.type === 'activity_log').length;
    setQueuedActivities(activityOps);
  }, [offlineQueue]);

  // Generate session ID for activity tracking
  const sessionId = useRef<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionId.current = sessionStorage.getItem('activity_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('activity_session_id', sessionId.current);
    }
  }, []);

  // Setup online/offline detection with stable toast function references
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      showSuccessRef('Connection restored', 'Syncing your activity data...');
      updateQueuedActivitiesCount();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showWarningRef('Connection lost', 'Activity tracking will continue offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSuccessRef, showWarningRef, updateQueuedActivitiesCount]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get current user ID with fallback
  const getCurrentUserId = useCallback((): string => {
    if (user?.id) return user.id;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      return 'user-1'; // Development fallback
    }
    return 'anonymous';
  }, [user?.id]); 
 // Enhanced process batch with retry and offline support
  const processBatch = useCallback(async () => {
    if (isProcessingBatch.current || pendingActivities.current.length === 0) {
      return;
    }

    isProcessingBatch.current = true;
    const activitiesToProcess = [...pendingActivities.current];
    pendingActivities.current = [];

    console.log(`[EnhancedActivityContext] 📦 Processing batch of ${activitiesToProcess.length} activities`);

    try {
      for (const activity of activitiesToProcess) {
        try {
          if (isOnline) {
            // Try online processing with retry
            await retryWithBackoff(async () => {
              const response = await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: activity.type,
                  propertyId: activity.propertyId,
                  metadata: activity.metadata,
                  sessionId: sessionId.current,
                  ipAddress: '127.0.0.1',
                  userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
                })
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const data = await response.json();
              if (!data.success) {
                throw new Error(data.error || 'Failed to log activity');
              }

              return data.activity;
            }, {
              ...DEFAULT_RETRY_OPTIONS,
              maxAttempts: 2, // Fewer retries for activities
              retryCondition: (error) => {
                return error?.status >= 500 || 
                       error?.message?.includes('network') ||
                       error?.message?.includes('timeout');
              }
            });

            console.log(`[EnhancedActivityContext] ✅ Activity logged: ${activity.type}`);
          } else {
            // Queue for offline processing
            offlineQueue.add({
              type: 'activity_log',
              data: {
                type: activity.type,
                propertyId: activity.propertyId,
                metadata: activity.metadata,
                sessionId: sessionId.current,
                ipAddress: '127.0.0.1',
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
              },
              maxRetries: 5
            });
            updateQueuedActivitiesCount();
          }
        } catch (error) {
          console.warn(`[EnhancedActivityContext] ⚠️ Activity logging failed:`, error);
          
          // Re-queue for later retry if authenticated and not exceeded max retries
          if (isAuthenticated) {
            activity.retryCount = (activity.retryCount || 0) + 1;
            if (activity.retryCount < 3) { // Max 3 retries for batch processing
              pendingActivities.current.push(activity);
            } else {
              // Queue in offline queue as last resort
              offlineQueue.add({
                type: 'activity_log',
                data: {
                  type: activity.type,
                  propertyId: activity.propertyId,
                  metadata: activity.metadata,
                  sessionId: sessionId.current
                },
                maxRetries: 5
              });
              updateQueuedActivitiesCount();
            }
          }
        }
      }
      
      // Clear any previous errors if batch processing succeeded
      setError(null);
      
    } catch (error) {
      console.error('[EnhancedActivityContext] ❌ Batch processing error:', error);
      const errorMessage = 'Failed to log some activities';
      setError(errorMessage);
      handleBoundaryErrorStable(error as Error);
    } finally {
      isProcessingBatch.current = false;
      
      // Schedule next batch if there are pending activities
      if (pendingActivities.current.length > 0) {
        scheduleBatch();
      }
    }
  }, [isOnline, isAuthenticated, offlineQueue, updateQueuedActivitiesCount, handleBoundaryErrorStable]);

  // Schedule batch processing
  const scheduleBatch = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(() => {
      processBatch();
    }, BATCH_TIMEOUT);
  }, [processBatch]);

  // Enhanced log activity function with offline support
  const logActivity = useCallback(async (
    type: UserActivity['type'],
    propertyId?: string,
    metadata: Record<string, any> = {}
  ) => {
    const userId = getCurrentUserId();
    
    console.log(`[EnhancedActivityContext] 📝 Logging activity: ${type}`, { propertyId, userId });

    try {
      // Create pending activity
      const pendingActivity: PendingActivity = {
        type,
        propertyId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        retryCount: 0
      };

      // Add to pending batch
      pendingActivities.current.push(pendingActivity);

      // Update local stats optimistically
      setStats(prevStats => {
        const newStats = { ...prevStats };
        newStats.totalActivities++;
        
        switch (type) {
          case 'property_view':
            newStats.totalViews++;
            break;
          case 'search':
            newStats.totalSearches++;
            break;
          case 'wishlist_add':
          case 'wishlist_remove':
            newStats.totalWishlistActions++;
            break;
        }
        
        return newStats;
      });

      // Process immediately if batch is full, otherwise schedule
      if (pendingActivities.current.length >= BATCH_SIZE) {
        await processBatch();
      } else {
        scheduleBatch();
      }
    } catch (error) {
      console.error('[EnhancedActivityContext] ❌ Error logging activity:', error);
      handleBoundaryErrorStable(error as Error);
    }
  }, [getCurrentUserId, processBatch, scheduleBatch, handleBoundaryErrorStable]);

  // Enhanced get activity history with retry
  const getActivityHistory = useCallback(async (limit: number = 50): Promise<UserActivity[]> => {
    const userId = getCurrentUserId();
    
    if (!isAuthenticated || userId === 'anonymous') {
      console.log('[EnhancedActivityContext] 📭 No authenticated user, returning empty activity history');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const activities = await retryWithBackoff(async () => {
        // Get authentication token from client session
        const session = clientSession.getSession();
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (session?.token) {
          headers['Authorization'] = `Bearer ${session.token}`;
        }
        
        const response = await fetch(`/api/user/activity?limit=${limit}`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get activity history');
        }
        
        return data.data;
      }, DEFAULT_RETRY_OPTIONS);
      
      console.log(`[EnhancedActivityContext] 📊 Retrieved ${activities.length} activities`);
      return activities;
      
    } catch (error) {
      console.error('[EnhancedActivityContext] ❌ Error getting activity history:', error);
      
      // Check if this is an authentication error and we have mock authentication
      const isAuthError = error instanceof Error && 
        (error.message.includes('Authentication') || error.message.includes('401'));
        
      if (isAuthError && typeof window !== 'undefined') {
        const mockAuth = localStorage.getItem('mock_authenticated');
        const mockUser = localStorage.getItem('mock_user');
        
        if (mockAuth === 'true' && mockUser) {
          console.log('[EnhancedActivityContext] 🎭 Activity history auth error, returning mock data');
          
          // Return mock activity history
          const mockHistory: UserActivity[] = Array.from({ length: Math.min(limit, 10) }, (_, index) => ({
            id: `mock-${index + 1}`,
            userId: JSON.parse(mockUser).id || '1',
            type: ['property_view', 'search', 'wishlist_add'][index % 3] as ActivityType,
            propertyId: index % 3 === 1 ? undefined : `mock-property-${index + 1}`,
            timestamp: new Date(Date.now() - (index * 3600000)),
            metadata: {
              page: 'mock-page',
              action: 'mock-action'
            },
            sessionId: 'mock-session',
            ipAddress: '127.0.0.1',
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
          }));
          
          return mockHistory;
        }
      }
      
      const errorMessage = 'Failed to load activity history';
      setError(errorMessage);
      handleBoundaryErrorStable(error as Error);
      showErrorRef('Activity Error', errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserId, isAuthenticated, handleBoundaryErrorStable, showErrorRef]); 
 // Enhanced refresh activities with error handling
  const refreshActivities = useCallback(async () => {
    const userId = getCurrentUserId();
    
    if (!isAuthenticated || userId === 'anonymous') {
      console.log('[EnhancedActivityContext] 📭 No authenticated user, skipping refresh');
      setActivities([]);
      setStats({
        totalViews: 0,
        totalSearches: 0,
        totalWishlistActions: 0,
        totalActivities: 0,
        recentActivities: []
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get recent activities and engagement metrics with retry
      // Get authentication token from client session
      const session = clientSession.getSession();
      console.log('[EnhancedActivityContext] 🔍 Session debug:', {
        hasSession: !!session,
        hasToken: !!session?.token,
        tokenType: session?.token ? (session.token === 'mock_token' ? 'mock' : 'real') : 'none',
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        expiresAt: session?.expiresAt,
        isExpired: session?.expiresAt ? session.expiresAt <= new Date() : 'unknown',
        isAuthenticated
      });
      
      // Debug current document cookies
      if (typeof window !== 'undefined') {
        console.log('[EnhancedActivityContext] 🍪 Document cookies:', document.cookie);
      }
      
      // First try to call the debug endpoint to see authentication status
      try {
        console.log('[EnhancedActivityContext] 🔍 Checking auth status via debug endpoint...');
        const debugResponse = await fetch('/api/debug/auth-status', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          console.log('[EnhancedActivityContext] 🕵️ Auth debug data:', debugData.debug);
        } else {
          console.warn('[EnhancedActivityContext] ⚠️ Debug endpoint failed:', debugResponse.status);
        }
      } catch (debugError) {
        console.warn('[EnhancedActivityContext] ⚠️ Debug endpoint error:', debugError);
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add authentication header if we have a valid token
      if (session?.token && session.token !== 'mock_token') {
        headers['Authorization'] = `Bearer ${session.token}`;
        console.log('[EnhancedActivityContext] 🔐 Using Bearer token authentication');
      } else {
        console.log('[EnhancedActivityContext] ⚠️ No valid token found, relying on cookie authentication');
      }
      
      const [activitiesData, engagementData] = await Promise.all([
        retryWithBackoff(async () => {
          console.log('[EnhancedActivityContext] 🚀 Attempting API call: /api/user/activity?limit=20');
          const response = await fetch('/api/user/activity?limit=20', {
            method: 'GET',
            headers,
            credentials: 'include'
          });
          
          console.log('[EnhancedActivityContext] 📊 API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              console.error('[EnhancedActivityContext] 🚫 Authentication failed - detailed analysis:');
              
              // Log response details
              try {
                const errorBody = await response.text();
                console.error('[EnhancedActivityContext] 📄 Error response body:', errorBody);
              } catch (e) {
                console.error('[EnhancedActivityContext] ❌ Could not read error response body');
              }
              
              // Check current cookies in browser
              if (typeof window !== 'undefined') {
                const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                  const [key, value] = cookie.trim().split('=');
                  acc[key] = value;
                  return acc;
                }, {} as Record<string, string>);
                
                console.error('[EnhancedActivityContext] 🍪 Current browser cookies:', {
                  auth_session: cookies.auth_session ? 'Present' : 'Missing',
                  auth_user: cookies.auth_user ? 'Present' : 'Missing',
                  allCookies: Object.keys(cookies)
                });
              }
              
              // Try to refresh session if possible
              console.log('[EnhancedActivityContext] 🔄 Attempting session refresh...');
              const refreshed = await clientSession.refreshSession();
              console.log('[EnhancedActivityContext] 🔄 Session refresh result:', refreshed);
              
              if (!refreshed) {
                // Try checking if we have valid localStorage mock auth
                if (typeof window !== 'undefined') {
                  const mockAuth = localStorage.getItem('mock_authenticated');
                  const mockUser = localStorage.getItem('mock_user');
                  console.log('[EnhancedActivityContext] 🎭 Mock auth check:', {
                    mockAuth,
                    mockUser: mockUser ? JSON.parse(mockUser) : null
                  });
                  
                  // If we have mock authentication, create mock activity data
                  if (mockAuth === 'true' && mockUser) {
                    console.log('[EnhancedActivityContext] 🎭 Using mock authentication, returning mock data');
                    
                    // Return mock activity data instead of failing
                    const mockActivities: UserActivity[] = [
                      {
                        id: '1',
                        userId: JSON.parse(mockUser).id || '1',
                        type: 'property_view' as ActivityType,
                        propertyId: 'mock-property-1',
                        timestamp: new Date(),
                        metadata: { page: 'property-details' },
                        sessionId: 'mock-session',
                        ipAddress: '127.0.0.1',
                        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
                      },
                      {
                        id: '2',
                        userId: JSON.parse(mockUser).id || '1',
                        type: 'search' as ActivityType,
                        propertyId: undefined,
                        timestamp: new Date(Date.now() - 3600000),
                        metadata: { query: 'mock search' },
                        sessionId: 'mock-session',
                        ipAddress: '127.0.0.1',
                        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
                      }
                    ];
                    
                    const mockEngagement = {
                      totalSessions: 5,
                      averageSessionDuration: 300,
                      pagesPerSession: 3.2,
                      bounceRate: 0.25
                    };
                    
                    // Update state with mock data
                    setActivities(mockActivities);
                    
                    const totalViews = mockActivities.filter((a: UserActivity) => a.type === 'property_view').length;
                    const totalSearches = mockActivities.filter((a: UserActivity) => a.type === 'search').length;
                    const totalWishlistActions = 0;
                    
                    setStats({
                      totalViews,
                      totalSearches,
                      totalWishlistActions,
                      totalActivities: mockActivities.length,
                      recentActivities: mockActivities.slice(0, 10)
                    });
                    
                    console.log('[EnhancedActivityContext] ✅ Mock activity data loaded successfully');
                    showSuccessRef('Activities loaded', 'Mock activity data has been loaded');
                    return; // Exit early with mock data
                  }
                }
                
                throw new Error('Authentication expired. Please log in again.');
              }
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        }, DEFAULT_RETRY_OPTIONS),
        
        retryWithBackoff(async () => {
          console.log('[EnhancedActivityContext] 🚀 Attempting API call: /api/user/activity?type=engagement');
          const response = await fetch('/api/user/activity?type=engagement', {
            method: 'GET',
            headers,
            credentials: 'include'
          });
          
          console.log('[EnhancedActivityContext] 📊 Engagement API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              console.error('[EnhancedActivityContext] 🚫 Authentication failed for engagement API - detailed analysis:');
              
              // Log response details
              try {
                const errorBody = await response.text();
                console.error('[EnhancedActivityContext] 📄 Engagement API error response body:', errorBody);
              } catch (e) {
                console.error('[EnhancedActivityContext] ❌ Could not read engagement API error response body');
              }
              
              throw new Error('Authentication expired. Please log in again.');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        }, DEFAULT_RETRY_OPTIONS)
      ]);

      if (activitiesData.success && engagementData.success) {
        const recentActivities = activitiesData.data || [];
        const engagement: EngagementData = engagementData.data || {
          totalSessions: 0,
          averageSessionDuration: 0,
          pagesPerSession: 0,
          bounceRate: 0
        };

        setActivities(recentActivities);
        
        // Calculate stats from activities
        const totalViews = recentActivities.filter((a: UserActivity) => a.type === 'property_view').length;
        const totalSearches = recentActivities.filter((a: UserActivity) => a.type === 'search').length;
        const totalWishlistActions = recentActivities.filter((a: UserActivity) => 
          a.type === 'wishlist_add' || a.type === 'wishlist_remove'
        ).length;

        setStats({
          totalViews,
          totalSearches,
          totalWishlistActions,
          totalActivities: recentActivities.length,
          recentActivities: recentActivities.slice(0, 10)
        });

        console.log(`[EnhancedActivityContext] 🔄 Refreshed activities: ${recentActivities.length} total`);
        showSuccessRef('Activities refreshed', 'Your activity data has been updated');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('[EnhancedActivityContext] ❌ Error refreshing activities:', error);
      
      // Check if this is an authentication error and we have mock authentication
      const isAuthError = error instanceof Error && 
        (error.message.includes('Authentication') || error.message.includes('401'));
        
      if (isAuthError && typeof window !== 'undefined') {
        const mockAuth = localStorage.getItem('mock_authenticated');
        const mockUser = localStorage.getItem('mock_user');
        
        if (mockAuth === 'true' && mockUser) {
          console.log('[EnhancedActivityContext] 🎭 Authentication error, falling back to mock data');
          
          // Provide mock activity data as fallback
          const mockActivities: UserActivity[] = [
            {
              id: '1',
              userId: JSON.parse(mockUser).id || '1',
              type: 'property_view' as ActivityType,
              propertyId: 'mock-property-1',
              timestamp: new Date(),
              metadata: { page: 'property-details' },
              sessionId: 'mock-session',
              ipAddress: '127.0.0.1',
              userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
            },
            {
              id: '2',
              userId: JSON.parse(mockUser).id || '1',
              type: 'search' as ActivityType,
              propertyId: undefined,
              timestamp: new Date(Date.now() - 3600000),
              metadata: { query: 'mock search' },
              sessionId: 'mock-session',
              ipAddress: '127.0.0.1',
              userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
            },
            {
              id: '3',
              userId: JSON.parse(mockUser).id || '1',
              type: 'wishlist_add' as ActivityType,
              propertyId: 'mock-property-2',
              timestamp: new Date(Date.now() - 7200000),
              metadata: { action: 'add' },
              sessionId: 'mock-session',
              ipAddress: '127.0.0.1',
              userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
            }
          ];
          
          setActivities(mockActivities);
          
          const totalViews = mockActivities.filter((a: UserActivity) => a.type === 'property_view').length;
          const totalSearches = mockActivities.filter((a: UserActivity) => a.type === 'search').length;
          const totalWishlistActions = mockActivities.filter((a: UserActivity) => 
            a.type === 'wishlist_add' || a.type === 'wishlist_remove'
          ).length;
          
          setStats({
            totalViews,
            totalSearches,
            totalWishlistActions,
            totalActivities: mockActivities.length,
            recentActivities: mockActivities.slice(0, 10)
          });
          
          setError(null); // Clear error since we provided fallback data
          console.log('[EnhancedActivityContext] ✅ Mock activity data provided as fallback');
          showSuccessRef('Activities loaded', 'Activity data loaded (offline mode)');
          return;
        }
      }
      
      const errorMessage = 'Failed to refresh activities';
      setError(errorMessage);
      handleBoundaryErrorStable(error as Error);
      showErrorRef('Refresh Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserId, isAuthenticated, handleBoundaryErrorStable, showSuccessRef, showErrorRef]);

  // Retry failed activities
  const retryFailedActivities = useCallback(async () => {
    try {
      // Process any pending batch activities
      if (pendingActivities.current.length > 0) {
        showInfoRef('Retrying activities', `Processing ${pendingActivities.current.length} pending activities...`);
        await processBatch();
      }
      
      // Check offline queue
      const status = offlineQueue.getStatus();
      const activityOps = status.operations.filter(op => op.type === 'activity_log').length;
      
      if (activityOps > 0) {
        showInfoRef('Syncing activities', `Attempting to sync ${activityOps} queued activities...`);
        updateQueuedActivitiesCount();
      } else if (pendingActivities.current.length === 0) {
        showInfoRef('No pending activities', 'All activities are already synced');
      }
    } catch (error) {
      console.error('[EnhancedActivityContext] ❌ Error retrying activities:', error);
      showErrorRef('Retry Error', 'Failed to retry pending activities');
    }
  }, [processBatch, offlineQueue, updateQueuedActivitiesCount, showInfoRef, showErrorRef]);

  // Initialize activities on auth change
  useEffect(() => {
    if (isAuthenticated) {
      refreshActivities();
    } else {
      // Clear activities for non-authenticated users
      setActivities([]);
      setStats({
        totalViews: 0,
        totalSearches: 0,
        totalWishlistActions: 0,
        totalActivities: 0,
        recentActivities: []
      });
    }
  }, [isAuthenticated, refreshActivities]);

  // Update queued activities count periodically
  useEffect(() => {
    const interval = setInterval(updateQueuedActivitiesCount, 5000);
    return () => clearInterval(interval);
  }, [updateQueuedActivitiesCount]);

  // Cleanup batch timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      // Process any remaining activities before unmounting
      if (pendingActivities.current.length > 0) {
        processBatch();
      }
    };
  }, [processBatch]);

  const value: ActivityContextType = {
    activities,
    stats,
    isLoading,
    error,
    isOnline,
    queuedActivities,
    logActivity,
    getActivityHistory,
    refreshActivities,
    clearError,
    retryFailedActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useEnhancedActivityContext() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    // Check if we're in a server-side rendering context
    if (typeof window === 'undefined') {
      // Return a mock context for SSR to prevent build errors
      return {
        activities: [],
        stats: {
          totalViews: 0,
          totalSearches: 0,
          totalWishlistActions: 0,
          totalActivities: 0,
          recentActivities: []
        },
        isLoading: false,
        error: null,
        isOnline: true,
        queuedActivities: 0,
        logActivity: async () => {},
        getActivityHistory: async () => [],
        refreshActivities: async () => {},
        clearError: () => {},
        retryFailedActivities: async () => {}
      };
    }
    throw new Error('useEnhancedActivityContext must be used within an EnhancedActivityProvider');
  }
  return context;
}