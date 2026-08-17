import { unstable_cache } from 'next/cache';
import { getVacantProperties, getAllFranchises, getAllPlots, Property, Franchise, Plot } from '@/lib/database/firestore-properties';
// getOptimizedData, CACHE_KEYS, CACHE_TTL, MemoryCache were removed — Firestore is the sole data source now.

// Detect if we're in a build environment (Vercel build phase)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    (process.env.VERCEL && !process.env.VERCEL_ENV);

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
    // During build time, return empty array to avoid Firebase initialization
    if (isBuildTime) {
      console.log('[Cache] Build time detected - returning empty vacant properties');
      return [];
    }

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
    // During build time, return empty array to avoid Firebase initialization
    if (isBuildTime) {
      console.log('[Cache] Build time detected - returning empty franchises');
      return [];
    }

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
    // During build time, return empty array to avoid Firebase initialization
    if (isBuildTime) {
      console.log('[Cache] Build time detected - returning empty plots');
      return [];
    }

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
  vacantProperties: async () => {
    console.log('[Cache] Revalidating vacant properties cache');
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(CACHE_TAGS.VACANT_PROPERTIES);
      revalidateTag(CACHE_TAGS.ALL_PROPERTIES);
      console.log('[Cache] Successfully revalidated vacant properties cache');
    } catch (error) {
      console.error('[Cache] Failed to revalidate vacant properties cache:', error);
    }
  },
  franchises: async () => {
    console.log('[Cache] Revalidating franchises cache');
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(CACHE_TAGS.FRANCHISES);
      revalidateTag(CACHE_TAGS.ALL_PROPERTIES);
      console.log('[Cache] Successfully revalidated franchises cache');
    } catch (error) {
      console.error('[Cache] Failed to revalidate franchises cache:', error);
    }
  },
  plots: async () => {
    console.log('[Cache] Revalidating plots cache');
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(CACHE_TAGS.PLOTS);
      revalidateTag(CACHE_TAGS.ALL_PROPERTIES);
      console.log('[Cache] Successfully revalidated plots cache');
    } catch (error) {
      console.error('[Cache] Failed to revalidate plots cache:', error);
    }
  },
  all: async () => {
    console.log('[Cache] Revalidating all property caches');
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(CACHE_TAGS.VACANT_PROPERTIES);
      revalidateTag(CACHE_TAGS.FRANCHISES);
      revalidateTag(CACHE_TAGS.PLOTS);
      revalidateTag(CACHE_TAGS.ALL_PROPERTIES);
      console.log('[Cache] Successfully revalidated all property caches');
    } catch (error) {
      console.error('[Cache] Failed to revalidate all property caches:', error);
    }
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