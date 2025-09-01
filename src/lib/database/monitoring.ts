/**
 * Database performance monitoring and health checking service
 */

import { dbPool, ConnectionStats, QueryMetrics } from './connection-pool';
import { cacheService, CacheStats } from './cache';

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  connectionPool: {
    status: 'healthy' | 'warning' | 'critical';
    stats: ConnectionStats;
    issues: string[];
    recommendations: string[];
  };
  cache: {
    status: 'healthy' | 'warning' | 'critical';
    stats: Record<string, CacheStats>;
    issues: string[];
    recommendations: string[];
  };
  batchProcessor: {
    status: 'healthy' | 'warning' | 'critical';
    stats: {
      pendingBatches: number;
      totalPendingActivities: number;
    };
    issues: string[];
    recommendations: string[];
  };
  overall: {
    issues: string[];
    recommendations: string[];
  };
}

interface PerformanceMetrics {
  timestamp: Date;
  queryPerformance: {
    averageReadTime: number;
    averageWriteTime: number;
    successRate: number;
    errorRate: number;
    totalQueries: number;
  };
  cachePerformance: {
    overallHitRate: number;
    totalCacheSize: number;
    cachesByType: Record<string, CacheStats>;
  };
  batchProcessing: {
    pendingBatches: number;
    totalPendingActivities: number;
    averageBatchSize: number;
  };
}

class DatabaseMonitoringService {
  private healthHistory: DatabaseHealth[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private maxHistorySize = 100;
  private alertThresholds = {
    errorRate: 10, // 10%
    averageQueryTime: 1000, // 1 second
    cacheHitRate: 70, // 70%
    pendingBatches: 20
  };

  /**
   * Get current database health status
   */
  async getHealthStatus(): Promise<DatabaseHealth> {
    const timestamp = new Date();
    
    // Check connection pool health
    const poolHealth = dbPool.getHealthStatus();
    const poolStats = dbPool.getStats();
    
    // Check cache health
    const cacheStats = cacheService.getAllStats();
    const cacheIssues: string[] = [];
    const cacheRecommendations: string[] = [];
    
    let overallCacheHitRate = 0;
    let totalCacheRequests = 0;
    
    Object.entries(cacheStats).forEach(([type, stats]) => {
      const requests = stats.hits + stats.misses;
      totalCacheRequests += requests;
      overallCacheHitRate += stats.hits;
      
      if (stats.hitRate < this.alertThresholds.cacheHitRate && requests > 10) {
        cacheIssues.push(`Low hit rate for ${type} cache: ${stats.hitRate.toFixed(1)}%`);
        cacheRecommendations.push(`Consider increasing TTL or cache size for ${type} cache`);
      }
      
      if (stats.size >= stats.maxSize * 0.9) {
        cacheIssues.push(`${type} cache is near capacity: ${stats.size}/${stats.maxSize}`);
        cacheRecommendations.push(`Consider increasing max size for ${type} cache`);
      }
    });
    
    overallCacheHitRate = totalCacheRequests > 0 ? (overallCacheHitRate / totalCacheRequests) * 100 : 0;
    
    let cacheStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (cacheIssues.length > 0) {
      cacheStatus = overallCacheHitRate < 50 ? 'critical' : 'warning';
    }
    
    // Check batch processor health (placeholder - batch processor temporarily unavailable)
    const batchStats = { pendingBatches: 0, totalPendingActivities: 0 };
    const batchIssues: string[] = [];
    const batchRecommendations: string[] = [];
    
    if (batchStats.pendingBatches > this.alertThresholds.pendingBatches) {
      batchIssues.push(`High number of pending batches: ${batchStats.pendingBatches}`);
      batchRecommendations.push('Consider reducing batch timeout or increasing batch size');
    }
    
    if (batchStats.totalPendingActivities > 100) {
      batchIssues.push(`High number of pending activities: ${batchStats.totalPendingActivities}`);
      batchRecommendations.push('Check batch processor performance and Firebase connection');
    }
    
    let batchStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (batchIssues.length > 0) {
      batchStatus = batchStats.totalPendingActivities > 500 ? 'critical' : 'warning';
    }
    
    // Determine overall status
    const allIssues = [...poolHealth.issues, ...cacheIssues, ...batchIssues];
    const allRecommendations = [...poolHealth.recommendations, ...cacheRecommendations, ...batchRecommendations];
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (poolHealth.status === 'critical' || cacheStatus === 'critical' || batchStatus === 'critical') {
      overallStatus = 'critical';
    } else if (poolHealth.status === 'warning' || cacheStatus === 'warning' || batchStatus === 'warning') {
      overallStatus = 'warning';
    }
    
    const health: DatabaseHealth = {
      status: overallStatus,
      timestamp,
      connectionPool: {
        status: poolHealth.status,
        stats: poolStats,
        issues: poolHealth.issues,
        recommendations: poolHealth.recommendations
      },
      cache: {
        status: cacheStatus,
        stats: cacheStats,
        issues: cacheIssues,
        recommendations: cacheRecommendations
      },
      batchProcessor: {
        status: batchStatus,
        stats: batchStats,
        issues: batchIssues,
        recommendations: batchRecommendations
      },
      overall: {
        issues: allIssues,
        recommendations: allRecommendations
      }
    };
    
    // Store in history
    this.healthHistory.push(health);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
    
    return health;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const timestamp = new Date();
    const poolMetrics = dbPool.getPerformanceMetrics();
    const cacheStats = cacheService.getAllStats();
    const batchStats = { pendingBatches: 0, totalPendingActivities: 0 };
    
    // Calculate overall cache hit rate
    let totalHits = 0;
    let totalRequests = 0;
    let totalCacheSize = 0;
    
    Object.values(cacheStats).forEach(stats => {
      totalHits += stats.hits;
      totalRequests += stats.hits + stats.misses;
      totalCacheSize += stats.size;
    });
    
    const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    
    const metrics: PerformanceMetrics = {
      timestamp,
      queryPerformance: {
        averageReadTime: poolMetrics.averageReadTime,
        averageWriteTime: poolMetrics.averageWriteTime,
        successRate: poolMetrics.successRate,
        errorRate: poolMetrics.errorRate,
        totalQueries: dbPool.getStats().totalQueries
      },
      cachePerformance: {
        overallHitRate,
        totalCacheSize,
        cachesByType: cacheStats
      },
      batchProcessing: {
        pendingBatches: batchStats.pendingBatches,
        totalPendingActivities: batchStats.totalPendingActivities,
        averageBatchSize: batchStats.pendingBatches > 0 
          ? batchStats.totalPendingActivities / batchStats.pendingBatches 
          : 0
      }
    };
    
    // Store in history
    this.performanceHistory.push(metrics);
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.maxHistorySize);
    }
    
