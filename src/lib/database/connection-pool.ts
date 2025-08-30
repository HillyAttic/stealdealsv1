/**
 * Database connection pooling and optimization for Firebase
 * Manages connection reuse, query batching, and performance monitoring
 */

import { database } from '@/lib/firebase';
import { ref, get, set, update, remove, push, DataSnapshot } from 'firebase/database';

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  averageQueryTime: number;
  errorCount: number;
  lastError?: string;
}

interface QueryMetrics {
  queryType: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface BatchOperation {
  type: 'set' | 'update' | 'remove';
  path: string;
  data?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class DatabaseConnectionPool {
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    totalQueries: 0,
    averageQueryTime: 0,
    errorCount: 0
  };

  private queryMetrics: QueryMetrics[] = [];
  private maxMetricsHistory = 1000;
  private batchQueue: BatchOperation[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 50; // 50ms batch delay
  private maxBatchSize = 100;

  /**
   * Execute a read operation with performance tracking
   */
  async executeRead<T>(path: string, operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.stats.activeConnections++;
    this.stats.totalConnections++;

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.recordMetrics('read', duration, true);
      this.updateAverageQueryTime(duration);
      
      console.log(`[DB Pool] ✅ Read operation completed: ${path} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetrics('read', duration, false, error instanceof Error ? error.message : 'Unknown error');
      this.stats.errorCount++;
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[DB Pool] ❌ Read operation failed: ${path} (${duration}ms)`, error);
      throw error;
    } finally {
      this.stats.activeConnections--;
    }
  }

  /**
   * Execute a write operation with performance tracking
   */
  async executeWrite<T>(path: string, operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.stats.activeConnections++;
    this.stats.totalConnections++;

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.recordMetrics('write', duration, true);
      this.updateAverageQueryTime(duration);
      
      console.log(`[DB Pool] ✅ Write operation completed: ${path} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetrics('write', duration, false, error instanceof Error ? error.message : 'Unknown error');
      this.stats.errorCount++;
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[DB Pool] ❌ Write operation failed: ${path} (${duration}ms)`, error);
      throw error;
    } finally {
      this.stats.activeConnections--;
    }
  }

  /**
   * Optimized get operation with connection pooling
   */
  async optimizedGet(path: string): Promise<DataSnapshot> {
    return this.executeRead(path, async () => {
      const dbRef = ref(database, path);
      return await get(dbRef);
    });
  }

  /**
   * Optimized set operation with connection pooling
   */
  async optimizedSet(path: string, data: any): Promise<void> {
    return this.executeWrite(path, async () => {
      const dbRef = ref(database, path);
      await set(dbRef, data);
    });
  }

  /**
   * Optimized update operation with connection pooling
   */
  async optimizedUpdate(path: string, updates: any): Promise<void> {
    return this.executeWrite(path, async () => {
      // For batch updates to multiple paths (when path is empty or '/'), use root reference
      const dbRef = (!path || path === '/') ? ref(database) : ref(database, path);
      await update(dbRef, updates);
    });
  }

  /**
   * Optimized remove operation with connection pooling
   */
  async optimizedRemove(path: string): Promise<void> {
    return this.executeWrite(path, async () => {
      const dbRef = ref(database, path);
      await remove(dbRef);
    });
  }

  /**
   * Optimized push operation with connection pooling
   */
  async optimizedPush(path: string, data: any): Promise<string> {
    return this.executeWrite(path, async () => {
      const dbRef = ref(database, path);
      const newRef = push(dbRef, data);
      return newRef.key!;
    });
  }

