// Mock implementation for testing
export class LRUCache<T> {
  get(key: string): T | null { return null; }
  set(key: string, value: T): void {}
  has(key: string): boolean { return false; }
  delete(key: string): boolean { return false; }
  clear(): void {}
  size(): number { return 0; }
  keys(): string[] { return []; }
}