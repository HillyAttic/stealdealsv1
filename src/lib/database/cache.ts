/**
 * In-memory caching service for frequently accessed data
 * Implements LRU (Least Recently Used) cache with TTL (Time To Live)
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if item has expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.defaultTTL;

    // If cache is at max size, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, item);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    };
  }

  /**
   * Clean expired items
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Cache service for different data types
 */
class CacheService {
  // Further increased TTL values for better performance
  private userWishlistCache = new LRUCache<any[]>(500, 15 * 60 * 1000); // 15 minutes TTL (increased from 10 minutes)
  private userActivityCache = new LRUCache<any[]>(500, 10 * 60 * 1000); // 10 minutes TTL (increased from 5 minutes)
  private propertyCache = new LRUCache<any>(2000, 60 * 60 * 1000); // 60 minutes TTL (increased from 30 minutes)
  private userStatsCache = new LRUCache<any>(200, 15 * 60 * 1000); // 15 minutes TTL (increased from 10 minutes)
  private globalStatsCache = new LRUCache<any>(10, 5 * 60 * 1000); // 5 minutes TTL (increased from 2 minutes)

  /**
   * Wishlist cache methods
   */
  getUserWishlist(userId: string): any[] | null {
    return this.userWishlistCache.get(`wishlist:${userId}`);
  }

  setUserWishlist(userId: string, wishlist: any[], ttl?: number): void {
    this.userWishlistCache.set(`wishlist:${userId}`, wishlist, ttl);
  }

  invalidateUserWishlist(userId: string): void {
    this.userWishlistCache.delete(`wishlist:${userId}`);
  }

  /**
   * Activity cache methods
   */
  getUserActivity(userId: string, key: string = 'default'): any[] | null {
    return this.userActivityCache.get(`activity:${userId}:${key}`);
  }

  setUserActivity(userId: string, activities: any[], key: string = 'default', ttl?: number): void {
    this.userActivityCache.set(`activity:${userId}:${key}`, activities, ttl);
  }

  invalidateUserActivity(userId: string, key?: string): void {
    if (key) {
      this.userActivityCache.delete(`activity:${userId}:${key}`);
    } else {
      // Invalidate all activity cache for user
      const keys = this.userActivityCache.keys().filter(k => k.startsWith(`activity:${userId}:`));
      keys.forEach(k => this.userActivityCache.delete(k));
    }
  }

  /**
   * Property cache methods
   */
  getProperty(propertyId: string): any | null {
    return this.propertyCache.get(`property:${propertyId}`);
  }

  setProperty(propertyId: string, property: any, ttl?: number): void {
    this.propertyCache.set(`property:${propertyId}`, property, ttl);
  }

  invalidateProperty(propertyId: string): void {
    this.propertyCache.delete(`property:${propertyId}`);
  }

  /**
   * User stats cache methods
   */
  getUserStats(userId: string, type: string = 'general'): any | null {
    return this.userStatsCache.get(`stats:${userId}:${type}`);
  }

  setUserStats(userId: string, stats: any, type: string = 'general', ttl?: number): void {
    this.userStatsCache.set(`stats:${userId}:${type}`, stats, ttl);
  }

  invalidateUserStats(userId: string, type?: string): void {
    if (type) {
      this.userStatsCache.delete(`stats:${userId}:${type}`);
    } else {
      // Invalidate all stats for user
      const keys = this.userStatsCache.keys().filter(k => k.startsWith(`stats:${userId}:`));
      keys.forEach(k => this.userStatsCache.delete(k));
    }
  }

  /**
   * Global stats cache methods
   */
  getGlobalStats(key: string): any | null {
    return this.globalStatsCache.get(`global:${key}`);
  }

  setGlobalStats(key: string, stats: any, ttl?: number): void {
    this.globalStatsCache.set(`global:${key}`, stats, ttl);
  }

  invalidateGlobalStats(key?: string): void {
    if (key) {
      this.globalStatsCache.delete(`global:${key}`);
    } else {
      this.globalStatsCache.clear();
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getAllStats(): Record<string, CacheStats> {
    return {
      wishlist: this.userWishlistCache.getStats(),
      activity: this.userActivityCache.getStats(),
      property: this.propertyCache.getStats(),
      userStats: this.userStatsCache.getStats(),
      globalStats: this.globalStatsCache.getStats()
    };
  }

  /**
   * Clean up expired items in all caches
   */
  cleanup(): Record<string, number> {
    return {
      wishlist: this.userWishlistCache.cleanup(),
      activity: this.userActivityCache.cleanup(),
      property: this.propertyCache.cleanup(),
      userStats: this.userStatsCache.cleanup(),
      globalStats: this.globalStatsCache.cleanup()
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.userWishlistCache.clear();
    this.userActivityCache.clear();
    this.propertyCache.clear();
    this.userStatsCache.clear();
    this.globalStatsCache.clear();
  }

  /**
   * Invalidate user-related caches when user data changes
   */
  invalidateUserCaches(userId: string): void {
    this.invalidateUserWishlist(userId);
    this.invalidateUserActivity(userId);
    this.invalidateUserStats(userId);
  }
}

// Singleton instance
const cacheService = new CacheService();

// Auto cleanup every 5 minutes
setInterval(() => {
  const cleaned = cacheService.cleanup();
  const totalCleaned = Object.values(cleaned).reduce((sum, count) => sum + count, 0);
  if (totalCleaned > 0) {
    console.log(`[Cache] Cleaned up ${totalCleaned} expired items:`, cleaned);
  }
}, 5 * 60 * 1000);

export { CacheService, cacheService };
export type { CacheStats };