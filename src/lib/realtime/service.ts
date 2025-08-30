import { EventEmitter } from 'events';

export interface RealTimeEvent {
  type: 'wishlist_update' | 'activity_update' | 'user_stats_update' | 'global_stats_update';
  userId?: string;
  data: any;
  timestamp: string;
}

export interface WishlistUpdateData {
  action: 'add' | 'remove';
  propertyId: string;
  userId: string;
  wishlistCount: number;
}

export interface ActivityUpdateData {
  activityType: string;
  propertyId?: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface UserStatsUpdateData {
  userId: string;
  totalViews: number;
  totalWishlistItems: number;
  totalActivities: number;
  lastActivity: string;
}

export interface GlobalStatsUpdateData {
  totalUsers: number;
  totalActivities: number;
  totalWishlistItems: number;
  activeUsers: number;
}

/**
 * Real-time service for broadcasting user events using Server-Sent Events
 */
export class RealTimeService {
  private static instance: RealTimeService;
  private globalEmitter: EventEmitter;
  private userEmitters: Map<string, EventEmitter>;
  private connectionCount: number = 0;

  private constructor() {
    this.globalEmitter = new EventEmitter();
    this.userEmitters = new Map();
    
    // Set max listeners to prevent memory leak warnings
    this.globalEmitter.setMaxListeners(100);
    
    console.log('[RealTimeService] 🚀 Real-time service initialized');
  }

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  /**
   * Broadcast wishlist update to all relevant subscribers
   */
  public broadcastWishlistUpdate(userId: string, action: 'add' | 'remove', propertyId: string, wishlistCount: number = 0): void {
    const updateData: WishlistUpdateData = {
      action,
      propertyId,
      userId,
      wishlistCount
    };

    const event: RealTimeEvent = {
      type: 'wishlist_update',
      userId,
      data: updateData,
      timestamp: new Date().toISOString()
    };

    console.log(`[RealTimeService] 📡 Broadcasting wishlist update: ${action} ${propertyId} for user ${userId}`);

    // Broadcast to user-specific subscribers
    this.broadcastToUser(userId, event);
    
    // Broadcast to global subscribers (admin dashboard)
    this.broadcastToGlobal(event);
  }

  /**
   * Broadcast activity update to all relevant subscribers
   */
  public broadcastActivityUpdate(userId: string, activityType: string, propertyId?: string, metadata?: Record<string, any>): void {
    const updateData: ActivityUpdateData = {
      activityType,
      propertyId,
      userId,
      metadata
    };

    const event: RealTimeEvent = {
      type: 'activity_update',
      userId,
      data: updateData,
      timestamp: new Date().toISOString()
    };

    console.log(`[RealTimeService] 📡 Broadcasting activity update: ${activityType} for user ${userId}`);

    // Broadcast to user-specific subscribers
    this.broadcastToUser(userId, event);
    
    // Broadcast to global subscribers (admin dashboard)
    this.broadcastToGlobal(event);
  }

  /**
   * Broadcast user statistics update
   */
  public broadcastUserStatsUpdate(userId: string, stats: Omit<UserStatsUpdateData, 'userId'>): void {
    const updateData: UserStatsUpdateData = {
      userId,
      ...stats
    };

    const event: RealTimeEvent = {
      type: 'user_stats_update',
      userId,
      data: updateData,
      timestamp: new Date().toISOString()
    };

    console.log(`[RealTimeService] 📡 Broadcasting user stats update for user ${userId}`);

    // Broadcast to user-specific subscribers
    this.broadcastToUser(userId, event);
    
    // Broadcast to global subscribers (admin dashboard)
    this.broadcastToGlobal(event);
  }

  /**
   * Broadcast global statistics update
   */
  public broadcastGlobalStatsUpdate(stats: GlobalStatsUpdateData): void {
    const event: RealTimeEvent = {
      type: 'global_stats_update',
      data: stats,
      timestamp: new Date().toISOString()
    };

    console.log(`[RealTimeService] 📡 Broadcasting global stats update`);

    // Broadcast to global subscribers only (admin dashboard)
    this.broadcastToGlobal(event);
  }