  /**
   * Batch multiple operations for better performance
   */
  async batchOperation(type: 'set' | 'update' | 'remove', path: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ type, path, data, resolve, reject });
      
      // If batch is full, process immediately
      if (this.batchQueue.length >= this.maxBatchSize) {
        this.processBatch();
      } else if (!this.batchTimeout) {
        // Otherwise, set a timeout to process the batch
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.batchDelay);
      }
    });
  }

  /**
   * Process batched operations
   */
  private async processBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batchQueue.length === 0) return;

    const operations = this.batchQueue.splice(0, this.maxBatchSize);
    const startTime = Date.now();

    try {
      // Group operations by type for optimal batching
      const updates: Record<string, any> = {};
      const removes: string[] = [];
      const sets: Array<{ path: string; data: any; resolve: Function }> = [];

      for (const op of operations) {
        switch (op.type) {
          case 'update':
            updates[op.path] = op.data;
            break;
          case 'remove':
            updates[op.path] = null;
            removes.push(op.path);
            break;
          case 'set':
            sets.push({ path: op.path, data: op.data, resolve: op.resolve });
            break;
        }
      }

      // Execute batched updates
      if (Object.keys(updates).length > 0) {
        await this.executeWrite('batch_update', async () => {
          await update(ref(database), updates);
        });

        // Resolve update and remove operations
        operations.forEach(op => {
          if (op.type === 'update' || op.type === 'remove') {
            op.resolve(true);
          }
        });
      }

      // Execute individual sets (Firebase doesn't support batched sets to different paths)
      for (const setOp of sets) {
        try {
          await this.optimizedSet(setOp.path, setOp.data);
          setOp.resolve(true);
        } catch (error) {
          const operation = operations.find(op => op.path === setOp.path);
          if (operation) operation.reject(error);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[DB Pool] ✅ Batch operation completed: ${operations.length} operations (${duration}ms)`);

    } catch (error) {
      console.error(`[DB Pool] ❌ Batch operation failed:`, error);
      
      // Reject all operations in the batch
      operations.forEach(op => op.reject(error));
    }
  }

  /**
   * Execute multiple read operations in parallel with connection pooling
   */
  async parallelReads(paths: string[]): Promise<Record<string, DataSnapshot>> {
    const startTime = Date.now();
    const results: Record<string, DataSnapshot> = {};

    try {
      const promises = paths.map(async (path) => {
        const snapshot = await this.optimizedGet(path);
        return { path, snapshot };
      });

      const resolvedPromises = await Promise.all(promises);
      
      resolvedPromises.forEach(({ path, snapshot }) => {
        results[path] = snapshot;
      });

      const duration = Date.now() - startTime;
      console.log(`[DB Pool] ✅ Parallel reads completed: ${paths.length} paths (${duration}ms)`);
      
      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[DB Pool] ❌ Parallel reads failed: ${paths.length} paths (${duration}ms)`, error);
      throw error;
    }
  }

  /**
   * Record query metrics for performance monitoring
   */
  private recordMetrics(queryType: string, duration: number, success: boolean, error?: string): void {
    const metric: QueryMetrics = {
      queryType,
      duration,
      timestamp: Date.now(),
      success,
      error
    };

    this.queryMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }

    this.stats.totalQueries++;
  }

  /**
   * Update average query time
   */
  private updateAverageQueryTime(duration: number): void {
    const totalTime = this.stats.averageQueryTime * (this.stats.totalQueries - 1) + duration;
    this.stats.averageQueryTime = totalTime / this.stats.totalQueries;
  }

  /**
   * Get connection pool statistics
   */
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Get detailed performance metrics
   */
  getPerformanceMetrics(): {
    recentMetrics: QueryMetrics[];
    averageReadTime: number;
    averageWriteTime: number;
    successRate: number;
    errorRate: number;
  } {
    const recentMetrics = this.queryMetrics.slice(-100); // Last 100 queries
    const readMetrics = recentMetrics.filter(m => m.queryType === 'read');
    const writeMetrics = recentMetrics.filter(m => m.queryType === 'write');
    const successfulQueries = recentMetrics.filter(m => m.success).length;

    return {
      recentMetrics,
      averageReadTime: readMetrics.length > 0 
        ? readMetrics.reduce((sum, m) => sum + m.duration, 0) / readMetrics.length 
        : 0,
      averageWriteTime: writeMetrics.length > 0 
        ? writeMetrics.reduce((sum, m) => sum + m.duration, 0) / writeMetrics.length 
        : 0,
      successRate: recentMetrics.length > 0 ? (successfulQueries / recentMetrics.length) * 100 : 0,
      errorRate: recentMetrics.length > 0 ? ((recentMetrics.length - successfulQueries) / recentMetrics.length) * 100 : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalQueries: 0,
      averageQueryTime: 0,
      errorCount: 0
    };
    this.queryMetrics = [];
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const metrics = this.getPerformanceMetrics();

    // Check error rate
    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`);
      recommendations.push('Investigate database connection issues');
    }

    // Check average query time
    if (this.stats.averageQueryTime > 1000) {
      issues.push(`Slow average query time: ${this.stats.averageQueryTime.toFixed(0)}ms`);
      recommendations.push('Consider optimizing queries or adding indexes');
    }

    // Check active connections
    if (this.stats.activeConnections > 50) {
      issues.push(`High number of active connections: ${this.stats.activeConnections}`);
      recommendations.push('Consider implementing connection limits');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = metrics.errorRate > 25 || this.stats.averageQueryTime > 2000 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }
}

// Singleton instance
const dbPool = new DatabaseConnectionPool();

export { DatabaseConnectionPool, dbPool };
export type { ConnectionStats, QueryMetrics };