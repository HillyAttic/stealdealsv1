// Client-side activity tracking utilities

interface ActivityData {
  type: 'property_view' | 'search' | 'wishlist_add' | 'wishlist_remove' | 'contact_inquiry';
  propertyId?: string;
  metadata?: Record<string, any>;
}

class ActivityTracker {
  private sessionId: string;
  private isTracking: boolean = true;
  private viewStartTime: number | null = null;
  private currentPropertyId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPageVisibilityTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageVisibilityTracking(): void {
    if (typeof window === 'undefined') return;

    // Track when user leaves/returns to page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Track when user leaves page
    window.addEventListener('beforeunload', () => {
      this.handlePageHidden();
    });
  }

  private handlePageHidden(): void {
    if (this.viewStartTime && this.currentPropertyId) {
      const duration = Date.now() - this.viewStartTime;
      this.trackPropertyView(this.currentPropertyId, { duration });
    }
  }

  private handlePageVisible(): void {
    this.viewStartTime = Date.now();
  }

  private async sendActivity(data: ActivityData): Promise<void> {
    if (!this.isTracking) return;

    try {
      const payload = {
        ...data,
        sessionId: this.sessionId,
        ipAddress: '127.0.0.1', // Will be set by server
        userAgent: navigator.userAgent,
        metadata: {
          ...data.metadata,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer
        }
      };

      await fetch('/api/user/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }

  /**
   * Track property view
   */
  public trackPropertyView(propertyId: string, metadata: Record<string, any> = {}): void {
    this.currentPropertyId = propertyId;
    this.viewStartTime = Date.now();

    this.sendActivity({
      type: 'property_view',
      propertyId,
      metadata: {
        ...metadata,
        source: metadata.source || this.getTrafficSource()
      }
    });
  }

  /**
   * Track search activity
   */
  public trackSearch(query: string, filters: Record<string, any> = {}, resultsCount: number = 0): void {
    this.sendActivity({
      type: 'search',
      metadata: {
        query,
        filters,
        resultsCount
      }
    });
  }

  /**
   * Track wishlist actions
   */
  public trackWishlistAdd(propertyId: string): void {
    this.sendActivity({
      type: 'wishlist_add',
      propertyId
    });
  }

  public trackWishlistRemove(propertyId: string): void {
    this.sendActivity({
      type: 'wishlist_remove',
      propertyId
    });
  }

  /**
   * Track contact inquiry
   */
  public trackContactInquiry(propertyId?: string, metadata: Record<string, any> = {}): void {
    this.sendActivity({
      type: 'contact_inquiry',
      propertyId,
      metadata
    });
  }

  /**
   * Get traffic source from referrer
   */
  private getTrafficSource(): string {
    if (typeof window === 'undefined') return 'direct';

    const referrer = document.referrer;
    if (!referrer) return 'direct';

    try {
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);

      // Same domain = internal navigation
      if (referrerUrl.hostname === currentUrl.hostname) {
        // Check if coming from search page
        if (referrer.includes('/search') || referrer.includes('?search')) {
          return 'search';
        }
        // Check if coming from wishlist
        if (referrer.includes('/wishlist')) {
          return 'wishlist';
        }
        return 'internal';
      }

      // External referrer
      if (referrerUrl.hostname.includes('google')) return 'google';
      if (referrerUrl.hostname.includes('facebook')) return 'facebook';
      if (referrerUrl.hostname.includes('twitter')) return 'twitter';
      
      return 'external';
    } catch {
      return 'direct';
    }
  }

  /**
   * Enable/disable tracking
   */
  public setTracking(enabled: boolean): void {
    this.isTracking = enabled;
  }

  /**
   * Get current session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
let activityTracker: ActivityTracker | null = null;

export function getActivityTracker(): ActivityTracker {
  if (typeof window === 'undefined') {
    // Return a mock tracker for SSR
    return {
      trackPropertyView: () => {},
      trackSearch: () => {},
      trackWishlistAdd: () => {},
      trackWishlistRemove: () => {},
      trackContactInquiry: () => {},
      setTracking: () => {},
      getSessionId: () => 'ssr-session'
    } as ActivityTracker;
  }

  if (!activityTracker) {
    activityTracker = new ActivityTracker();
  }

  return activityTracker;
}

// Export convenience functions
export const trackPropertyView = (propertyId: string, metadata?: Record<string, any>) => {
  getActivityTracker().trackPropertyView(propertyId, metadata);
};

export const trackSearch = (query: string, filters?: Record<string, any>, resultsCount?: number) => {
  getActivityTracker().trackSearch(query, filters, resultsCount);
};

export const trackWishlistAdd = (propertyId: string) => {
  getActivityTracker().trackWishlistAdd(propertyId);
};

export const trackWishlistRemove = (propertyId: string) => {
  getActivityTracker().trackWishlistRemove(propertyId);
};

export const trackContactInquiry = (propertyId?: string, metadata?: Record<string, any>) => {
  getActivityTracker().trackContactInquiry(propertyId, metadata);
};