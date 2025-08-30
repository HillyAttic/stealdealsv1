import { EventEmitter } from 'events';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConnectionMetric {
  connectionId: string;
  userId?: string;
  connectionType: 'sse' | 'websocket' | 'polling';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: Date;
  disconnectedAt?: Date;
  duration?: number;
  errorCount: number;
  lastError?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthMetric {
  timestamp: Date;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  activeConnections: number;
  errorRate: number;
  averageResponseTime: number;
  throughput: number;
}

/**
 * Performance monitoring service for real-time connections and system health
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private eventEmitter: EventEmitter;
  private metrics: Map<string, PerformanceMetric[]>;
  private connections: Map<string, ConnectionMetric>;
  private systemHealth: SystemHealthMetric[];
  private maxMetricsHistory: number = 1000;
  private maxHealthHistory: number = 100;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.metrics = new Map();
    this.connections = new Map();
    this.systemHealth = [];
    
    // Start system health monitoring
    this.startSystemHealthMonitoring();
    
    console.log('[PerformanceMonitor] 📊 Performance monitoring initialized');
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  public recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      id: crypto.randomUUID(),
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata
    };

    // Store metric
    const metricHistory = this.metrics.get(name) || [];
    metricHistory.push(metric);
    
    // Keep only recent metrics
    if (metricHistory.length > this.maxMetricsHistory) {
      metricHistory.shift();
    }
    
    this.metrics.set(name, metricHistory);

    // Emit metric event
    this.eventEmitter.emit('metric', metric);

    console.log(`[PerformanceMonitor] 📈 Recorded metric: ${name} = ${value}${unit}`);
  }

  /**
   * Record connection event
   */
  public recordConnection(connectionId: string, userId: string | undefined, connectionType: 'sse' | 'websocket' | 'polling'): void {
    const connection: ConnectionMetric = {
      connectionId,
      userId,
      connectionType,
      status: 'connected',
      connectedAt: new Date(),
      errorCount: 0
    };

    this.connections.set(connectionId, connection);
    this.eventEmitter.emit('connection', connection);

    console.log(`[PerformanceMonitor] 🔗 Connection established: ${connectionId} (${connectionType})`);
  }

  /**
   * Record connection disconnection
   */
  public recordDisconnection(connectionId: string, reason?: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'disconnected';
      connection.disconnectedAt = new Date();
      connection.duration = connection.disconnectedAt.getTime() - connection.connectedAt.getTime();
      
      if (reason) {
        connection.metadata = { ...connection.metadata, disconnectionReason: reason };
      }

      this.eventEmitter.emit('disconnection', connection);
      console.log(`[PerformanceMonitor] 🔌 Connection disconnected: ${connectionId} (duration: ${connection.duration}ms)`);
    }
  }

  /**
   * Record connection error
   */
  public recordConnectionError(connectionId: string, error: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.errorCount++;
      connection.lastError = error;
      connection.status = 'error';

      this.eventEmitter.emit('connectionError', connection);
      console.log(`[PerformanceMonitor] ❌ Connection error: ${connectionId} - ${error}`);
    }
  }

  /**
   * Get performance metrics for a specific metric name
   */
  public getMetrics(name: string, limit?: number): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * Get all metric names
   */
  public getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): {
    total: number;
    active: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageDuration: number;
    errorRate: number;
  } {
    const connections = Array.from(this.connections.values());
    const active = connections.filter(c => c.status === 'connected').length;
    
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    let totalDuration = 0;
    let completedConnections = 0;
    let totalErrors = 0;

    connections.forEach(connection => {
      // Count by type
      byType[connection.connectionType] = (byType[connection.connectionType] || 0) + 1;
      
      // Count by status
      byStatus[connection.status] = (byStatus[connection.status] || 0) + 1;
      
      // Calculate duration for completed connections
      if (connection.duration) {
        totalDuration += connection.duration;
        completedConnections++;
      }
      
      // Count errors
      totalErrors += connection.errorCount;
    });

    return {
      total: connections.length,
      active,
      byType,
      byStatus,
      averageDuration: completedConnections > 0 ? totalDuration / completedConnections : 0,
      errorRate: connections.length > 0 ? (totalErrors / connections.length) * 100 : 0
    };
  }

  /**
   * Get system health metrics
   */
  public getSystemHealth(limit?: number): SystemHealthMetric[] {
    return limit ? this.systemHealth.slice(-limit) : this.systemHealth;
  }

  /**
   * Get latest system health
   */
  public getLatestSystemHealth(): SystemHealthMetric | null {
    return this.systemHealth.length > 0 ? this.systemHealth[this.systemHealth.length - 1] : null;
  }

  /**
   * Subscribe to performance events
   */
  public subscribe(event: 'metric' | 'connection' | 'disconnection' | 'connectionError' | 'systemHealth', callback: (data: any) => void): () => void {
    this.eventEmitter.on(event, callback);
    
    return () => {
      this.eventEmitter.off(event, callback);
    };
  }

  /**
   * Start system health monitoring
   */
  private startSystemHealthMonitoring(): void {
    const collectSystemHealth = () => {
      try {
        const memoryUsage = process.memoryUsage();
        const connectionStats = this.getConnectionStats();
        
        // Calculate error rate from recent metrics
        const recentErrors = this.getMetrics('api_errors', 100);
        const recentRequests = this.getMetrics('api_requests', 100);
        const errorRate = recentRequests.length > 0 ? (recentErrors.length / recentRequests.length) * 100 : 0;
        
        // Calculate average response time from recent metrics
        const responseTimeMetrics = this.getMetrics('response_time', 100);
        const averageResponseTime = responseTimeMetrics.length > 0 
          ? responseTimeMetrics.reduce((sum, metric) => sum + metric.value, 0) / responseTimeMetrics.length 
          : 0;
        
        // Calculate throughput (requests per minute)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentRequestsCount = recentRequests.filter(metric => metric.timestamp > oneMinuteAgo).length;

        const healthMetric: SystemHealthMetric = {
          timestamp: new Date(),
          memoryUsage: {
            used: memoryUsage.heapUsed,
            total: memoryUsage.heapTotal,
            percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
          },
          activeConnections: connectionStats.active,
          errorRate,
          averageResponseTime,
          throughput: recentRequestsCount
        };

        this.systemHealth.push(healthMetric);
        
        // Keep only recent health metrics
        if (this.systemHealth.length > this.maxHealthHistory) {
          this.systemHealth.shift();
        }

        this.eventEmitter.emit('systemHealth', healthMetric);

      } catch (error) {
        console.error('[PerformanceMonitor] Error collecting system health:', error);
      }
    };

    // Collect system health every 30 seconds
    setInterval(collectSystemHealth, 30000);
    
    // Collect initial health metric
    collectSystemHealth();
  }

  /**
   * Clean up old data
   */
  public cleanup(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean up old connections
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.disconnectedAt && connection.disconnectedAt < cutoffTime) {
        this.connections.delete(connectionId);
      }
    }
    
    // Clean up old metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const recentMetrics = metrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(name, recentMetrics);
    }
    
    // Clean up old system health
    this.systemHealth = this.systemHealth.filter(health => health.timestamp > cutoffTime);
    
    console.log('[PerformanceMonitor] 🧹 Cleaned up old monitoring data');
  }
}