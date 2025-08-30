/**
 * Adaptive Poller
 * Intelligent polling system that adjusts intervals based on user activity,
 * data freshness requirements, and system load.
 */

import { 
  ConnectionPriority,
  FIREBASE_OPTIMIZATION_CONFIG,
  isDebugMode 
} from '@/config/firebase-optimization';

export interface PollingConfig {
  baseInterval: number;
  minInterval: number;
  maxInterval: number;
  backoffFactor: number;
  adaptTo: 'userActivity' | 'dataFreshness' | 'systemLoad' | 'mixed';
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  priority?: ConnectionPriority;
  component?: string;
}

export interface PollingSession {
  id: string;
  path: string;
  config: PollingConfig;
  currentInterval: number;
  lastPoll: Date | null;
  lastActivity: Date | null;
  consecutiveErrors: number;
  dataUpdates: number;
  isActive: boolean;
  timer?: NodeJS.Timer;
  stats: PollingStats;
}

export interface PollingStats {
  totalPolls: number;
  successfulPolls: number;
  errorCount: number;
  avgResponseTime: number;
  lastDataReceived: Date | null;
  dataTransferred: number;
}

export interface ActivityMonitor {
  lastUserActivity: Date;
  isUserActive: boolean;
  activityLevel: 'low' | 'medium' | 'high';
  inactiveThreshold: number;
}

/**
 * Adaptive Poller Implementation
 */
export class AdaptivePoller {
  private sessions = new Map<string, PollingSession>();
  private activityMonitor: ActivityMonitor;
  private globalStats = {
    totalSessions: 0,
    activeSessions: 0,
    totalPolls: 0,
    avgInterval: 0
  };

  private activityCheckInterval?: NodeJS.Timer;
  private readonly config = FIREBASE_OPTIMIZATION_CONFIG.degradation.adaptivePolling;

  constructor() {
    this.activityMonitor = {
      lastUserActivity: new Date(),
      isUserActive: true,
      activityLevel: 'medium',
      inactiveThreshold: 30000 // 30 seconds
    };

    this.setupActivityMonitoring();
    this.startGlobalMonitoring();
  }

  /**
   * Start adaptive polling for a path
   */
  start(path: string, config: PollingConfig): string {
    const sessionId = this.generateSessionId();
    
    const session: PollingSession = {
      id: sessionId,
      path,
      config: {
        baseInterval: config.baseInterval || this.config.baseInterval,
        minInterval: config.minInterval || 1000,
        maxInterval: config.maxInterval || this.config.maxInterval,
        backoffFactor: config.backoffFactor || this.config.backoffFactor,
        ...config
      },
      currentInterval: config.baseInterval || this.config.baseInterval,
      lastPoll: null,
      lastActivity: new Date(),
      consecutiveErrors: 0,
      dataUpdates: 0,
      isActive: true,
      stats: {
        totalPolls: 0,
        successfulPolls: 0,
        errorCount: 0,
        avgResponseTime: 0,
        lastDataReceived: null,
        dataTransferred: 0
      }
    };

    this.sessions.set(sessionId, session);
    this.globalStats.totalSessions++;
    this.globalStats.activeSessions++;

    // Start polling
    this.scheduleNextPoll(session);

    console.log(`[AdaptivePoller] 📡 Started polling ${path} (${session.currentInterval}ms interval)`);
    
    return sessionId;
  }

  /**
   * Stop polling session
   */
  stop(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.isActive = false;
    
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = undefined;
    }

    this.globalStats.activeSessions--;
    this.sessions.delete(sessionId);

    console.log(`[AdaptivePoller] ⏹️ Stopped polling session ${sessionId} for ${session.path}`);
    
