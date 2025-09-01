import { unstable_cache } from 'next/cache';
import { getVacantProperties, getAllFranchises, getAllPlots, Property, Franchise, Plot } from '../firebase';
import { getOptimizedData, CACHE_KEYS, CACHE_TTL, MemoryCache } from '../firebase-optimized';

// Cache configuration
const CACHE_TAGS = {
  VACANT_PROPERTIES: 'vacant-properties',
  FRANCHISES: 'franchises',
  PLOTS: 'plots',
  ALL_PROPERTIES: 'all-properties'
};

const CACHE_REVALIDATE = {
  PROPERTIES: 300, // 5 minutes
  FRANCHISES: 600, // 10 minutes
  PLOTS: 600, // 10 minutes
};

/**
 * Optimized cached function to fetch vacant properties with multi-layer caching
 */
export const getCachedVacantProperties = unstable_cache(
  async (): Promise<Property[]> => {
    console.log('[Cache] Fetching vacant properties with optimization...');
    
    try {
      // Try optimized Firebase fetch with memory cache first
      const startTime = Date.now();
      const properties = await getVacantProperties();
      const duration = Date.now() - startTime;
      
      console.log(`[Cache] Fetched ${properties.length} vacant properties in ${duration}ms`);
      
      // Cache performance tracking
      if (duration > 1000) {
        console.warn(`[Cache] Slow vacant properties fetch: ${duration}ms`);
      }
      
      return properties;
    } catch (error) {
      console.error('[Cache] Error fetching vacant properties:', error);
      // Return empty array on error to prevent cascade failures
      return [];
    }
  },
  ['vacant-properties-optimized'],
  {
    revalidate: CACHE_REVALIDATE.PROPERTIES,
    tags: [CACHE_TAGS.VACANT_PROPERTIES, CACHE_TAGS.ALL_PROPERTIES]
  }
);

/**
 * Cached function to fetch all franchises with ISR
 */
export const getCachedFranchises = unstable_cache(
  async (): Promise<Franchise[]> => {
    console.log('[Cache] Fetching franchises from Firebase...');
    const franchises = await getAllFranchises();
    console.log(`[Cache] Fetched ${franchises.length} franchises`);
    return franchises;
  },
  ['franchises'],
  {
    revalidate: CACHE_REVALIDATE.FRANCHISES,
    tags: [CACHE_TAGS.FRANCHISES, CACHE_TAGS.ALL_PROPERTIES]
  }
);

/**
 * Cached function to fetch all plots with ISR
 */
export const getCachedPlots = unstable_cache(
  async (): Promise<Plot[]> => {
    console.log('[Cache] Fetching plots from Firebase...');
    const plots = await getAllPlots();
    console.log(`[Cache] Fetched ${plots.length} plots`);
    return plots;
  },
  ['plots'],
  {
    revalidate: CACHE_REVALIDATE.PLOTS,
    tags: [CACHE_TAGS.PLOTS, CACHE_TAGS.ALL_PROPERTIES]
  }
);

/**
 * Cache invalidation helpers
 */
export const revalidateCachedData = {
  vacantProperties: () => {
    console.log('[Cache] Revalidating vacant properties cache');
    // This will be called when data is updated via API
  },
  franchises: () => {
    console.log('[Cache] Revalidating franchises cache');
  },
  plots: () => {
    console.log('[Cache] Revalidating plots cache');
  },
  all: () => {
    console.log('[Cache] Revalidating all property caches');
  }
};

/**
 * Performance monitoring for cache operations
 */
export const trackCachePerformance = (operation: string, startTime: number, hitCount?: number) => {
  const duration = Date.now() - startTime;
  console.log(`[Cache Performance] ${operation}: ${duration}ms${hitCount ? ` (${hitCount} items)` : ''}`);
  
  // Track cache performance for monitoring
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // Server-side performance tracking
    console.log(`[Perf] Cache ${operation}: ${duration}ms`);
  }
};