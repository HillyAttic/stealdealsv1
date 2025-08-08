'use client';

import { SessionData } from './session';

const STORAGE_KEY = 'auth_session_backup';
const LAST_ACTIVITY_KEY = 'auth_last_activity';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session persistence manager for handling browser restarts
 */
export class SessionPersistence {
  /**
   * Save session data to localStorage as backup
   */
  static saveSessionBackup(sessionData: SessionData): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const backup = {
        user: sessionData.user,
        expiresAt: sessionData.expiresAt.toISOString(),
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
      localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save session backup:', error);
    }
  }

  /**
   * Load session data from localStorage backup
   */
  static loadSessionBackup(): Partial<SessionData> | null {
    // Only run on client side
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const backupStr = localStorage.getItem(STORAGE_KEY);
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      
      if (!backupStr || !lastActivityStr) {
        return null;
      }

      const backup = JSON.parse(backupStr);
      const lastActivity = new Date(lastActivityStr);
      const now = new Date();

      // Check if backup is too old
      if (now.getTime() - lastActivity.getTime() > SESSION_TIMEOUT) {
        this.clearSessionBackup();
        return null;
      }

      // Check if session is expired
      const expiresAt = new Date(backup.expiresAt);
      if (expiresAt <= now) {
        this.clearSessionBackup();
        return null;
      }

      return {
        user: backup.user,
        expiresAt
      };
    } catch (error) {
      console.error('Failed to load session backup:', error);
      this.clearSessionBackup();
      return null;
    }
  }

  /**
   * Clear session backup from localStorage
   */
  static clearSessionBackup(): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch (error) {
      console.error('Failed to clear session backup:', error);
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Check if session should be restored from backup
   */
  static shouldRestoreSession(): boolean {
    // Only run on client side
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivityStr) return false;

      const lastActivity = new Date(lastActivityStr);
      const now = new Date();

      // Only restore if last activity was within session timeout
      return (now.getTime() - lastActivity.getTime()) < SESSION_TIMEOUT;
    } catch (error) {
      console.error('Failed to check session restore:', error);
      return false;
    }
  }

  /**
   * Initialize session persistence (call on app start)
   */
  static initialize(): void {
    // Set up activity tracking
    if (typeof window !== 'undefined') {
      // Track user activity
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      let lastUpdate = 0;
      const throttleDelay = 30000; // Update every 30 seconds max

      const updateActivity = () => {
        const now = Date.now();
        if (now - lastUpdate > throttleDelay) {
          this.updateLastActivity();
          lastUpdate = now;
        }
      };

      activityEvents.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
      });

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        this.updateLastActivity();
      });

      // Clean up expired sessions on page load
      window.addEventListener('load', () => {
        if (!this.shouldRestoreSession()) {
          this.clearSessionBackup();
        }
      });
    }
  }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  SessionPersistence.initialize();
}