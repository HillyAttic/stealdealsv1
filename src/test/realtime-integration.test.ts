/**
 * Integration test for real-time functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { RealTimeService } from '@/lib/realtime/service';

describe('Real-Time Service Integration', () => {
  let realTimeService: RealTimeService;
  
  beforeEach(() => {
    realTimeService = RealTimeService.getInstance();
    // Clean up any existing connections
    realTimeService.cleanup();
  });
  
  afterEach(() => {
    realTimeService.cleanup();
  });

  it('should create singleton instance', () => {
    const instance1 = RealTimeService.getInstance();
    const instance2 = RealTimeService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle user subscriptions', () => {
    const userId = 'test-user-1';
    const mockCallback = jest.fn();
    
    // Subscribe to user updates
    const unsubscribe = realTimeService.subscribeToUserUpdates(userId, mockCallback);
    
    // Broadcast update
    realTimeService.broadcastWishlistUpdate(userId, 'add', 'property-123', 1);
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'wishlist_update',
      userId,
      data: {
        action: 'add',
        propertyId: 'property-123',
        userId,
        wishlistCount: 1
      },
      timestamp: expect.any(String)
    });
    
    // Clean up
    unsubscribe();
  });

  it('should handle global subscriptions', () => {
    const mockCallback = jest.fn();
    
    // Subscribe to global updates
    const unsubscribe = realTimeService.subscribeToGlobalUpdates(mockCallback);
    
    // Broadcast activity update
    realTimeService.broadcastActivityUpdate('user-1', 'property_view', 'property-456');
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'activity_update',
      userId: 'user-1',
      data: {
        activityType: 'property_view',
        propertyId: 'property-456',
        userId: 'user-1',
        metadata: undefined
      },
      timestamp: expect.any(String)
    });
    
    // Clean up
    unsubscribe();
  });

  it('should handle multiple subscribers', () => {
    const userId = 'test-user-2';
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    // Subscribe multiple callbacks
    const unsubscribe1 = realTimeService.subscribeToUserUpdates(userId, callback1);
    const unsubscribe2 = realTimeService.subscribeToUserUpdates(userId, callback2);
    
    // Broadcast update
    realTimeService.broadcastWishlistUpdate(userId, 'remove', 'property-789', 0);
    
    // Verify both callbacks were called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    
    // Clean up
    unsubscribe1();
    unsubscribe2();
  });

  it('should clean up empty emitters', () => {
    const userId = 'test-user-3';
    const mockCallback = jest.fn();
    
    // Subscribe and immediately unsubscribe
    const unsubscribe = realTimeService.subscribeToUserUpdates(userId, mockCallback);
    unsubscribe();
    
    // Get connection stats
    const stats = realTimeService.getConnectionStats();
    expect(stats.userConnections).toBe(0);
  });

  it('should broadcast global stats updates', () => {
    const mockCallback = jest.fn();
    
    // Subscribe to global updates
    const unsubscribe = realTimeService.subscribeToGlobalUpdates(mockCallback);
    
    // Broadcast global stats
    realTimeService.broadcastGlobalStatsUpdate({
      totalUsers: 100,
      totalActivities: 500,
      totalWishlistItems: 250,
      activeUsers: 25
    });
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'global_stats_update',
      data: {
        totalUsers: 100,
        totalActivities: 500,
        totalWishlistItems: 250,
        activeUsers: 25
      },
      timestamp: expect.any(String)
    });
    
    // Clean up
    unsubscribe();
  });

  it('should provide connection statistics', () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const globalCallback = jest.fn();
    
    // Create subscriptions
    const unsubscribe1 = realTimeService.subscribeToUserUpdates(userId1, callback1);
    const unsubscribe2 = realTimeService.subscribeToUserUpdates(userId2, callback2);
    const unsubscribeGlobal = realTimeService.subscribeToGlobalUpdates(globalCallback);
    
    // Get stats
    const stats = realTimeService.getConnectionStats();
    expect(stats.userConnections).toBe(2);
    expect(stats.globalConnections).toBe(1);
    expect(stats.totalConnections).toBe(3);
    
    // Clean up
    unsubscribe1();
    unsubscribe2();
    unsubscribeGlobal();
  });
});