"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

// ─── Global Cache (shared across all pages) ─────────────────────────────────
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  status: 'fresh' | 'stale' | 'revalidating';
}

const globalCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<any>>();
const subscribers = new Map<string, Set<() => void>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_TTL = 60 * 1000; // 1 minute — show stale data while revalidating

function notifySubscribers(key: string) {
  subscribers.get(key)?.forEach(fn => fn());
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────
async function fetchFromAPI<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    // Only redirect if on admin path
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ─── Core revalidation logic ─────────────────────────────────────────────────
async function revalidate<T>(
  key: string,
  url: string,
  options: RequestInit = {},
  ttl: number = DEFAULT_TTL
): Promise<T | null> {
  // Deduplicate in-flight requests
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T | null>;

  const promise = (async () => {
    try {
      const data = await fetchFromAPI<T>(url, options);
      globalCache.set(key, { data, timestamp: Date.now(), status: 'fresh' });
      notifySubscribers(key);
      return data;
    } catch (err) {
      // Mark as stale but don't remove — keep showing old data
      const entry = globalCache.get(key);
      if (entry) entry.status = 'stale';
      notifySubscribers(key);
      throw err;
    } finally {
      inflightRequests.delete(key);
    }
  })();

  inflightRequests.set(key, promise);
  return promise;
}

// ─── Focus/Visibility revalidation ────────────────────────────────────────────
let visibilityListenerAttached = false;
const keysToRevalidateOnFocus = new Set<string>();

function attachVisibilityListener() {
  if (visibilityListenerAttached || typeof document === 'undefined') return;
  visibilityListenerAttached = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      keysToRevalidateOnFocus.forEach(key => {
        const entry = globalCache.get(key);
        if (entry && Date.now() - entry.timestamp > STALE_TTL) {
          // Fire-and-forget revalidation — the hook's useSyncExternalStore will pick up changes
          const url = keyToUrl.get(key);
          if (url) revalidate(key, url, keyToOptions.get(key) || {}, keyToTtl.get(key));
        }
      });
    }
  });
}

const keyToUrl = new Map<string, string>();
const keyToOptions = new Map<string, RequestInit>();
const keyToTtl = new Map<string, number>();

// ─── Cache helpers (exported for manual cache management) ────────────────────
export function mutateCache<T>(key: string, data: T) {
  globalCache.set(key, { data, timestamp: Date.now(), status: 'fresh' });
  notifySubscribers(key);
}

export function invalidateCache(key: string) {
  globalCache.delete(key);
  notifySubscribers(key);
}

export function invalidateCacheByPrefix(prefix: string) {
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
      notifySubscribers(key);
    }
  }
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
interface UseAdminDataOptions<T> {
  /** Skip fetching (e.g. while a modal is closed) */
  enabled?: boolean;
  /** Custom cache TTL in ms. Default 5 min */
  ttl?: number;
  /** Extra fetch options */
  fetchOptions?: RequestInit;
  /** Transform response before caching */
  select?: (data: any) => T;
  /** Called on error */
  onError?: (err: Error) => void;
  /** Revalidate on mount even if cached. Default false */
  revalidateOnMount?: boolean;
}

interface UseAdminDataReturn<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isStale: boolean;
  isValidating: boolean;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useAdminData<T = any>(
  url: string | null,
  options: UseAdminDataOptions<T> = {}
): UseAdminDataReturn<T> {
  const {
    enabled = true,
    ttl = DEFAULT_TTL,
    fetchOptions = {},
    select,
    onError,
    revalidateOnMount = false,
  } = options;

  const router = useRouter();
  const key = url ? `admin:${url}` : null;

  // Subscribe to cache changes for this key
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!key) return () => {};
      if (!subscribers.has(key)) subscribers.set(key, new Set());
      subscribers.get(key)!.add(cb);
      return () => {
        subscribers.get(key)?.delete(cb);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    if (!key) return undefined;
    return globalCache.get(key);
  }, [key]);

  const getServerSnapshot = useCallback(() => undefined, []);

  const cacheEntry = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [error, setError] = useState<Error | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const mountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const doFetch = useCallback(async (isBackground = false) => {
    if (!key || !url || !enabled) return;

    keyToUrl.set(key, url);
    keyToOptions.set(key, fetchOptions);
    keyToTtl.set(key, ttl);
    keysToRevalidateOnFocus.add(key);
    attachVisibilityListener();

    if (!isBackground) setIsValidating(true);
    setError(null);

    try {
      await revalidate(key, url, fetchOptions, ttl);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current && !isBackground) {
        setIsValidating(false);
      }
    }
  }, [key, url, enabled, fetchOptions, ttl, onError]);

  // Initial fetch
  useEffect(() => {
    if (!key || !url || !enabled || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const cached = globalCache.get(url);
    const age = cached ? Date.now() - cached.timestamp : Infinity;

    if (cached && age < ttl && !revalidateOnMount) {
      // Fresh cache hit — no fetch needed
      return;
    }

    if (cached && age < ttl + STALE_TTL && !revalidateOnMount) {
      // Stale but usable — show immediately, revalidate in background
      doFetch(true);
      return;
    }

    // No cache or expired — full loading fetch
    doFetch(false);
  }, [key, url, enabled, ttl, revalidateOnMount, doFetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (key) keysToRevalidateOnFocus.delete(key);
    };
  }, [key]);

  const rawData = cacheEntry?.data;
  const data = select && rawData !== undefined ? select(rawData) : rawData;

  const isLoading = !cacheEntry && (isValidating || !hasFetchedRef.current);
  const isStale = cacheEntry
    ? Date.now() - cacheEntry.timestamp > STALE_TTL
    : false;

  const refetch = useCallback(async () => {
    if (key) {
      globalCache.delete(key);
      notifySubscribers(key);
    }
    hasFetchedRef.current = false;
    await doFetch(false);
    hasFetchedRef.current = true;
  }, [key, doFetch]);

  const mutate = useCallback(
    (newData: T) => {
      if (key) mutateCache(key, newData);
    },
    [key]
  );

  return { data, error, isLoading, isStale, isValidating, refetch, mutate };
}

// ─── Mutation hook for POST/PUT/DELETE ────────────────────────────────────────
interface UseAdminMutationOptions {
  /** Cache keys to invalidate after successful mutation */
  invalidateKeys?: string[];
  /** Cache key prefixes to invalidate */
  invalidatePrefixes?: string[];
  onError?: (err: Error) => void;
}

export function useAdminMutation(options: UseAdminMutationOptions = {}) {
  const { invalidateKeys = [], invalidatePrefixes = [], onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...init,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        });

        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin/login';
          throw new Error('Session expired');
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${response.status}`);
        }

        const data = await response.json().catch(() => ({}));

        // Invalidate related caches
        invalidateKeys.forEach(k => invalidateCache(k));
        invalidatePrefixes.forEach(p => invalidateCacheByPrefix(p));

        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [invalidateKeys, invalidatePrefixes, onError]
  );

  return { mutate, isLoading, error };
}
