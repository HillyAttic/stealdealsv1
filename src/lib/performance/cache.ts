// Client-side caching utilities for user data and wishlist

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class PerformanceCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
    
    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  // Track cache hits/misses for analytics
  private trackHit(): void {
    this.hitCount++;
  }

  private trackMiss(): void {
    this.missCount++;
  }
}

// Create cache instances
export const userDataCache = new PerformanceCache({
  ttl: 10 * 60 * 1000, // 10 minutes for user data
  maxSize: 50
});

export const wishlistCache = new PerformanceCache({
  ttl: 5 * 60 * 1000, // 5 minutes for wishlist
  maxSize: 20
});

export const analyticsCache = new PerformanceCache({
  ttl: 15 * 60 * 1000, // 15 minutes for analytics
  maxSize: 30
});

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_WISHLIST: (userId: string) => `user_wishlist_${userId}`,
  USER_ACTIVITY: (userId: string) => `user_activity_${userId}`,
  USER_ANALYTICS: (userId: string) => `user_analytics_${userId}`,
  PROPERTY_DETAILS: (propertyId: string) => `property_${propertyId}`,
  ADMIN_USERS: (page: number, limit: number) => `admin_users_${page}_${limit}`,
  ADMIN_USER_DETAILS: (userId: string) => `admin_user_details_${userId}`
} as const;

// Cached API functions
export async function getCachedUserProfile(userId: string) {
  const cacheKey = CACHE_KEYS.USER_PROFILE(userId);
  
  // Try cache first
  const cached = userDataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();
    
    if (data.success) {
      userDataCache.set(cacheKey, data.user);
      return data.user;
    }
    
    throw new Error(data.error || 'Failed to fetch user profile');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function getCachedWishlist(userId: string) {
  const cacheKey = CACHE_KEYS.USER_WISHLIST(userId);
  
  // Try cache first
  const cached = wishlistCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const response = await fetch('/api/user/wishlist');
    const data = await response.json();
    
    if (data.success) {
      wishlistCache.set(cacheKey, data.properties);
      return data.properties;
    }
    
    throw new Error(data.error || 'Failed to fetch wishlist');
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
}

export async function getCachedUserAnalytics(userId: string) {
  const cacheKey = CACHE_KEYS.USER_ANALYTICS(userId);
  
  // Try cache first
  const cached = analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const response = await fetch('/api/user/analytics');
    const data = await response.json();
    
    if (data.success) {
      analyticsCache.set(cacheKey, data.analytics);
      return data.analytics;
    }
    
    throw new Error(data.error || 'Failed to fetch analytics');
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Cache invalidation functions
export function invalidateUserCache(userId: string) {
  userDataCache.delete(CACHE_KEYS.USER_PROFILE(userId));
  wishlistCache.delete(CACHE_KEYS.USER_WISHLIST(userId));
  analyticsCache.delete(CACHE_KEYS.USER_ANALYTICS(userId));
}

export function invalidateWishlistCache(userId: string) {
  wishlistCache.delete(CACHE_KEYS.USER_WISHLIST(userId));
}

// Cache warming functions
export async function warmUserCache(userId: string) {
  try {
    await Promise.all([
      getCachedUserProfile(userId),
      getCachedWishlist(userId)
    ]);
  } catch (error) {
    console.error('Error warming user cache:', error);
  }
}