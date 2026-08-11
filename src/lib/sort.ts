// Shared sorting helpers for listing pages.
// Default sort order across the app is newest-first by created date.

type DatedItem = {
  createdAt?: number | string;
  updatedAt?: number | string;
  addDate?: string;
  [key: string]: any;
};

/**
 * Extract the best available creation timestamp for sorting purposes.
 * Prefers numeric `createdAt`, then `updatedAt`, then string `addDate`.
 */
export function getCreatedTimestamp(item: DatedItem | null | undefined): number {
  if (!item) return 0;

  if (item.createdAt != null) {
    const ts = typeof item.createdAt === 'number' ? item.createdAt : Date.parse(String(item.createdAt));
    if (!isNaN(ts)) return ts;
  }

  if (item.updatedAt != null) {
    const ts = typeof item.updatedAt === 'number' ? item.updatedAt : Date.parse(String(item.updatedAt));
    if (!isNaN(ts)) return ts;
  }

  if (item.addDate) {
    const ts = Date.parse(item.addDate);
    if (!isNaN(ts)) return ts;
  }

  return 0;
}

/**
 * Sort an array newest-first by creation date (default listing order).
 * Returns a new array, leaving the input untouched.
 */
export function sortByNewest<T>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => getCreatedTimestamp(b as DatedItem) - getCreatedTimestamp(a as DatedItem)
  );
}
