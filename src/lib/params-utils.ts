/**
 * Utility functions for handling Next.js 15 params migration
 * Provides compatibility between Promise-based and direct params access
 */

/**
 * Resolves params that can be either a Promise or direct object
 * This provides backward compatibility during the Next.js 15 migration
 */
export async function resolveParams<T>(params: Promise<T> | T): Promise<T> {
  try {
    // Check if params is a Promise
    if (params instanceof Promise) {
      return await params;
    }
    // If not a Promise, return directly
    return params;
  } catch (error) {
    console.error('Failed to resolve params:', error);
    throw new Error('Invalid route parameters');
  }
}

/**
 * Type guard to check if params is a Promise
 */
export function isParamsPromise<T>(params: Promise<T> | T): params is Promise<T> {
  return params instanceof Promise;
}

/**
 * Utility type for API route params that can be Promise or direct
 */
export type RouteParams<T = { id: string }> = Promise<T> | T;

/**
 * Utility type for page component params (always Promise in Next.js 15)
 */
export type PageParams<T = { id: string }> = Promise<T>;

/**
 * Helper function specifically for ID-based routes
 */
export async function resolveIdParam(params: RouteParams<{ id: string }>): Promise<string> {
  const resolved = await resolveParams(params);
  return resolved.id;
}

/**
 * Helper function to parse and validate numeric IDs
 */
export async function resolveNumericIdParam(params: RouteParams<{ id: string }>): Promise<number> {
  const id = await resolveIdParam(params);
  const numericId = parseInt(id);
  
  if (isNaN(numericId)) {
    throw new Error('Invalid numeric ID parameter');
  }
  
  return numericId;
}