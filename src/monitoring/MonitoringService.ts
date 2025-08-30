// Mock implementation for testing
export class MonitoringService {
  trackConnection() {}
  trackCacheHit() {}
  trackLatency() {}
  getMetrics() {
    return {
      connections: { active: 20, peak: 50 },
      cache: { hitRate: 0.85 }
    };
  }
}