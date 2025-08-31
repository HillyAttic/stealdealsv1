import { EventEmitter } from 'events';
import { database } from '@/lib/firebase';
import { ref, push, set, get, query, orderByChild, limitToLast, update } from 'firebase/database';

export interface UsageMetric {
  id: string;
  userId?: string;
  event: string;
  category: 'wishlist' | 'activity' | 'search' | 'navigation' | 'error';
  properties: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface EngagementMetric {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  totalWishlistActions: number;
  totalSearches: number;
  averageSessionDuration: number;
  lastActivity: Date;
  conversionRate: number;
}

export interface SystemUsageStats {
  totalUsers: number;
  activeUsers: number;
  totalWishlistItems: number;
  totalActivities: number;
  averageEngagement: number;
  topFeatures: Array<{ feature: string; usage: number }>;
  errorRate: number;
  performanceScore: number;
}

/**
 * Analytics tracking service for user engagement and system usage
 */
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private eventEmitter: EventEmitter;
  private metricsBuffer: UsageMetric[];
  private bufferSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.metricsBuffer = [];
    
    // Start periodic flushing
    this.startPeriodicFlush();
    
    console.log('[AnalyticsTracker] 📊 Analytics tracking initialized');
  }

  public static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Track a usage event
   */
  public track(
    event: string,
    category: UsageMetric['category'],
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    userAgent?: string,
    ipAddress?: string
  ): void {
    // Validate required fields
    if (!event || !category) {
      console.warn('[AnalyticsTracker] ⚠️ Skipping track call with missing required fields:', { event, category });
      return;
    }

    // Clean undefined values and sanitize string inputs
    const cleanUserId = userId && userId !== 'undefined' && userId.trim() !== '' ? userId.trim() : undefined;
    const cleanSessionId = sessionId && sessionId !== 'undefined' && sessionId.trim() !== '' ? sessionId.trim() : undefined;
    
    const metric: UsageMetric = {
      id: crypto.randomUUID(),
      event: event.trim(),
      category,
      properties: properties || {},
      timestamp: new Date(),
      ...(cleanUserId && { userId: cleanUserId }),
      ...(cleanSessionId && { sessionId: cleanSessionId }),
      ...(userAgent && { userAgent: userAgent.trim() }),
      ...(ipAddress && { ipAddress: ipAddress.trim() })
    };

    // Add to buffer
    this.metricsBuffer.push(metric);
    
    // Emit event for real-time processing
    this.eventEmitter.emit('track', metric);

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }

    console.log(`[AnalyticsTracker] 📈 Tracked event: ${event} (${category})`);
  }

  /**
   * Track wishlist action
   */
  public trackWishlistAction(
    action: 'add' | 'remove' | 'view',
    propertyId: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    this.track(
      `wishlist_${action}`,
      'wishlist',
      {
        propertyId,
        action,
        ...metadata
      },
      userId,
      sessionId
    );
  }

  /**
   * Track user activity
   */
  public trackActivity(
    activityType: string,
    userId?: string,
    propertyId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    this.track(
      `activity_${activityType}`,
      'activity',
      {
        activityType,
        propertyId,
        ...metadata
      },
      userId,
      sessionId
    );
  }

  /**
   * Track search action
   */
  public trackSearch(
    query: string,
    filters: Record<string, any>,
    resultsCount: number,
    userId?: string,
    sessionId?: string
  ): void {
    this.track(
      'search_performed',
      'search',
      {
        query,
        filters,
        resultsCount,
        queryLength: query.length,
        filterCount: Object.keys(filters).length
      },
      userId,
      sessionId
    );
  }

  /**
   * Track navigation event
   */
  public trackNavigation(
    page: string,
    referrer?: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    this.track(
      'page_view',
      'navigation',
      {
        page,
        referrer,
        ...metadata
      },
      userId,
      sessionId
    );
  }

  /**
   * Track error event
   */
  public trackError(
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    this.track(
      'error_occurred',
      'error',
      {
        errorType,
        errorMessage,
        stackTrace: process.env.NODE_ENV === 'development' ? stackTrace : undefined,
        ...metadata
      },
      userId,
      sessionId
    );
  }

  /**
   * Get user engagement metrics
   */
  public async getUserEngagement(userId: string): Promise<EngagementMetric | null> {
    try {
      const metricsRef = ref(database, `analytics/users/${userId}`);
      const snapshot = await get(metricsRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.val();
      return {
        userId,
        totalSessions: data.totalSessions || 0,
        totalPageViews: data.totalPageViews || 0,
        totalWishlistActions: data.totalWishlistActions || 0,
        totalSearches: data.totalSearches || 0,
        averageSessionDuration: data.averageSessionDuration || 0,
        lastActivity: new Date(data.lastActivity || Date.now()),
        conversionRate: data.conversionRate || 0
      };
    } catch (error) {
      console.error('[AnalyticsTracker] Error getting user engagement:', error);
      return null;
    }
  }

  /**
   * Get system usage statistics
   */
  public async getSystemUsageStats(): Promise<SystemUsageStats> {
    try {
      const statsRef = ref(database, 'analytics/system');
      const snapshot = await get(statsRef);
      
      const defaultStats: SystemUsageStats = {
        totalUsers: 0,
        activeUsers: 0,
        totalWishlistItems: 0,
        totalActivities: 0,
        averageEngagement: 0,
        topFeatures: [],
        errorRate: 0,
        performanceScore: 100
      };
      
      if (!snapshot.exists()) {
        return defaultStats;
      }
      
      const data = snapshot.val();
      return {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalWishlistItems: data.totalWishlistItems || 0,
        totalActivities: data.totalActivities || 0,
        averageEngagement: data.averageEngagement || 0,
        topFeatures: data.topFeatures || [],
        errorRate: data.errorRate || 0,
        performanceScore: data.performanceScore || 100
      };
    } catch (error) {
      console.error('[AnalyticsTracker] Error getting system usage stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalWishlistItems: 0,
        totalActivities: 0,
        averageEngagement: 0,
        topFeatures: [],
        errorRate: 0,
        performanceScore: 100
      };
    }
  }

  /**
   * Get analytics for a specific time period
   */
  public async getAnalyticsByPeriod(
    startDate: Date,
    endDate: Date,
    category?: UsageMetric['category']
  ): Promise<UsageMetric[]> {
    try {
      const analyticsRef = ref(database, 'analytics/events');
      const snapshot = await get(analyticsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const metrics: UsageMetric[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const timestamp = new Date(data.timestamp);
        
        if (timestamp >= startDate && timestamp <= endDate) {
          if (!category || data.category === category) {
            metrics.push({
              id: childSnapshot.key!,
              userId: data.userId,
              event: data.event,
              category: data.category,
              properties: data.properties || {},
              timestamp,
              sessionId: data.sessionId,
              userAgent: data.userAgent,
              ipAddress: data.ipAddress
            });
          }
        }
      });
      
      return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('[AnalyticsTracker] Error getting analytics by period:', error);
      return [];
    }
  }

  /**
   * Get top events by category
   */
  public async getTopEvents(
    category: UsageMetric['category'],
    limit: number = 10,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<Array<{ event: string; count: number; percentage: number }>> {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      const metrics = await this.getAnalyticsByPeriod(startDate, now, category);
      
      // Count events
      const eventCounts = new Map<string, number>();
      metrics.forEach(metric => {
        eventCounts.set(metric.event, (eventCounts.get(metric.event) || 0) + 1);
      });
      
      // Convert to array and sort
      const totalEvents = metrics.length;
      const topEvents = Array.from(eventCounts.entries())
        .map(([event, count]) => ({
          event,
          count,
          percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      
      return topEvents;
    } catch (error) {
      console.error('[AnalyticsTracker] Error getting top events:', error);
      return [];
    }
  }

  /**
   * Subscribe to analytics events
   */
  public subscribe(event: 'track' | 'flush', callback: (data: any) => void): () => void {
    this.eventEmitter.on(event, callback);
    
    return () => {
      this.eventEmitter.off(event, callback);
    };
  }

  /**
   * Flush metrics to Firebase
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      console.log(`[AnalyticsTracker] 💾 Flushing ${metricsToFlush.length} metrics to Firebase`);
      
      // Filter out metrics with invalid data and clean undefined values
      const validMetrics = metricsToFlush.filter(metric => {
        if (!metric.id || !metric.event || !metric.category) {
          console.warn('[AnalyticsTracker] ⚠️ Skipping metric with missing required fields:', metric);
          return false;
        }
        return true;
      }).map(metric => {
        // Clean undefined values by creating a clean object
        const cleanMetric: any = {
          id: metric.id,
          event: metric.event,
          category: metric.category,
          properties: metric.properties || {},
          timestamp: metric.timestamp.toISOString()
        };
        
        // Only add optional fields if they have valid values
        if (metric.userId && metric.userId !== 'undefined') {
          cleanMetric.userId = metric.userId;
        }
        if (metric.sessionId && metric.sessionId !== 'undefined') {
          cleanMetric.sessionId = metric.sessionId;
        }
        if (metric.userAgent) {
          cleanMetric.userAgent = metric.userAgent;
        }
        if (metric.ipAddress) {
          cleanMetric.ipAddress = metric.ipAddress;
        }
        
        return cleanMetric;
      });

      if (validMetrics.length === 0) {
        console.log('[AnalyticsTracker] ⚠️ No valid metrics to flush, skipping Firebase operation');
        return;
      }

      console.log(`[AnalyticsTracker] 💾 Processing ${validMetrics.length} valid metrics (filtered from ${metricsToFlush.length})`);
      
      // Store individual events
      const eventsRef = ref(database, 'analytics/events');
      const batch = validMetrics.map(async (metric) => {
        const eventRef = push(eventsRef);
        await set(eventRef, metric);
      });
      
      await Promise.all(batch);
      
      // Update aggregated stats (using original metrics for stats)
      await this.updateAggregatedStats(metricsToFlush);
      
      this.eventEmitter.emit('flush', { count: validMetrics.length });
      console.log(`[AnalyticsTracker] ✅ Successfully flushed ${validMetrics.length} metrics`);
      
    } catch (error) {
      console.error('[AnalyticsTracker] ❌ Error flushing metrics:', error);
      // Put metrics back in buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Update aggregated statistics
   */
  private async updateAggregatedStats(metrics: UsageMetric[]): Promise<void> {
    try {
      const userStats = new Map<string, any>();
      const systemStats = {
        totalEvents: metrics.length,
        wishlistActions: 0,
        activities: 0,
        searches: 0,
        errors: 0,
        pageViews: 0
      };

      // Process metrics
      metrics.forEach(metric => {
        // Update system stats
        switch (metric.category) {
          case 'wishlist':
            systemStats.wishlistActions++;
            break;
          case 'activity':
            systemStats.activities++;
            break;
          case 'search':
            systemStats.searches++;
            break;
          case 'error':
            systemStats.errors++;
            break;
          case 'navigation':
            if (metric.event === 'page_view') {
              systemStats.pageViews++;
            }
            break;
        }

        // Update user stats
        if (metric.userId) {
          const userStat = userStats.get(metric.userId) || {
            totalEvents: 0,
            wishlistActions: 0,
            activities: 0,
            searches: 0,
            pageViews: 0,
            lastActivity: metric.timestamp
          };

          userStat.totalEvents++;
          userStat.lastActivity = new Date(Math.max(
            userStat.lastActivity.getTime(),
            metric.timestamp.getTime()
          ));

          switch (metric.category) {
            case 'wishlist':
              userStat.wishlistActions++;
              break;
            case 'activity':
              userStat.activities++;
              break;
            case 'search':
              userStat.searches++;
              break;
            case 'navigation':
              if (metric.event === 'page_view') {
                userStat.pageViews++;
              }
              break;
          }

          userStats.set(metric.userId, userStat);
        }
      });

      // Update system stats in Firebase
      const systemRef = ref(database, 'analytics/system');
      const currentSystemStats = await get(systemRef);
      const existingStats = currentSystemStats.exists() ? currentSystemStats.val() : {};

      await update(systemRef, {
        totalActivities: (existingStats.totalActivities || 0) + systemStats.activities,
        totalWishlistItems: (existingStats.totalWishlistItems || 0) + systemStats.wishlistActions,
        totalEvents: (existingStats.totalEvents || 0) + systemStats.totalEvents,
        errorRate: systemStats.totalEvents > 0 ? (systemStats.errors / systemStats.totalEvents) * 100 : 0,
        lastUpdated: new Date().toISOString()
      });

      // Update user stats in Firebase
      for (const [userId, stats] of userStats.entries()) {
        const userRef = ref(database, `analytics/users/${userId}`);
        const currentUserStats = await get(userRef);
        const existingUserStats = currentUserStats.exists() ? currentUserStats.val() : {};

        await update(userRef, {
          totalWishlistActions: (existingUserStats.totalWishlistActions || 0) + stats.wishlistActions,
          totalActivities: (existingUserStats.totalActivities || 0) + stats.activities,
          totalSearches: (existingUserStats.totalSearches || 0) + stats.searches,
          totalPageViews: (existingUserStats.totalPageViews || 0) + stats.pageViews,
          lastActivity: stats.lastActivity.toISOString()
        });
      }

    } catch (error) {
      console.error('[AnalyticsTracker] Error updating aggregated stats:', error);
    }
  }

  /**
   * Start periodic flushing
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  /**
   * Stop periodic flushing and flush remaining metrics
   */
  public async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flushMetrics();
    console.log('[AnalyticsTracker] 🛑 Analytics tracker shutdown complete');
  }
}