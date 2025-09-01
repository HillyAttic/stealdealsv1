/**
 * Mock performance monitoring service
 * This is a placeholder implementation to resolve module import errors
 */

// Mock PerformanceMonitor class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  recordMetric(
    name: string, 
    value: number, 
    unit: string, 
    tags?: Record<string, string | number>
  ): void {
    // Mock implementation - just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance Monitor] ${name}: ${value} ${unit}`, tags);
    }
  }
  
  getMetrics(): Record<string, any> {
    // Return empty metrics object
    return {};
  }
}