'use client';

import { useCallback } from 'react';
import { useActivityContext } from '@/contexts/ActivityContext';
import { UserActivity } from '@/types/auth';

/**
 * Hook for logging user interactions and managing activity data
 */
export function useActivity() {
  const {
    activities,
    stats,
    isLoading,
    error,
    logActivity: contextLogActivity,
    getActivityHistory,
    refreshActivities,
    clearError
  } = useActivityContext();

  // Enhanced logging functions for specific activity types
  const logPropertyView = useCallback(async (
    propertyId: string,
    metadata: {
      propertyTitle?: string;
      duration?: number;
      source?: 'search' | 'wishlist' | 'direct' | 'recommendation';
      [key: string]: any;
    } = {}
  ) => {
    await contextLogActivity('property_view', propertyId, {
      ...metadata,
      viewedAt: new Date().toISOString()
    });
  }, [contextLogActivity]);

  const logSearch = useCallback(async (
    searchQuery: string,
    metadata: {
      filters?: Record<string, any>;
      resultsCount?: number;
      [key: string]: any;
    } = {}
  ) => {
    await contextLogActivity('search', undefined, {
      query: searchQuery,
      ...metadata,
      searchedAt: new Date().toISOString()
    });
  }, [contextLogActivity]);

  const logWishlistAdd = useCallback(async (
    propertyId: string,
    metadata: {
      propertyTitle?: string;
      [key: string]: any;
    } = {}
  ) => {
    await contextLogActivity('wishlist_add', propertyId, {
      ...metadata,
      addedAt: new Date().toISOString()
    });
  }, [contextLogActivity]);

  const logWishlistRemove = useCallback(async (
    propertyId: string,
    metadata: {
      propertyTitle?: string;
      [key: string]: any;
    } = {}
  ) => {
    await contextLogActivity('wishlist_remove', propertyId, {
      ...metadata,
      removedAt: new Date().toISOString()
    });
  }, [contextLogActivity]);

  const logContactInquiry = useCallback(async (
    propertyId: string,
    metadata: {
      propertyTitle?: string;
      inquiryType?: 'phone' | 'email' | 'form';
      [key: string]: any;
    } = {}
  ) => {
    await contextLogActivity('contact_inquiry', propertyId, {
      ...metadata,
      inquiredAt: new Date().toISOString()
    });
  }, [contextLogActivity]);

  // Generic activity logging
  const logActivity = useCallback(async (
    type: UserActivity['type'],
    propertyId?: string,
    metadata?: Record<string, any>
  ) => {
    await contextLogActivity(type, propertyId, metadata);
  }, [contextLogActivity]);

  // Activity analysis helpers
  const getRecentPropertyViews = useCallback(() => {
    return activities
      .filter(activity => activity.type === 'property_view')
      .slice(0, 10);
  }, [activities]);

  const getRecentSearches = useCallback(() => {
    return activities
      .filter(activity => activity.type === 'search')
      .slice(0, 10);
  }, [activities]);

  const getWishlistActivities = useCallback(() => {
    return activities
      .filter(activity => activity.type === 'wishlist_add' || activity.type === 'wishlist_remove')
      .slice(0, 10);
  }, [activities]);

  // Activity statistics
  const getActivityStats = useCallback(() => {
    return {
      ...stats,
      // Additional computed stats
      averageViewsPerDay: stats.totalActivities > 0 ? stats.totalViews / 7 : 0, // Assuming 7-day window
      wishlistConversionRate: stats.totalViews > 0 ? (stats.totalWishlistActions / stats.totalViews) * 100 : 0
    };
  }, [stats]);

  return {
    // Activity data
    activities,
    stats: getActivityStats(),
    isLoading,
    error,

    // Logging functions
    logActivity,
    logPropertyView,
    logSearch,
    logWishlistAdd,
    logWishlistRemove,
    logContactInquiry,

    // Data retrieval
    getActivityHistory,
    refreshActivities,

    // Activity analysis
    getRecentPropertyViews,
    getRecentSearches,
    getWishlistActivities,

    // Utility functions
    clearError
  };
}