/**
 * Mock analytics tracking service
 * This is a placeholder implementation to resolve module import errors
 */

// Mock AnalyticsTracker class
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  
  private constructor() {}
  
  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }
  
  trackEvent(
    eventName: string, 
    properties?: Record<string, any>,
    userId?: string
  ): void {
    // Mock implementation - just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, { userId, ...properties });
    }
  }
  
  trackError(
    error: Error, 
    context?: Record<string, any>
  ): void {
    // Mock implementation - just log to console
    console.error('[Analytics Error]', error.message, context);
  }
}