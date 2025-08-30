// Mock implementation for testing
export class IndexedDBCache {
  async get(key: string) { return null; }
  async set(key: string, value: any) { return true; }
  async delete(key: string) { return true; }
  async clear() { return true; }
}