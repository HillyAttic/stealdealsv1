import { EventEmitter } from 'events';
import { database } from '@/lib/firebase';
import { ref, push, set, get, query, orderByChild, limitToLast } from 'firebase/database';

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
  };
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    errorRate?: number; // errors per minute
    errorCount?: number; // total errors in time window
    timeWindow: number; // minutes
    level?: ErrorEvent['level'];
    tags?: string[];
    component?: string;
  };
  actions: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
  enabled: boolean;
  lastTriggered?: Date;
  cooldown: number; // minutes before alert can trigger again
}

export interface SystemHealthAlert {
  id: string;
  timestamp: Date;
  type: 'error_rate' | 'memory_usage' | 'connection_failure' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

/**
 * Error tracking and alerting service for system health monitoring
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private eventEmitter: EventEmitter;
  private errors: Map<string, ErrorEvent>;
  private alertRules: Map<string, AlertRule>;
  private alerts: Map<string, SystemHealthAlert>;
  private errorBuffer: ErrorEvent[];
  private maxErrorHistory: number = 1000;
  private flushInterval: number = 10000; // 10 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.errors = new Map();
    this.alertRules = new Map();
    this.alerts = new Map();
    this.errorBuffer = [];
    
    // Initialize default alert rules
    this.initializeDefaultAlertRules();
    
    // Start periodic flushing
    this.startPeriodicFlush();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    console.log('[ErrorTracker] 🚨 Error tracking and alerting initialized');
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Track an error event
   */
  public trackError(
    level: ErrorEvent['level'],
    message: string,
    stack?: string,
    context: ErrorEvent['context'] = {},
    tags: string[] = []
  ): string {
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      stack,
      context,
      resolved: false,
      tags
    };

    // Store in memory
    this.errors.set(errorEvent.id, errorEvent);
    
    // Add to buffer for persistence
    this.errorBuffer.push(errorEvent);
    
    // Emit event for real-time processing
    this.eventEmitter.emit('error', errorEvent);
    
    // Check alert rules
    this.checkAlertRules(errorEvent);
    
    console.log(`[ErrorTracker] 🚨 Error tracked: ${level} - ${message}`);
    
