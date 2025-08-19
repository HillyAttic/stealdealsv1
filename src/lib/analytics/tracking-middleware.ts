import { NextRequest } from 'next/server';
import { analytics } from './real-time-analytics';

interface TrackingData {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  path: string;
  method: string;
  timestamp: Date;
}

export class AnalyticsTrackingService {
  private static instance: AnalyticsTrackingService;
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  private constructor() {
    // Process tracking queue every 5 seconds
    setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  static getInstance(): AnalyticsTrackingService {
    if (!AnalyticsTrackingService.instance) {
      AnalyticsTrackingService.instance = new AnalyticsTrackingService();
    }
    return AnalyticsTrackingService.instance;
  }

  async trackPageView(data: TrackingData): Promise<void> {
    // Extract property ID from URL if this is a property page
    const propertyMatch = data.path.match(/\/properties\/([^\/]+)/);
    const propertyId = propertyMatch ? propertyMatch[1] : undefined;

    if (data.userId && propertyId) {
      this.queueTracking(() => 
        analytics.trackUserInteraction(
          data.userId!,
          'property_view',
          propertyId,
          {
            source: 'page_view',
            userAgent: data.userAgent,
            path: data.path
          }
        )
      );
    }
  }

  async trackSearch(userId: string, query: string, filters: Record<string, any> = {}): Promise<void> {
    this.queueTracking(() =>
      analytics.trackUserInteraction(
        userId,
        'search',
        undefined,
        {
          query,
          filters,
          timestamp: new Date().toISOString()
        }
      )
    );
  }

  async trackWishlistAction(userId: string, propertyId: string, action: 'add' | 'remove'): Promise<void> {
    this.queueTracking(() =>
      analytics.trackUserInteraction(
        userId,
        action === 'add' ? 'wishlist_add' : 'wishlist_remove',
        propertyId,
        {
          action,
          timestamp: new Date().toISOString()
        }
      )
    );
  }

  async trackContactInquiry(userId: string, propertyId: string, inquiryType: string): Promise<void> {
    this.queueTracking(() =>
      analytics.trackUserInteraction(
        userId,
        'contact_inquiry',
        propertyId,
        {
          inquiryType,
          timestamp: new Date().toISOString()
        }
      )
    );
  }

  private queueTracking(trackingFunction: () => Promise<void>): void {
    this.queue.push(trackingFunction);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // Process up to 10 items at once
      const batch = this.queue.splice(0, 10);
      await Promise.allSettled(batch.map(fn => fn()));
    } catch (error) {
      console.error('Error processing tracking queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const trackingService = AnalyticsTrackingService.getInstance();

// Helper function to extract user info from request
export function extractTrackingData(request: NextRequest, userId?: string): TrackingData {
  return {
    userId,
    sessionId: request.headers.get('x-session-id') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date()
  };
}