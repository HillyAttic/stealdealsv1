import { useCallback } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface TrackingMetadata {
  [key: string]: any;
}

export function useAnalyticsTracking() {
  const { user } = useAuthContext();

  const trackInteraction = useCallback(async (
    type: 'property_view' | 'search' | 'wishlist_add' | 'wishlist_remove' | 'contact_inquiry',
    propertyId?: string,
    metadata: TrackingMetadata = {}
  ) => {
    if (!user) return; // Only track for authenticated users

    try {
      await fetch('/api/dashboard/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          propertyId,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
      // Fail silently - tracking shouldn't break user experience
    }
  }, [user]);

  const trackPropertyView = useCallback((propertyId: string, metadata: TrackingMetadata = {}) => {
    return trackInteraction('property_view', propertyId, {
      ...metadata,
      source: 'client_side_view'
    });
  }, [trackInteraction]);

  const trackSearch = useCallback((query: string, filters: Record<string, any> = {}) => {
    return trackInteraction('search', undefined, {
      query,
      filters,
      resultsCount: 0 // Will be updated when results are received
    });
  }, [trackInteraction]);

  const trackWishlistAdd = useCallback((propertyId: string, propertyTitle?: string) => {
    return trackInteraction('wishlist_add', propertyId, {
      propertyTitle,
      source: 'user_action'
    });
  }, [trackInteraction]);

  const trackWishlistRemove = useCallback((propertyId: string, propertyTitle?: string) => {
    return trackInteraction('wishlist_remove', propertyId, {
      propertyTitle,
      source: 'user_action'
    });
  }, [trackInteraction]);

  const trackContactInquiry = useCallback((propertyId: string, inquiryType: string, propertyTitle?: string) => {
    return trackInteraction('contact_inquiry', propertyId, {
      inquiryType,
      propertyTitle,
      source: 'user_action'
    });
  }, [trackInteraction]);

  // Track page views automatically when component mounts
  const trackPageView = useCallback((path?: string) => {
    const currentPath = path || window.location.pathname;
    
    // Extract property ID from URL if this is a property page
    const propertyMatch = currentPath.match(/\/properties\/([^\/]+)/);
    if (propertyMatch) {
      const propertyId = propertyMatch[1];
      trackPropertyView(propertyId, {
        path: currentPath,
        source: 'page_load',
        referrer: document.referrer
      });
    }
  }, [trackPropertyView]);

  return {
    trackInteraction,
    trackPropertyView,
    trackSearch,
    trackWishlistAdd,
    trackWishlistRemove,
    trackContactInquiry,
    trackPageView,
    isTrackingEnabled: !!user
  };
}