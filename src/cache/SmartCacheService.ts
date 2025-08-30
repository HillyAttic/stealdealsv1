// Mock implementation for testing
export class SmartCacheService {
  constructor(private memoryCache: any, private persistentCache: any) {}

  async get(key: string, options?: any) {
    // Check memory cache first
    const memoryData = this.memoryCache.get(key);
    if (memoryData) {
      this.trackHit();
      // Check if data is stale
      if (memoryData.ttl && memoryData.timestamp) {
        const age = Date.now() - memoryData.timestamp;
        if (age > memoryData.ttl) {
          // Data is expired
          if (options?.staleWhileRevalidate) {
            // Return stale data immediately, revalidate in background
            if (options.revalidateFn) {
              setTimeout(async () => {
                const freshData = await options.revalidateFn();
                this.memoryCache.set(key, {
                  value: freshData,
                  timestamp: Date.now(),
                  ttl: memoryData.ttl
                });
              }, 0);
            }
            return memoryData.value;
          } else {
            // Remove expired data
            this.memoryCache.delete(key);
            return null;
          }
        }
      }
      return memoryData.value;
    }

    // Fall back to persistent cache
    const persistentData = await this.persistentCache.get(key);
    if (persistentData) {
      this.trackHit();
      // Promote to memory cache
      this.memoryCache.set(key, persistentData);
      return persistentData.value;
    }

    this.trackMiss();
    return null;
  }

  async set(key: string, value: any, options?: any) {
    const ttl = options?.adaptiveTTL ? this.calculateAdaptiveTTL(key) : (options?.ttl || 60000);
    
    const cacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    };

    this.memoryCache.set(key, cacheEntry);
    await this.persistentCache.set(key, cacheEntry);
    return true;
  }

  private calculateAdaptiveTTL(key: string): number {
    // Mock adaptive TTL calculation - shorter TTL for frequently updated items
    return 30000; // 30 seconds for frequently updated items
  }

  async invalidate(key: string) {
    return true;
  }

  async clear() {
    return true;
  }

  private hits = 0;
  private misses = 0;

  getStats() {
    return {
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
      totalHits: this.hits,
      totalMisses: this.misses,
      memorySize: this.memoryCache.size()
    };
  }

  private trackHit() {
    this.hits++;
  }

  private trackMiss() {
    this.misses++;
  }

  async invalidatePattern(pattern: RegExp) {
    const keys = this.memoryCache.keys();
    for (const key of keys) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
        await this.persistentCache.delete(key);
      }
    }
    return true;
  }
}