    return errorEvent.id;
  }

  /**
   * Track API error
   */
  public trackAPIError(
    endpoint: string,
    method: string,
    statusCode: number,
    message: string,
    userId?: string,
    duration?: number
  ): string {
    return this.trackError(
      statusCode >= 500 ? 'critical' : 'error',
      `API Error: ${method} ${endpoint} - ${message}`,
      undefined,
      {
        userId,
        component: 'api',
        action: `${method} ${endpoint}`,
        metadata: {
          statusCode,
          duration,
          endpoint,
          method
        }
      },
      ['api', 'http', `status-${statusCode}`]
    );
  }

  /**
   * Track database error
   */
  public trackDatabaseError(
    operation: string,
    collection: string,
    message: string,
    userId?: string
  ): string {
    return this.trackError(
      'error',
      `Database Error: ${operation} on ${collection} - ${message}`,
      undefined,
      {
        userId,
        component: 'database',
        action: operation,
        metadata: {
          collection,
          operation
        }
      },
      ['database', 'firebase', operation]
    );
  }

  /**
   * Track real-time connection error
   */
  public trackConnectionError(
    connectionId: string,
    connectionType: string,
    message: string,
    userId?: string
  ): string {
    return this.trackError(
      'warning',
      `Connection Error: ${connectionType} - ${message}`,
      undefined,
      {
        userId,
        component: 'realtime',
        action: 'connection',
        metadata: {
          connectionId,
          connectionType
        }
      },
      ['realtime', 'connection', connectionType]
    );
  }

  /**
   * Track client-side error
   */
  public trackClientError(
    message: string,
    stack: string,
    url: string,
    userId?: string,
    component?: string
  ): string {
    return this.trackError(
      'error',
      `Client Error: ${message}`,
      stack,
      {
        userId,
        url,
        component: component || 'client',
        action: 'javascript_error'
      },
      ['client', 'javascript', 'frontend']
    );
  }

  /**
   * Resolve an error
   */
  public resolveError(errorId: string, resolvedBy: string): boolean {
    const error = this.errors.get(errorId);
    if (error && !error.resolved) {
      error.resolved = true;
      error.resolvedAt = new Date();
      error.resolvedBy = resolvedBy;
      
      this.eventEmitter.emit('errorResolved', error);
      console.log(`[ErrorTracker] ✅ Error resolved: ${errorId} by ${resolvedBy}`);
      return true;
    }
    return false;
  }

  /**
   * Get errors by criteria
   */
  public getErrors(criteria: {
    level?: ErrorEvent['level'];
    resolved?: boolean;
    component?: string;
    tags?: string[];
    userId?: string;
    limit?: number;
    since?: Date;
  } = {}): ErrorEvent[] {
    let errors = Array.from(this.errors.values());
    
    // Apply filters
    if (criteria.level) {
      errors = errors.filter(error => error.level === criteria.level);
    }
    
    if (criteria.resolved !== undefined) {
      errors = errors.filter(error => error.resolved === criteria.resolved);
    }
    
    if (criteria.component) {
      errors = errors.filter(error => error.context.component === criteria.component);
    }
    
    if (criteria.tags && criteria.tags.length > 0) {
      errors = errors.filter(error => 
        criteria.tags!.some(tag => error.tags.includes(tag))
      );
    }
    
    if (criteria.userId) {
      errors = errors.filter(error => error.context.userId === criteria.userId);
    }
    
    if (criteria.since) {
      errors = errors.filter(error => error.timestamp >= criteria.since!);
    }
    
    // Sort by most recent first
    errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit
    if (criteria.limit) {
      errors = errors.slice(0, criteria.limit);
    }
    
    return errors;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(timeWindow: number = 60): {
    total: number;
    byLevel: Record<string, number>;
    byComponent: Record<string, number>;
    errorRate: number;
    resolved: number;
    unresolved: number;
  } {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    const recentErrors = this.getErrors({ since });
    
    const byLevel: Record<string, number> = {};
    const byComponent: Record<string, number> = {};
    let resolved = 0;
    
    recentErrors.forEach(error => {
      byLevel[error.level] = (byLevel[error.level] || 0) + 1;
      
      const component = error.context.component || 'unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
      
      if (error.resolved) {
        resolved++;
      }
    });
    
    return {
      total: recentErrors.length,
      byLevel,
      byComponent,
      errorRate: recentErrors.length / timeWindow, // errors per minute
      resolved,
      unresolved: recentErrors.length - resolved
    };
  }

  /**
   * Add alert rule
   */
  public addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      id: crypto.randomUUID(),
      ...rule
    };
    
    this.alertRules.set(alertRule.id, alertRule);
    console.log(`[ErrorTracker] 📋 Alert rule added: ${alertRule.name}`);
    
    return alertRule.id;
  }

  /**
   * Get system health alerts
   */
  public getSystemHealthAlerts(acknowledged?: boolean): SystemHealthAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      
      this.eventEmitter.emit('alertAcknowledged', alert);
      console.log(`[ErrorTracker] ✅ Alert acknowledged: ${alertId} by ${acknowledgedBy}`);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to error tracking events
   */
  public subscribe(
    event: 'error' | 'errorResolved' | 'alert' | 'alertAcknowledged',
    callback: (data: any) => void
  ): () => void {
    this.eventEmitter.on(event, callback);
    
    return () => {
      this.eventEmitter.off(event, callback);
    };
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    // High error rate alert
    this.addAlertRule({
      name: 'High Error Rate',
      condition: {
        errorRate: 10, // 10 errors per minute
        timeWindow: 5
      },
      actions: {
        email: ['admin@stealdeals.com']
      },
      enabled: true,
      cooldown: 15
    });
    
    // Critical errors alert
    this.addAlertRule({
      name: 'Critical Errors',
      condition: {
        errorCount: 1,
        timeWindow: 1,
        level: 'critical'
      },
      actions: {
        email: ['admin@stealdeals.com']
      },
      enabled: true,
      cooldown: 5
    });
    
    // API errors alert
    this.addAlertRule({
      name: 'API Errors',
      condition: {
        errorCount: 5,
        timeWindow: 5,
        component: 'api'
      },
      actions: {
        email: ['dev@stealdeals.com']
      },
      enabled: true,
      cooldown: 10
    });
  }

  /**
   * Check alert rules against new error
   */
  private checkAlertRules(error: ErrorEvent): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
      
      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownExpired = Date.now() - rule.lastTriggered.getTime() > rule.cooldown * 60 * 1000;
        if (!cooldownExpired) continue;
      }
      
      // Check conditions
      const since = new Date(Date.now() - rule.condition.timeWindow * 60 * 1000);
      const matchingErrors = this.getErrors({
        level: rule.condition.level,
        component: rule.condition.component,
        tags: rule.condition.tags,
        since
      });
      
      let shouldTrigger = false;
      
      if (rule.condition.errorCount && matchingErrors.length >= rule.condition.errorCount) {
        shouldTrigger = true;
      }
      
      if (rule.condition.errorRate) {
        const errorRate = matchingErrors.length / rule.condition.timeWindow;
        if (errorRate >= rule.condition.errorRate) {
          shouldTrigger = true;
        }
      }
      
      if (shouldTrigger) {
        this.triggerAlert(rule, matchingErrors);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, errors: ErrorEvent[]): void {
    const alert: SystemHealthAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'error_rate',
      severity: errors.some(e => e.level === 'critical') ? 'critical' : 'high',
      message: `Alert: ${rule.name} - ${errors.length} errors in ${rule.condition.timeWindow} minutes`,
      metrics: {
        errorCount: errors.length,
        timeWindow: rule.condition.timeWindow,
        errors: errors.slice(0, 5) // Include first 5 errors
      },
      acknowledged: false
    };
    
    this.alerts.set(alert.id, alert);
    rule.lastTriggered = new Date();
    
    this.eventEmitter.emit('alert', { rule, alert, errors });
    console.log(`[ErrorTracker] 🚨 Alert triggered: ${rule.name}`);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    const checkSystemHealth = () => {
      try {
        const memoryUsage = process.memoryUsage();
        const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        // Check memory usage
        if (memoryPercentage > 90) {
          const alert: SystemHealthAlert = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: 'memory_usage',
            severity: 'critical',
            message: `High memory usage: ${memoryPercentage.toFixed(1)}%`,
            metrics: {
              memoryUsage: memoryUsage,
              percentage: memoryPercentage
            },
            acknowledged: false
          };
          
          this.alerts.set(alert.id, alert);
          this.eventEmitter.emit('alert', { alert });
        }
        
        // Check error rate
        const errorStats = this.getErrorStats(5); // Last 5 minutes
        if (errorStats.errorRate > 5) {
          const alert: SystemHealthAlert = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: 'error_rate',
            severity: errorStats.errorRate > 10 ? 'critical' : 'high',
            message: `High error rate: ${errorStats.errorRate.toFixed(1)} errors/minute`,
            metrics: errorStats,
            acknowledged: false
          };
          
          this.alerts.set(alert.id, alert);
          this.eventEmitter.emit('alert', { alert });
        }
        
      } catch (error) {
        console.error('[ErrorTracker] Error in health monitoring:', error);
      }
    };
    
    // Check system health every 2 minutes
    setInterval(checkSystemHealth, 2 * 60 * 1000);
  }

  /**
   * Start periodic flushing to Firebase
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  /**
   * Flush errors to Firebase
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) {
      return;
    }

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      const errorsRef = ref(database, 'monitoring/errors');
      const batch = errorsToFlush.map(async (error) => {
        const errorRef = push(errorsRef);
        await set(errorRef, {
          ...error,
          timestamp: error.timestamp.toISOString(),
          resolvedAt: error.resolvedAt?.toISOString()
        });
      });
      
      await Promise.all(batch);
      console.log(`[ErrorTracker] 💾 Flushed ${errorsToFlush.length} errors to Firebase`);
      
    } catch (error) {
      console.error('[ErrorTracker] Error flushing errors:', error);
      // Put errors back in buffer for retry
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  /**
   * Cleanup old data
   */
  public cleanup(): void {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Clean up old errors
    for (const [errorId, error] of this.errors.entries()) {
      if (error.timestamp < cutoffTime && error.resolved) {
        this.errors.delete(errorId);
      }
    }
    
    // Clean up old alerts
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.timestamp < cutoffTime && alert.acknowledged) {
        this.alerts.delete(alertId);
      }
    }
    
    console.log('[ErrorTracker] 🧹 Cleaned up old error tracking data');
  }

  /**
   * Shutdown error tracker
   */
  public async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flushErrors();
    console.log('[ErrorTracker] 🛑 Error tracker shutdown complete');
  }
}