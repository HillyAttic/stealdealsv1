'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { UserActivity, ActivityResponse, EngagementData } from '@/types/auth';

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
  logActivity: (
    type: UserActivity['type'], 
    propertyId?: string, 
    metadata?: Record<string, any>
  ) => Promise<void>;
  getActivityHistory: (limit?: number) => Promise<UserActivity[]>;
  refreshActivities: () => Promise<void>;
  clearError: () => void;
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

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
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
  
  // Batching state
  const pendingActivities = useRef<PendingActivity[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingBatch = useRef(false);

  // Generate session ID for activity tracking
  const sessionId = useRef<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionId.current = sessionStorage.getItem('activity_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('activity_session_id', sessionId.current);
    }
  }, []);

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

  // Process batch of activities
  const processBatch = useCallback(async () => {
    if (isProcessingBatch.current || pendingActivities.current.length === 0) {
      return;
    }

    isProcessingBatch.current = true;
    const activitiesToProcess = [...pendingActivities.current];
    pendingActivities.current = [];

    console.log(`[ActivityContext] 📦 Processing batch of ${activitiesToProcess.length} activities`);

    try {
      // Process activities in parallel with retry logic
      const promises = activitiesToProcess.map(async (activity) => {
        let attempts = 0;
        while (attempts < MAX_RETRY_ATTEMPTS) {
          try {
            const response = await fetch('/api/user/activity', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: activity.type,
                propertyId: activity.propertyId,
                metadata: activity.metadata,
                sessionId: sessionId.current,
                ipAddress: '127.0.0.1', // Will be set by server
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                console.log(`[ActivityContext] ✅ Activity logged: ${activity.type}`);
                
                // Broadcast real-time update for activity
                try {
                  await fetch('/api/realtime/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'activity_update',
                      userId: getCurrentUserId(),
                      data: {
                        activityType: activity.type,
                        propertyId: activity.propertyId,
                        metadata: activity.metadata
                      }
                    })
                  });
                } catch (broadcastError) {
                  console.warn(`[ActivityContext] ⚠️ Failed to broadcast activity update:`, broadcastError);
                }
                
                return data.activity;
              }
            }
            throw new Error(`HTTP ${response.status}`);
          } catch (error) {
            attempts++;
            console.warn(`[ActivityContext] ⚠️ Activity logging attempt ${attempts} failed:`, error);
            
            if (attempts < MAX_RETRY_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
            } else {
              console.error(`[ActivityContext] ❌ Failed to log activity after ${MAX_RETRY_ATTEMPTS} attempts:`, activity);
              // Re-queue for later retry if user is authenticated
              if (isAuthenticated) {
                activity.retryCount = (activity.retryCount || 0) + 1;
                if (activity.retryCount < 5) { // Max 5 total retries
                  pendingActivities.current.push(activity);
                }
              }
            }
          }
        }
        return null;
      });

      await Promise.allSettled(promises);
      
      // Clear any previous errors if batch processing succeeded
      setError(null);
      
    } catch (error) {
      console.error('[ActivityContext] ❌ Batch processing error:', error);
      setError('Failed to log some activities');
    } finally {
      isProcessingBatch.current = false;
      
      // Schedule next batch if there are pending activities
      if (pendingActivities.current.length > 0) {
        scheduleBatch();
      }
    }
  }, [isAuthenticated]);

  // Schedule batch processing
  const scheduleBatch = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(() => {
      processBatch();
    }, BATCH_TIMEOUT);
  }, [processBatch]);

  // Log activity function
  const logActivity = useCallback(async (
    type: UserActivity['type'],
    propertyId?: string,
    metadata: Record<string, any> = {}
  ) => {
    const userId = getCurrentUserId();
    
    console.log(`[ActivityContext] 📝 Logging activity: ${type}`, { propertyId, userId });

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
  }, [getCurrentUserId, processBatch, scheduleBatch]);

  // Get activity history
  const getActivityHistory = useCallback(async (limit: number = 50): Promise<UserActivity[]> => {
    const userId = getCurrentUserId();
    
    if (!isAuthenticated || userId === 'anonymous') {
      console.log('[ActivityContext] 📭 No authenticated user, returning empty activity history');
      return [];
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`[ActivityContext] 📊 Retrieved ${data.data.length} activities`);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to get activity history');
      }
    } catch (error) {
      console.error('[ActivityContext] ❌ Error getting activity history:', error);
      setError('Failed to load activity history');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserId, isAuthenticated]);

  // Refresh activities
  const refreshActivities = useCallback(async () => {
    const userId = getCurrentUserId();
    
    if (!isAuthenticated || userId === 'anonymous') {
      console.log('[ActivityContext] 📭 No authenticated user, skipping refresh');
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
      
      // Get recent activities and engagement metrics
      const [activitiesResponse, engagementResponse] = await Promise.all([
        fetch('/api/user/activity?limit=20'),
        fetch('/api/user/activity?type=engagement')
      ]);

      if (!activitiesResponse.ok || !engagementResponse.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const [activitiesData, engagementData] = await Promise.all([
        activitiesResponse.json(),
        engagementResponse.json()
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

        console.log(`[ActivityContext] 🔄 Refreshed activities: ${recentActivities.length} total`);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('[ActivityContext] ❌ Error refreshing activities:', error);
      setError('Failed to refresh activities');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserId, isAuthenticated]);

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
    logActivity,
    getActivityHistory,
    refreshActivities,
    clearError
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
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
        logActivity: async () => {},
        getActivityHistory: async () => [],
        refreshActivities: async () => {},
        clearError: () => {}
      };
    }
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
}