    return metrics;
  }

  /**
   * Get health history
   */
  getHealthHistory(limit?: number): DatabaseHealth[] {
    const history = this.healthHistory.slice();
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(limit?: number): PerformanceMetrics[] {
    const history = this.performanceHistory.slice();
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get database optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    impact: string;
  }[]> {
    const health = await this.getHealthStatus();
    const metrics = this.getPerformanceMetrics();
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      recommendation: string;
      impact: string;
    }> = [];
    
    // High priority recommendations
    if (metrics.queryPerformance.errorRate > 15) {
      recommendations.push({
        priority: 'high',
        category: 'Connection Pool',
        recommendation: 'Investigate and fix database connection issues',
        impact: 'Reduces application errors and improves user experience'
      });
    }
    
    if (metrics.queryPerformance.averageReadTime > 2000) {
      recommendations.push({
        priority: 'high',
        category: 'Query Performance',
        recommendation: 'Optimize slow database queries and add missing indexes',
        impact: 'Significantly improves application response time'
      });
    }
    
    if (metrics.batchProcessing.totalPendingActivities > 500) {
      recommendations.push({
        priority: 'high',
        category: 'Batch Processing',
        recommendation: 'Increase batch processing capacity or reduce batch timeout',
        impact: 'Prevents activity logging delays and potential data loss'
      });
    }
    
    // Medium priority recommendations
    if (metrics.cachePerformance.overallHitRate < 60) {
      recommendations.push({
        priority: 'medium',
        category: 'Caching',
        recommendation: 'Increase cache TTL or optimize cache keys',
        impact: 'Reduces database load and improves response times'
      });
    }
    
    if (metrics.queryPerformance.averageWriteTime > 1500) {
      recommendations.push({
        priority: 'medium',
        category: 'Write Performance',
        recommendation: 'Optimize write operations and consider batch updates',
        impact: 'Improves data modification performance'
      });
    }
    
    // Low priority recommendations
    if (metrics.cachePerformance.totalCacheSize > 10000) {
      recommendations.push({
        priority: 'low',
        category: 'Memory Usage',
        recommendation: 'Consider implementing cache size limits or cleanup policies',
        impact: 'Optimizes memory usage and prevents memory leaks'
      });
    }
    
    if (metrics.batchProcessing.averageBatchSize < 5) {
      recommendations.push({
        priority: 'low',
        category: 'Batch Efficiency',
        recommendation: 'Increase batch size or reduce batch timeout for better efficiency',
        impact: 'Improves batch processing efficiency and reduces overhead'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<{
    summary: {
      status: string;
      totalQueries: number;
      averageResponseTime: number;
      cacheHitRate: number;
      errorRate: number;
    };
    details: {
      connectionPool: any;
      cache: any;
      batchProcessor: any;
    };
    recommendations: any[];
    trends: {
      queryPerformance: string;
      cachePerformance: string;
      errorRate: string;
    };
  }> {
    const health = await this.getHealthStatus();
    const metrics = this.getPerformanceMetrics();
    const recommendations = await this.getOptimizationRecommendations();
    
    // Calculate trends (simplified - compare with previous metrics)
    const previousMetrics = this.performanceHistory.slice(-2)[0];
    let queryTrend = 'stable';
    let cacheTrend = 'stable';
    let errorTrend = 'stable';
    
    if (previousMetrics) {
      const avgCurrentTime = (metrics.queryPerformance.averageReadTime + metrics.queryPerformance.averageWriteTime) / 2;
      const avgPreviousTime = (previousMetrics.queryPerformance.averageReadTime + previousMetrics.queryPerformance.averageWriteTime) / 2;
      
      if (avgCurrentTime > avgPreviousTime * 1.1) queryTrend = 'degrading';
      else if (avgCurrentTime < avgPreviousTime * 0.9) queryTrend = 'improving';
      
      if (metrics.cachePerformance.overallHitRate > previousMetrics.cachePerformance.overallHitRate * 1.05) cacheTrend = 'improving';
      else if (metrics.cachePerformance.overallHitRate < previousMetrics.cachePerformance.overallHitRate * 0.95) cacheTrend = 'degrading';
      
      if (metrics.queryPerformance.errorRate > previousMetrics.queryPerformance.errorRate * 1.2) errorTrend = 'increasing';
      else if (metrics.queryPerformance.errorRate < previousMetrics.queryPerformance.errorRate * 0.8) errorTrend = 'decreasing';
    }
    
    return {
      summary: {
        status: health.status,
        totalQueries: metrics.queryPerformance.totalQueries,
        averageResponseTime: (metrics.queryPerformance.averageReadTime + metrics.queryPerformance.averageWriteTime) / 2,
        cacheHitRate: metrics.cachePerformance.overallHitRate,
        errorRate: metrics.queryPerformance.errorRate
      },
      details: {
        connectionPool: health.connectionPool,
        cache: health.cache,
        batchProcessor: health.batchProcessor
      },
      recommendations,
      trends: {
        queryPerformance: queryTrend,
        cachePerformance: cacheTrend,
        errorRate: errorTrend
      }
    };
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.healthHistory = [];
    this.performanceHistory = [];
    dbPool.resetStats();
    cacheService.clearAll();
  }
}

// Singleton instance
const monitoringService = new DatabaseMonitoringService();

// Auto-monitoring every 30 seconds
setInterval(async () => {
  try {
    const health = await monitoringService.getHealthStatus();
    const metrics = monitoringService.getPerformanceMetrics();
    
    // Log warnings and critical issues
    if (health.status !== 'healthy') {
      console.warn(`[DB Monitoring] Database health status: ${health.status}`);
      if (health.overall.issues.length > 0) {
        console.warn(`[DB Monitoring] Issues:`, health.overall.issues);
      }
    }
    
    // Log performance metrics periodically
    if (metrics.queryPerformance.totalQueries % 100 === 0) {
      console.log(`[DB Monitoring] Performance update:`, {
        queries: metrics.queryPerformance.totalQueries,
        avgResponseTime: Math.round((metrics.queryPerformance.averageReadTime + metrics.queryPerformance.averageWriteTime) / 2),
        cacheHitRate: Math.round(metrics.cachePerformance.overallHitRate),
        errorRate: Math.round(metrics.queryPerformance.errorRate * 100) / 100
      });
    }
  } catch (error) {
    console.error('[DB Monitoring] Error during auto-monitoring:', error);
  }
}, 30 * 1000);

export { DatabaseMonitoringService, monitoringService };
export type { DatabaseHealth, PerformanceMetrics };