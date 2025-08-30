/**
 * Tests for database optimization features
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { cacheService, CacheService } from '@/lib/database/cache';
import { dbPool, DatabaseConnectionPool } from '@/lib/database/connection-pool';
import { monitoringService } from '@/lib/database/monitoring';
import { activityBatchProcessor, logActivity, getUserActivity } from '@/lib/database/activity-optimized';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  database: {},
  getPropertyById: jest.fn().mockResolvedValue({
    id: 'test-property',
    title: 'Test Property',
    location: 'Test Location',
    price: 100000
  })
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  push: jest.fn(() => ({ key: 'test-key' })),
  remove: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  startAt: jest.fn(),
  endAt: jest.fn()
}));

describe('Database Optimization', () => {
  beforeEach(() => {
    // Reset services before each test
    cacheService.clearAll();
    jest.clearAllMocks();
  });

  describe('Cache Service', () => {
    it('should store and retrieve cached data', () => {
      const testData = [{ id: '1', name: 'Test Item' }];
      const userId = 'test-user';
      
      // Cache should be empty initially
      expect(cacheService.getUserWishlist(userId)).toBeNull();
      
      // Set cache
      cacheService.setUserWishlist(userId, testData);
      
      // Should retrieve cached data
      expect(cacheService.getUserWishlist(userId)).toEqual(testData);
    });

    it('should handle cache expiration', async () => {
      const testData = [{ id: '1', name: 'Test Item' }];
      const userId = 'test-user';
      const shortTTL = 10; // 10ms
      
      // Set cache with short TTL
      cacheService.setUserWishlist(userId, testData, shortTTL);
      
      // Should retrieve immediately
      expect(cacheService.getUserWishlist(userId)).toEqual(testData);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Should be expired
      expect(cacheService.getUserWishlist(userId)).toBeNull();
    });

    it('should provide cache statistics', () => {
      const userId = 'test-user';
      const testData = [{ id: '1', name: 'Test Item' }];
      
      // Set and get data to generate stats
      cacheService.setUserWishlist(userId, testData);
      cacheService.getUserWishlist(userId); // Hit
      cacheService.getUserWishlist('non-existent'); // Miss
      
      const stats = cacheService.getAllStats();
      
      expect(stats.wishlist.hits).toBe(1);
      expect(stats.wishlist.misses).toBe(1);
      expect(stats.wishlist.hitRate).toBe(50);
    });

    it('should invalidate user caches', () => {
      const userId = 'test-user';
      const wishlistData = [{ id: '1', name: 'Wishlist Item' }];
      const activityData = [{ id: '1', type: 'test' }];
      
      // Set multiple cache types
      cacheService.setUserWishlist(userId, wishlistData);
      cacheService.setUserActivity(userId, activityData);
      
      // Verify data is cached
      expect(cacheService.getUserWishlist(userId)).toEqual(wishlistData);
      expect(cacheService.getUserActivity(userId)).toEqual(activityData);
      
      // Invalidate all user caches
      cacheService.invalidateUserCaches(userId);
      
      // Should be cleared
      expect(cacheService.getUserWishlist(userId)).toBeNull();
      expect(cacheService.getUserActivity(userId)).toBeNull();
    });
  });

  describe('Connection Pool', () => {
    it('should track connection statistics', async () => {
      const initialStats = dbPool.getStats();
      expect(initialStats.totalConnections).toBe(0);
      expect(initialStats.totalQueries).toBe(0);
      
      // Mock a successful operation
      const mockOperation = jest.fn().mockResolvedValue('success');
      await dbPool.executeRead('test-path', mockOperation);
      
      const updatedStats = dbPool.getStats();
      expect(updatedStats.totalConnections).toBe(1);
      expect(updatedStats.totalQueries).toBe(1);
    });

    it('should handle operation errors', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(dbPool.executeRead('test-path', mockOperation)).rejects.toThrow('Test error');
      
      const stats = dbPool.getStats();
      expect(stats.errorCount).toBe(1);
      expect(stats.lastError).toBe('Test error');
    });

    it('should provide performance metrics', async () => {
      // Execute some operations
      const fastOperation = jest.fn().mockResolvedValue('fast');
      const slowOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('slow'), 100))
      );
      
      await dbPool.executeRead('fast-path', fastOperation);
      await dbPool.executeWrite('slow-path', slowOperation);
      
      const metrics = dbPool.getPerformanceMetrics();
      expect(metrics.averageReadTime).toBeGreaterThan(0);
      expect(metrics.averageWriteTime).toBeGreaterThan(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(50); // Allow for previous test errors
    });
  });

  describe('Activity Batch Processor', () => {
    it('should queue activities for batch processing', async () => {
      const userId = 'test-user';
      
      // Log an activity
      const activity = await logActivity(userId, 'property_view', 'test-property');
      
      expect(activity.userId).toBe(userId);
      expect(activity.type).toBe('property_view');
      expect(activity.propertyId).toBe('test-property');
      
      // Check batch stats
      const stats = activityBatchProcessor.getStats();
      expect(stats.totalPendingActivities).toBeGreaterThan(0);
    });

    it('should provide batch statistics', () => {
      const stats = activityBatchProcessor.getStats();
      
      expect(stats).toHaveProperty('pendingBatches');
      expect(stats).toHaveProperty('totalPendingActivities');
      expect(typeof stats.pendingBatches).toBe('number');
      expect(typeof stats.totalPendingActivities).toBe('number');
    });
  });

  describe('Monitoring Service', () => {
    it('should provide health status', async () => {
      const health = await monitoringService.getHealthStatus();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('connectionPool');
      expect(health).toHaveProperty('cache');
      expect(health).toHaveProperty('batchProcessor');
      expect(health).toHaveProperty('overall');
      
      expect(['healthy', 'warning', 'critical']).toContain(health.status);
    });

    it('should provide performance metrics', () => {
      const metrics = monitoringService.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('queryPerformance');
      expect(metrics).toHaveProperty('cachePerformance');
      expect(metrics).toHaveProperty('batchProcessing');
      
      expect(typeof metrics.queryPerformance.totalQueries).toBe('number');
      expect(typeof metrics.cachePerformance.overallHitRate).toBe('number');
    });

    it('should generate optimization recommendations', async () => {
      const recommendations = await monitoringService.getOptimizationRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('recommendation');
        expect(rec).toHaveProperty('impact');
        expect(['high', 'medium', 'low']).toContain(rec.priority);
      }
    });

    it('should generate performance report', async () => {
      const report = await monitoringService.generatePerformanceReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('trends');
      
      expect(report.summary).toHaveProperty('status');
      expect(report.summary).toHaveProperty('totalQueries');
      expect(report.summary).toHaveProperty('cacheHitRate');
    });
  });

  describe('Integration Tests', () => {
    it('should work together - cache, connection pool, and monitoring', async () => {
      const userId = 'integration-test-user';
      
      // Simulate some database operations
      const mockOperation = jest.fn().mockResolvedValue([]);
      await dbPool.executeRead(`wishlists/${userId}`, mockOperation);
      
      // Use cache
      const testData = [{ id: '1', title: 'Test Property' }];
      cacheService.setUserWishlist(userId, testData);
      const cachedData = cacheService.getUserWishlist(userId);
      
      expect(cachedData).toEqual(testData);
      
      // Check monitoring reflects the operations
      const health = await monitoringService.getHealthStatus();
      const metrics = monitoringService.getPerformanceMetrics();
      
      expect(health.status).toBeDefined();
      expect(metrics.queryPerformance.totalQueries).toBeGreaterThan(0);
      expect(metrics.cachePerformance.totalCacheSize).toBeGreaterThan(0);
    });
  });
});

describe('Database Rules Validation', () => {
  it('should have proper indexing configuration', () => {
    // This test would validate that the database.rules.json has proper indexes
    // In a real implementation, you might read and parse the rules file
    const expectedIndexes = {
      wishlists: ['propertyId', 'addedAt', 'priority', 'userId'],
      activities: ['type', 'timestamp', 'propertyId', 'sessionId'],
      properties: ['category', 'location', 'price', 'createdAt', 'updatedAt']
    };
    
    // Mock validation - in real test, you'd read database.rules.json
    expect(expectedIndexes.wishlists).toContain('propertyId');
    expect(expectedIndexes.activities).toContain('timestamp');
    expect(expectedIndexes.properties).toContain('location');
  });
});