    return true;
  }

  /**
   * Update user activity (speeds up polling if configured)
   */
  recordActivity(): void {
    this.activityMonitor.lastUserActivity = new Date();
    this.activityMonitor.isUserActive = true;
    this.updateActivityLevel();

    // Update intervals for activity-adaptive sessions
    for (const session of this.sessions.values()) {
      if (session.config.adaptTo === 'userActivity' || session.config.adaptTo === 'mixed') {
        this.adjustIntervalForActivity(session);
      }
    }
  }

  /**
   * Notify data received (helps optimize intervals)
   */
  recordDataReceived(sessionId: string, data: any, responseTime: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date();
    session.dataUpdates++;
    session.stats.successfulPolls++;
    session.stats.lastDataReceived = new Date();
    session.stats.avgResponseTime = 
      (session.stats.avgResponseTime + responseTime) / 2;
    session.stats.dataTransferred += this.calculateDataSize(data);

    // Reset error count on successful poll
    session.consecutiveErrors = 0;

    // Adapt interval based on data freshness
    if (session.config.adaptTo === 'dataFreshness' || session.config.adaptTo === 'mixed') {
      this.adjustIntervalForDataFreshness(session, data);
    }

    // Call onData callback
    if (session.config.onData) {
      try {
        session.config.onData(data);
      } catch (error) {
        console.error('[AdaptivePoller] Error in onData callback:', error);
      }
    }

    if (isDebugMode()) {
      console.log(`[AdaptivePoller] 📨 Data received for ${session.path} (${responseTime}ms)`);
    }
  }

  /**
   * Notify polling error (triggers backoff)
   */
  recordError(sessionId: string, error: Error): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.consecutiveErrors++;
    session.stats.errorCount++;

    // Apply backoff
    this.applyBackoff(session);

    // Call onError callback
    if (session.config.onError) {
      try {
        session.config.onError(error);
      } catch (callbackError) {
        console.error('[AdaptivePoller] Error in onError callback:', callbackError);
      }
    }

    console.warn(`[AdaptivePoller] ❌ Polling error for ${session.path} (attempt ${session.consecutiveErrors}):`, error.message);
  }

  /**
   * Get all active polling sessions
   */
  getActiveSessions(): PollingSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): PollingSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get polling statistics
   */
  getStats() {
    const sessions = Array.from(this.sessions.values());
    
    return {
      global: this.globalStats,
      sessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      totalPolls: sessions.reduce((sum, s) => sum + s.stats.totalPolls, 0),
      avgInterval: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.currentInterval, 0) / sessions.length 
        : 0,
      byPriority: this.getStatsByPriority(),
      activity: {
        userActive: this.activityMonitor.isUserActive,
        activityLevel: this.activityMonitor.activityLevel,
        lastActivity: this.activityMonitor.lastUserActivity
      }
    };
  }

  /**
   * Adjust all intervals based on system load
   */
  adaptToSystemLoad(loadLevel: 'low' | 'medium' | 'high'): void {
    const multipliers = {
      'low': 0.8,    // Speed up when load is low
      'medium': 1.0, // Normal intervals
      'high': 1.5    // Slow down when load is high
    };

    const multiplier = multipliers[loadLevel];
    
    for (const session of this.sessions.values()) {
      if (session.config.adaptTo === 'systemLoad' || session.config.adaptTo === 'mixed') {
        const newInterval = Math.min(
          session.config.maxInterval,
          Math.max(
            session.config.minInterval,
            session.config.baseInterval * multiplier
          )
        );
        
        this.updateSessionInterval(session, newInterval);
      }
    }

    console.log(`[AdaptivePoller] 🔄 Adapted to ${loadLevel} system load (${multiplier}x)`);
  }

  /**
   * Clean up and destroy poller
   */
  destroy(): void {
    // Stop all sessions
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      this.stop(sessionId);
    }

    // Clear intervals
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }

    console.log('[AdaptivePoller] 💥 Adaptive poller destroyed');
  }

  // Private methods
  private scheduleNextPoll(session: PollingSession): void {
    if (!session.isActive) return;

    session.timer = setTimeout(() => {
      this.performPoll(session);
    }, session.currentInterval);
  }

  private async performPoll(session: PollingSession): Promise<void> {
    if (!session.isActive) return;

    const startTime = Date.now();
    session.lastPoll = new Date();
    session.stats.totalPolls++;
    this.globalStats.totalPolls++;

    try {
      // In practice, this would make the actual Firebase request
      // For now, simulate polling
      await this.simulatePoll(session);
      
      const responseTime = Date.now() - startTime;
      
      // Simulate receiving data
      this.recordDataReceived(session.id, { timestamp: Date.now() }, responseTime);

    } catch (error) {
      this.recordError(session.id, error as Error);
    }

    // Schedule next poll
    this.scheduleNextPoll(session);
  }

  private async simulatePoll(session: PollingSession): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    // Simulate occasional errors
    if (Math.random() < 0.05) { // 5% error rate
      throw new Error('Simulated polling error');
    }
  }

  private adjustIntervalForActivity(session: PollingSession): void {
    const timeSinceActivity = Date.now() - this.activityMonitor.lastUserActivity.getTime();
    
    let intervalMultiplier = 1.0;
    
    if (this.config.speedUpOnActivity && this.activityMonitor.isUserActive) {
      intervalMultiplier = 0.5; // Speed up when active
    } else if (timeSinceActivity > this.activityMonitor.inactiveThreshold * 2) {
      intervalMultiplier = 2.0; // Slow down when inactive
    }
    
    const newInterval = Math.min(
      session.config.maxInterval,
      Math.max(
        session.config.minInterval,
        session.config.baseInterval * intervalMultiplier
      )
    );
    
    this.updateSessionInterval(session, newInterval);
  }

  private adjustIntervalForDataFreshness(session: PollingSession, data: any): void {
    // Simple heuristic: if data looks stale or unchanged, slow down polling
    const dataHash = this.simpleHash(JSON.stringify(data));
    const lastDataHash = (session as any).lastDataHash;
    
    if (dataHash === lastDataHash) {
      // Data unchanged, slow down
      const newInterval = Math.min(
        session.config.maxInterval,
        session.currentInterval * 1.2
      );
      this.updateSessionInterval(session, newInterval);
    } else {
      // Data changed, speed up
      const newInterval = Math.max(
        session.config.minInterval,
        session.currentInterval * 0.9
      );
      this.updateSessionInterval(session, newInterval);
    }
    
    (session as any).lastDataHash = dataHash;
  }

  private applyBackoff(session: PollingSession): void {
    const backoffMultiplier = Math.pow(session.config.backoffFactor, session.consecutiveErrors);
    const newInterval = Math.min(
      session.config.maxInterval,
      session.currentInterval * backoffMultiplier
    );
    
    this.updateSessionInterval(session, newInterval);
  }

  private updateSessionInterval(session: PollingSession, newInterval: number): void {
    if (newInterval === session.currentInterval) return;

    const oldInterval = session.currentInterval;
    session.currentInterval = Math.round(newInterval);

    if (isDebugMode()) {
      console.log(`[AdaptivePoller] ⏰ Adjusted ${session.path} interval: ${oldInterval}ms → ${session.currentInterval}ms`);
    }
  }

  private setupActivityMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      this.recordActivity();
    };

    for (const event of activityEvents) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.recordActivity();
      }
    });
  }

  private startGlobalMonitoring(): void {
    this.activityCheckInterval = setInterval(() => {
      this.updateActivityLevel();
      this.updateGlobalStats();
    }, 10000); // Check every 10 seconds
  }

  private updateActivityLevel(): void {
    const timeSinceActivity = Date.now() - this.activityMonitor.lastUserActivity.getTime();
    
    if (timeSinceActivity > this.activityMonitor.inactiveThreshold) {
      this.activityMonitor.isUserActive = false;
      
      if (timeSinceActivity > this.activityMonitor.inactiveThreshold * 3) {
        this.activityMonitor.activityLevel = 'low';
      } else {
        this.activityMonitor.activityLevel = 'medium';
      }
    } else {
      this.activityMonitor.isUserActive = true;
      this.activityMonitor.activityLevel = 'high';
    }
  }

  private updateGlobalStats(): void {
    const sessions = Array.from(this.sessions.values());
    
    this.globalStats.activeSessions = sessions.filter(s => s.isActive).length;
    this.globalStats.avgInterval = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.currentInterval, 0) / sessions.length 
      : 0;
  }

  private getStatsByPriority(): Record<string, number> {
    const stats: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const session of this.sessions.values()) {
      const priority = session.config.priority || 'medium';
      stats[priority]++;
    }

    return stats;
  }

  private calculateDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private generateSessionId(): string {
    return `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}