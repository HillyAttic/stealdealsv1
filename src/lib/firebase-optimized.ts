/**
 * Optimized Firebase configuration with connection pooling and caching
 * This reduces CPU usage by reusing connections and caching frequently accessed data
 */

import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import { unstable_cache } from 'next/cache';

// Singleton pattern for Firebase Admin App
let adminApp: App | null = null;
let database: Database | null = null;

/**
 * Get or initialize Firebase Admin App with singleton pattern
 */
function getAdminApp(): App {
  if (!adminApp) {
    try {
      // Check if any apps are already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        adminApp = existingApps[0];
      } else {
        // Initialize new app
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
      }
      
      console.log('[Firebase] Admin app initialized successfully');
    } catch (error) {
      console.error('[Firebase] Error initializing admin app:', error);
      throw error;
    }
  }
  
  return adminApp;
}

/**
 * Get database instance with connection reuse
 */
function getOptimizedDatabase(): Database {
  if (!database) {
    database = getDatabase(getAdminApp());
    console.log('[Firebase] Database connection established');
  }
  return database;
}

// In-memory cache for frequently accessed data
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = {
  PROPERTIES: 5 * 60 * 1000, // 5 minutes
  FRANCHISES: 10 * 60 * 1000, // 10 minutes
  PLOTS: 10 * 60 * 1000, // 10 minutes
};

/**
 * Memory cache functions
 */
export const MemoryCache = {
  get(key: string): any | null {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      memoryCache.delete(key);
      return null;
    }
    
    console.log(`[Cache] Memory cache HIT for key: ${key}`);
    return entry.data;
  },

  set(key: string, data: any, ttl: number): void {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`[Cache] Memory cache SET for key: ${key} (TTL: ${ttl}ms)`);
  },

  clear(keyPattern?: string): void {
    if (keyPattern) {
      const keysToDelete = Array.from(memoryCache.keys()).filter(key => 
        key.includes(keyPattern)
      );
      keysToDelete.forEach(key => memoryCache.delete(key));
      console.log(`[Cache] Cleared ${keysToDelete.length} entries matching pattern: ${keyPattern}`);
    } else {
      memoryCache.clear();
      console.log('[Cache] Memory cache cleared completely');
    }
  },

  stats(): { size: number; keys: string[] } {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys())
    };
  }
};

/**
 * Optimized Firebase data fetcher with multi-layer caching
 */
export async function getOptimizedData(
  path: string, 
  cacheKey: string, 
  ttl: number = CACHE_TTL.PROPERTIES
): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Layer 1: Memory cache
    const cachedData = MemoryCache.get(cacheKey);
    if (cachedData) {
      console.log(`[Firebase] Data retrieved from memory cache in ${Date.now() - startTime}ms`);
      return cachedData;
    }

    // Layer 2: Firebase fetch with connection reuse
    console.log(`[Firebase] Fetching data from path: ${path}`);
    const db = getOptimizedDatabase();
    const snapshot = await db.ref(path).once('value');
    const data = snapshot.val();

    // Store in memory cache
    if (data) {
      MemoryCache.set(cacheKey, data, ttl);
    }

    const duration = Date.now() - startTime;
    console.log(`[Firebase] Data fetched from Firebase in ${duration}ms`);
    
    return data;
    
  } catch (error) {
    console.error(`[Firebase] Error fetching data from path ${path}:`, error);
    throw error;
  }
}

/**
 * Batch data fetcher for multiple paths
 */
export async function getBatchData(requests: Array<{
  path: string;
  cacheKey: string;
  ttl?: number;
}>): Promise<any[]> {
  const startTime = Date.now();
  
  console.log(`[Firebase] Batch fetching ${requests.length} data requests`);
  
  // First check memory cache for all requests
  const results: any[] = [];
  const uncachedRequests: typeof requests = [];
  
  for (const request of requests) {
    const cachedData = MemoryCache.get(request.cacheKey);
    if (cachedData) {
      results.push(cachedData);
    } else {
      results.push(null);
      uncachedRequests.push(request);
    }
  }
  
  // Fetch uncached data in parallel
  if (uncachedRequests.length > 0) {
    const db = getOptimizedDatabase();
    const fetchPromises = uncachedRequests.map(async (request) => {
      const snapshot = await db.ref(request.path).once('value');
      const data = snapshot.val();
      
      if (data) {
        MemoryCache.set(request.cacheKey, data, request.ttl || CACHE_TTL.PROPERTIES);
      }
      
      return data;
    });
    
    const fetchedData = await Promise.all(fetchPromises);
    
    // Merge fetched data with cached results
    let fetchIndex = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i] === null) {
        results[i] = fetchedData[fetchIndex++];
      }
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`[Firebase] Batch operation completed in ${duration}ms (${uncachedRequests.length} fetches)`);
  
  return results;
}

/**
 * Write operations with cache invalidation
 */
export async function writeOptimizedData(path: string, data: any, invalidatePattern?: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    const db = getOptimizedDatabase();
    await db.ref(path).set(data);
    
    // Invalidate related cache entries
    if (invalidatePattern) {
      MemoryCache.clear(invalidatePattern);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Firebase] Data written to ${path} in ${duration}ms`);
    
  } catch (error) {
    console.error(`[Firebase] Error writing data to ${path}:`, error);
    throw error;
  }
}

/**
 * Update operations with cache invalidation
 */
export async function updateOptimizedData(
  path: string, 
  updates: any, 
  invalidatePattern?: string
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const db = getOptimizedDatabase();
    await db.ref(path).update(updates);
    
    // Invalidate related cache entries
    if (invalidatePattern) {
      MemoryCache.clear(invalidatePattern);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Firebase] Data updated at ${path} in ${duration}ms`);
    
  } catch (error) {
    console.error(`[Firebase] Error updating data at ${path}:`, error);
    throw error;
  }
}

/**
 * Connection health check
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const db = getOptimizedDatabase();
    await db.ref('.info/connected').once('value');
    return true;
  } catch (error) {
    console.error('[Firebase] Connection check failed:', error);
    return false;
  }
}

/**
 * Performance monitoring
 */
export const FirebasePerformance = {
  getCacheStats: () => MemoryCache.stats(),
  
  getConnectionInfo: () => ({
    appName: adminApp?.name || 'Not initialized',
    databaseURL: database ? 'Connected' : 'Not connected',
    cacheSize: memoryCache.size,
  }),
  
  clearAllCaches: () => {
    MemoryCache.clear();
    console.log('[Firebase] All caches cleared');
  }
};

// Export constants for use in other modules
export const CACHE_KEYS = {
  VACANT_PROPERTIES: 'vacant_properties',
  PRELEASED_PROPERTIES: 'preleased_properties', 
  FRANCHISES: 'franchises',
  PLOTS: 'plots',
  ALL_PROPERTIES: 'all_properties',
  PROPERTY_BY_ID: (id: string) => `property_${id}`,
  FRANCHISE_BY_ID: (id: string) => `franchise_${id}`,
  PLOT_BY_ID: (id: string) => `plot_${id}`,
} as const;

export { CACHE_TTL };

// Export optimized functions for backward compatibility
export {
  getOptimizedDatabase as getDatabase,
  getAdminApp,
  getOptimizedData as getCachedData,
};