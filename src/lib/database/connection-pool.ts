/**
 * Database connection pooling and optimization for Firestore
 * Manages connection reuse, query batching, and performance monitoring
 */

import { firestoreDb } from '@/lib/firestore';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';

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
  private batchDelay = 10; // Reduced batch delay to 10ms for better responsiveness
  private maxBatchSize = 50; // Reduced batch size for better performance

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
  async optimizedGet(path: string): Promise<DocumentSnapshot<DocumentData>> {
    return this.executeRead(path, async () => {
      const [col, id] = path.split('/');
      if (id) {
        return await getDoc(doc(firestoreDb, col, id));
      }
      // If no ID, return a mock snapshot for collection reads
      return await getDoc(doc(firestoreDb, col, '_placeholder'));
    });
  }

  /**
   * Optimized set operation with connection pooling
   */
  async optimizedSet(path: string, data: any): Promise<void> {
    return this.executeWrite(path, async () => {
      const [col, id] = path.split('/');
      await setDoc(doc(firestoreDb, col, id), data);
    });
  }

  /**
   * Optimized update operation with connection pooling
   */
  async optimizedUpdate(path: string, updates: any): Promise<void> {
    return this.executeWrite(path, async () => {
      const [col, id] = path.split('/');
      await updateDoc(doc(firestoreDb, col, id), updates);
    });
  }

  /**
   * Optimized remove operation with connection pooling
   */
  async optimizedRemove(path: string): Promise<void> {
    return this.executeWrite(path, async () => {
      const [col, id] = path.split('/');
      await deleteDoc(doc(firestoreDb, col, id));
    });
  }

  /**
   * Optimized push operation with connection pooling
   */
  async optimizedPush(path: string, data: any): Promise<string> {
    return this.executeWrite(path, async () => {
      const docRef = await addDoc(collection(firestoreDb, path), data);
      return docRef.id;
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
      const sets: Array<{ path: string; data: any; resolve: Function }> = [];
      const updates: Array<{ path: string; data: any; resolve: Function }> = [];
      const removes: Array<{ path: string; resolve: Function }> = [];

      for (const op of operations) {
        switch (op.type) {
          case 'update':
            updates.push({ path: op.path, data: op.data, resolve: op.resolve });
            break;
          case 'remove':
            removes.push({ path: op.path, resolve: op.resolve });
            break;
          case 'set':
            sets.push({ path: op.path, data: op.data, resolve: op.resolve });
            break;
        }
      }

      // Execute all operations using Firestore
      // Note: For true batch operations in Firestore, use WriteBatch
      // For simplicity here, we execute them sequentially with Promise.all
      await Promise.all([
        // Process sets
        ...sets.map(async (setOp) => {
          try {
            await this.optimizedSet(setOp.path, setOp.data);
            setOp.resolve(true);
          } catch (error) {
            setOp.resolve(false);
          }
        }),
        // Process updates
        ...updates.map(async (updateOp) => {
          try {
            await this.optimizedUpdate(updateOp.path, updateOp.data);
            updateOp.resolve(true);
          } catch (error) {
            updateOp.resolve(false);
          }
        }),
        // Process removes
        ...removes.map(async (removeOp) => {
          try {
            await this.optimizedRemove(removeOp.path);
            removeOp.resolve(true);
          } catch (error) {
            removeOp.resolve(false);
          }
        })
      ]);

      const duration = Date.now() - startTime;

    } catch (error) {
      console.error(`[DB Pool] ❌ Batch operation failed:`, error);

      // Reject all operations in the batch
      operations.forEach(op => op.reject(error));
    }
  }

  /**
   * Execute multiple read operations in parallel with connection pooling
   * Optimized version with better error handling and performance
   */
  async parallelReads(paths: string[]): Promise<Record<string, DocumentSnapshot<DocumentData>>> {
    const startTime = Date.now();
    const results: Record<string, DocumentSnapshot<DocumentData>> = {};

    try {
      // Process in smaller batches to prevent overwhelming the database
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < paths.length; i += batchSize) {
        batches.push(paths.slice(i, i + batchSize));
      }
      
      // Process batches sequentially to avoid overwhelming the database
      for (const batch of batches) {
        const promises = batch.map(async (path) => {
          const snapshot = await this.optimizedGet(path);
          return { path, snapshot };
        });

        const resolvedPromises = await Promise.all(promises);
        
        resolvedPromises.forEach(({ path, snapshot }) => {
          results[path] = snapshot;
        });
      }

      const duration = Date.now() - startTime;
      
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