'use client';

import React from 'react';

interface SessionStatus {
  active: boolean;
  timeRemaining?: number;
  showWarning?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface SessionMonitorConfig {
  checkInterval: number; // Check interval in milliseconds
  warningThreshold: number; // Show warning when time remaining is less than this (in milliseconds)
  onSessionExpired?: () => void;
  onSessionWarning?: (timeRemaining: number) => void;
  onSessionExtended?: () => void;
}

class ClientSessionMonitor {
  private config: SessionMonitorConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private warningShown = false;
  private isActive = false;

  constructor(config: Partial<SessionMonitorConfig> = {}) {
    this.config = {
      checkInterval: 60000, // 1 minute
      warningThreshold: 5 * 60 * 1000, // 5 minutes
      ...config
    };
  }

  /**
   * Start monitoring session status
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.checkSessionStatus();
    
    this.intervalId = setInterval(() => {
      this.checkSessionStatus();
    }, this.config.checkInterval);
  }

  /**
   * Stop monitoring session status
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.warningShown = false;
  }

  /**
   * Check current session status
   */
  private async checkSessionStatus(): Promise<void> {
    try {
      const response = await fetch('/api/auth/session-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleSessionExpired();
        }
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.data.active) {
        this.handleSessionExpired();
        return;
      }

      const sessionStatus: SessionStatus = data.data;
      
      // Check if warning should be shown
      if (
        sessionStatus.showWarning && 
        sessionStatus.timeRemaining && 
        sessionStatus.timeRemaining <= this.config.warningThreshold &&
        !this.warningShown
      ) {
        this.handleSessionWarning(sessionStatus.timeRemaining);
      }

    } catch (error) {
      console.error('Session status check failed:', error);
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    this.stop();
    
    if (this.config.onSessionExpired) {
      this.config.onSessionExpired();
    } else {
      // Default behavior: redirect to login
      window.location.href = '/?login=required&reason=session_expired';
    }
  }

  /**
   * Handle session warning
   */
  private handleSessionWarning(timeRemaining: number): void {
    this.warningShown = true;
    
    if (this.config.onSessionWarning) {
      this.config.onSessionWarning(timeRemaining);
    } else {
      // Default behavior: show browser alert
      const minutes = Math.ceil(timeRemaining / 60000);
      const shouldExtend = confirm(
        `Your session will expire in ${minutes} minute(s). Would you like to extend it?`
      );
      
      if (shouldExtend) {
        this.extendSession();
      }
    }
  }

  /**
   * Extend the current session
   */
  async extendSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/user/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.warningShown = false;
        
        if (this.config.onSessionExtended) {
          this.config.onSessionExtended();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session extension failed:', error);
      return false;
    }
  }

  /**
   * Get current session status
   */
  async getCurrentStatus(): Promise<SessionStatus | null> {
    try {
      const response = await fetch('/api/auth/session-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to get session status:', error);
      return null;
    }
  }

  /**
   * Check if monitor is active
   */
  isMonitoring(): boolean {
    return this.isActive;
  }
}

// Global session monitor instance
let globalSessionMonitor: ClientSessionMonitor | null = null;

/**
 * Get or create global session monitor
 */
export function getSessionMonitor(config?: Partial<SessionMonitorConfig>): ClientSessionMonitor {
  if (!globalSessionMonitor) {
    globalSessionMonitor = new ClientSessionMonitor(config);
  }
  return globalSessionMonitor;
}

/**
 * Start global session monitoring
 */
export function startSessionMonitoring(config?: Partial<SessionMonitorConfig>): void {
  const monitor = getSessionMonitor(config);
  monitor.start();
}

/**
 * Stop global session monitoring
 */
export function stopSessionMonitoring(): void {
  if (globalSessionMonitor) {
    globalSessionMonitor.stop();
  }
}

/**
 * React hook for session monitoring
 */
export function useSessionMonitor(config?: Partial<SessionMonitorConfig>) {
  const monitor = getSessionMonitor(config);
  
  React.useEffect(() => {
    monitor.start();
    
    return () => {
      monitor.stop();
    };
  }, [monitor]);
  
  return {
    extendSession: () => monitor.extendSession(),
    getCurrentStatus: () => monitor.getCurrentStatus(),
    isMonitoring: () => monitor.isMonitoring()
  };
}

// Export the class for direct usage
export { ClientSessionMonitor };