  /**
   * Subscribe to user-specific updates
   */
  public subscribeToUserUpdates(userId: string, callback: (event: RealTimeEvent) => void): () => void {
    console.log(`[RealTimeService] 👤 Setting up user subscription for ${userId}`);
    
    // Get or create user-specific emitter
    let userEmitter = this.userEmitters.get(userId);
    if (!userEmitter) {
      userEmitter = new EventEmitter();
      userEmitter.setMaxListeners(50);
      this.userEmitters.set(userId, userEmitter);
    }

    // Add listener
    userEmitter.on('update', callback);
    this.connectionCount++;

    console.log(`[RealTimeService] ✅ User subscription established for ${userId} (${this.connectionCount} total connections)`);

    // Return unsubscribe function
    return () => {
      console.log(`[RealTimeService] 👤 Cleaning up user subscription for ${userId}`);
      userEmitter?.off('update', callback);
      this.connectionCount--;

      // Clean up empty emitter
      if (userEmitter && userEmitter.listenerCount('update') === 0) {
        this.userEmitters.delete(userId);
        console.log(`[RealTimeService] 🗑️ Removed empty user emitter for ${userId}`);
      }

      console.log(`[RealTimeService] ✅ User subscription cleaned up for ${userId} (${this.connectionCount} total connections)`);
    };
  }

  /**
   * Subscribe to global updates (admin dashboard)
   */
  public subscribeToGlobalUpdates(callback: (event: RealTimeEvent) => void): () => void {
    console.log(`[RealTimeService] 🌐 Setting up global subscription`);
    
    this.globalEmitter.on('update', callback);
    this.connectionCount++;

    console.log(`[RealTimeService] ✅ Global subscription established (${this.connectionCount} total connections)`);

    // Return unsubscribe function
    return () => {
      console.log(`[RealTimeService] 🌐 Cleaning up global subscription`);
      this.globalEmitter.off('update', callback);
      this.connectionCount--;
      console.log(`[RealTimeService] ✅ Global subscription cleaned up (${this.connectionCount} total connections)`);
    };
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): { totalConnections: number; userConnections: number; globalConnections: number } {
    const userConnections = Array.from(this.userEmitters.values())
      .reduce((total, emitter) => total + emitter.listenerCount('update'), 0);
    const globalConnections = this.globalEmitter.listenerCount('update');

    return {
      totalConnections: this.connectionCount,
      userConnections,
      globalConnections
    };
  }

  /**
   * Broadcast event to user-specific subscribers
   */
  private broadcastToUser(userId: string, event: RealTimeEvent): void {
    const userEmitter = this.userEmitters.get(userId);
    if (userEmitter && userEmitter.listenerCount('update') > 0) {
      userEmitter.emit('update', event);
      console.log(`[RealTimeService] 📤 Event sent to ${userEmitter.listenerCount('update')} user subscribers for ${userId}`);
    }
  }

  /**
   * Broadcast event to global subscribers
   */
  private broadcastToGlobal(event: RealTimeEvent): void {
    if (this.globalEmitter.listenerCount('update') > 0) {
      this.globalEmitter.emit('update', event);
      console.log(`[RealTimeService] 📤 Event sent to ${this.globalEmitter.listenerCount('update')} global subscribers`);
    }
  }

  /**
   * Clean up all connections (for testing/shutdown)
   */
  public cleanup(): void {
    console.log('[RealTimeService] 🧹 Cleaning up all connections');
    
    this.globalEmitter.removeAllListeners();
    this.userEmitters.forEach(emitter => emitter.removeAllListeners());
    this.userEmitters.clear();
    this.connectionCount = 0;
    
    console.log('[RealTimeService] ✅ All connections cleaned up');
  }
}