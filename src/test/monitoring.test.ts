import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';;
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { AnalyticsTracker } from '@/lib/monitoring/analytics';
import { ErrorTracker } from '@/lib/monitoring/error-tracking';

describe('Monitoring System', () => {
  let performanceMonitor: PerformanceMonitor;
  let analyticsTracker: AnalyticsTracker;
  let errorTracker: ErrorTracker;

  beforeEach(() => {
    performanceMonitor = PerformanceMonitor.getInstance();
    analyticsTracker = AnalyticsTracker.getInstance();
    errorTracker = ErrorTracker.getInstance();
  });

  afterEach(async () => {
    // Clean up after tests
    performanceMonitor.cleanup();
    errorTracker.cleanup();
    await analyticsTracker.shutdown();
  });

  describe('PerformanceMonitor', () => {
    it('should record performance metrics', () => {
      performanceMonitor.recordMetric('test_metric', 100, 'ms', { test: true });
      
      const metrics = performanceMonitor.getMetrics('test_metric');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].unit).toBe('ms');
      expect(metrics[0].metadata?.test).toBe(true);
    });

    it('should track connection lifecycle', () => {
      const connectionId = 'test-connection-1';
      const userId = 'user-123';
      
      performanceMonitor.recordConnection(connectionId, userId, 'sse');
      
      let stats = performanceMonitor.getConnectionStats();
      expect(stats.total).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.byType.sse).toBe(1);
      
      performanceMonitor.recordDisconnection(connectionId, 'normal_closure');
      
      stats = performanceMonitor.getConnectionStats();
      expect(stats.total).toBe(1);
      expect(stats.active).toBe(0);
    });

    it('should track connection errors', () => {
      const connectionId = 'test-connection-2';
      
      performanceMonitor.recordConnection(connectionId, 'user-123', 'sse');
      performanceMonitor.recordConnectionError(connectionId, 'Connection timeout');
      
      const stats = performanceMonitor.getConnectionStats();
      expect(stats.errorRate).toBeGreaterThan(0);
    });

    it('should provide system health metrics', () => {
      const health = performanceMonitor.getLatestSystemHealth();
      
      if (health) {
        expect(health.timestamp).toBeInstanceOf(Date);
        expect(health.memoryUsage).toBeDefined();
        expect(health.memoryUsage.used).toBeGreaterThan(0);
        expect(health.memoryUsage.total).toBeGreaterThan(0);
        expect(health.memoryUsage.percentage).toBeGreaterThanOrEqual(0);
        expect(health.memoryUsage.percentage).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('AnalyticsTracker', () => {
    it('should track usage events', () => {
      const eventSpy = jest.fn();
      const unsubscribe = analyticsTracker.subscribe('track', eventSpy);
      
      analyticsTracker.track('test_event', 'wishlist', { test: true }, 'user-123');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'test_event',
          category: 'wishlist',
          userId: 'user-123',
          properties: { test: true }
        })
      );
      
      unsubscribe();
    });

    it('should track wishlist actions', () => {
      const eventSpy = jest.fn();
      const unsubscribe = analyticsTracker.subscribe('track', eventSpy);
      
      analyticsTracker.trackWishlistAction('add', 'property-123', 'user-123', 'session-456');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wishlist_add',
          category: 'wishlist',
          userId: 'user-123',
          properties: expect.objectContaining({
            propertyId: 'property-123',
            action: 'add'
          })
        })
      );
      
      unsubscribe();
    });

    it('should track search actions', () => {
      const eventSpy = jest.fn();
      const unsubscribe = analyticsTracker.subscribe('track', eventSpy);
      
      analyticsTracker.trackSearch('office space', { location: 'Mumbai' }, 25, 'user-123');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'search_performed',
          category: 'search',
          properties: expect.objectContaining({
            query: 'office space',
            filters: { location: 'Mumbai' },
            resultsCount: 25,
            queryLength: 12,
            filterCount: 1
          })
        })
      );
      
      unsubscribe();
    });

    it('should track errors', () => {
      const eventSpy = jest.fn();
      const unsubscribe = analyticsTracker.subscribe('track', eventSpy);
      
      analyticsTracker.trackError('validation_error', 'Invalid input', undefined, 'user-123');
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'error_occurred',
          category: 'error',
          properties: expect.objectContaining({
            errorType: 'validation_error',
            errorMessage: 'Invalid input'
          })
        })
      );
      
      unsubscribe();
    });
  });

  describe('ErrorTracker', () => {
    it('should track errors', () => {
      const errorId = errorTracker.trackError(
        'error',
        'Test error message',
        'Error stack trace',
        { userId: 'user-123', component: 'test' },
        ['test', 'unit']
      );
      
      expect(errorId).toBeDefined();
      
      const errors = errorTracker.getErrors({ limit: 1 });
      expect(errors).toHaveLength(1);
      expect(errors[0].id).toBe(errorId);
      expect(errors[0].message).toBe('Test error message');
      expect(errors[0].level).toBe('error');
      expect(errors[0].context.userId).toBe('user-123');
      expect(errors[0].tags).toContain('test');
    });

    it('should track API errors', () => {
      const errorId = errorTracker.trackAPIError(
        '/api/test',
        'POST',
        500,
        'Internal server error',
        'user-123',
        1500
      );
      
      const errors = errorTracker.getErrors({ component: 'api' });
      expect(errors).toHaveLength(1);
      expect(errors[0].context.metadata?.statusCode).toBe(500);
      expect(errors[0].context.metadata?.endpoint).toBe('/api/test');
      expect(errors[0].context.metadata?.method).toBe('POST');
    });

    it('should resolve errors', () => {
      const errorId = errorTracker.trackError('warning', 'Test warning', undefined, {}, []);
      
      let errors = errorTracker.getErrors({ resolved: false });
      expect(errors).toHaveLength(1);
      
      const resolved = errorTracker.resolveError(errorId, 'admin-user');
      expect(resolved).toBe(true);
      
      errors = errorTracker.getErrors({ resolved: false });
      expect(errors).toHaveLength(0);
      
      errors = errorTracker.getErrors({ resolved: true });
      expect(errors).toHaveLength(1);
      expect(errors[0].resolvedBy).toBe('admin-user');
    });

    it('should provide error statistics', () => {
      // Track some test errors
      errorTracker.trackError('error', 'Error 1', undefined, { component: 'api' }, []);
      errorTracker.trackError('warning', 'Warning 1', undefined, { component: 'client' }, []);
      errorTracker.trackError('critical', 'Critical 1', undefined, { component: 'api' }, []);
      
      const stats = errorTracker.getErrorStats(60);
      
      expect(stats.total).toBe(3);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.critical).toBe(1);
      expect(stats.byComponent.api).toBe(2);
      expect(stats.byComponent.client).toBe(1);
      expect(stats.unresolved).toBe(3);
      expect(stats.resolved).toBe(0);
    });

    it('should filter errors by criteria', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      errorTracker.trackError('error', 'Recent error', undefined, { component: 'api' }, ['recent']);
      
      // Test filtering by level
      let errors = errorTracker.getErrors({ level: 'error' });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.level === 'error')).toBe(true);
      
      // Test filtering by component
      errors = errorTracker.getErrors({ component: 'api' });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.context.component === 'api')).toBe(true);
      
      // Test filtering by tags
      errors = errorTracker.getErrors({ tags: ['recent'] });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.tags.includes('recent'))).toBe(true);
      
      // Test filtering by time
      errors = errorTracker.getErrors({ since: oneHourAgo });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.timestamp >= oneHourAgo)).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should work together for comprehensive monitoring', () => {
      // Simulate a complete user interaction
      const userId = 'user-integration-test';
      const sessionId = 'session-123';
      const propertyId = 'property-456';
      
      // Track performance
      const startTime = Date.now();
      performanceMonitor.recordMetric('api_requests', 1, 'count', { endpoint: '/api/wishlist' });
      
      // Track analytics
      analyticsTracker.trackWishlistAction('add', propertyId, userId, sessionId);
      
      // Simulate an error
      const errorId = errorTracker.trackError(
        'warning',
        'Temporary connection issue',
        undefined,
        { userId, component: 'realtime' },
        ['connection', 'temporary']
      );
      
      // Record response time
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('response_time', duration, 'ms', { endpoint: '/api/wishlist' });
      
      // Verify all systems recorded the events
      const metrics = performanceMonitor.getMetrics('api_requests');
      expect(metrics.length).toBeGreaterThan(0);
      
      const errors = errorTracker.getErrors({ userId });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].id).toBe(errorId);
      
      const responseTimeMetrics = performanceMonitor.getMetrics('response_time');
      expect(responseTimeMetrics.length).toBeGreaterThan(0);
    });
  });
});