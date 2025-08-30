// Mock implementation for testing
export class ListenerRegistry {
  register() {}
  unregister() {}
  getListener() {}
  getAllListeners() { return []; }
  cleanup() {}
  getActiveCount() { return 0; }
  getIdleListeners() { return []; }
}