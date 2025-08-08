'use client';

import { SessionData } from './session';
import { SessionPersistence } from './session-persistence';

const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Client-side session management with automatic refresh
 */
export class ClientSessionManager {
  private static instance: ClientSessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private sessionData: SessionData | null = null;

  private constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      // Initialize session data from cookies/storage
      this.loadSessionData();
      this.startRefreshTimer();
    }
  }

  public static getInstance(): ClientSessionManager {
    if (!ClientSessionManager.instance) {
      ClientSessionManager.instance = new ClientSessionManager();
    }
    return ClientSessionManager.instance;
  }

  /**
   * Load session data from cookies and localStorage backup
   */
  private loadSessionData(): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // First try to get session data from cookies
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('auth_session='));
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('auth_user='));

      if (sessionCookie && userCookie) {
        const token = sessionCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        
        // Decode JWT to get expiration
        const payload = this.decodeJWT(token);
        if (payload && payload.exp) {
          this.sessionData = {
            user: userData,
            token,
            expiresAt: new Date(payload.exp * 1000)
          };
          
          // Save to localStorage backup
          SessionPersistence.saveSessionBackup(this.sessionData);
          return;
        }
      }

      // If no cookies, try to restore from localStorage backup
      const backup = SessionPersistence.loadSessionBackup();
      if (backup && backup.user && backup.expiresAt) {
        // Verify session with server
        this.verifySessionWithServer(backup.user);
        return;
      }

      // Check for mock authentication in localStorage
      const mockAuthenticated = localStorage.getItem('mock_authenticated');
      const mockUser = localStorage.getItem('mock_user');
      
      if (mockAuthenticated === 'true' && mockUser) {
        try {
          const user = JSON.parse(mockUser);
          this.sessionData = {
            user,
            token: 'mock_token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          };
        } catch (error) {
          console.error('Error parsing mock user:', error);
          localStorage.removeItem('mock_authenticated');
          localStorage.removeItem('mock_user');
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      this.sessionData = null;
      SessionPersistence.clearSessionBackup();
    }
  }

  /**
   * Verify session with server when restoring from backup
   */
  private async verifySessionWithServer(user: SessionData['user']): Promise<void> {
    try {
      const response = await fetch('/api/auth/user/session');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.authenticated && data.user.id === user.id) {
          // Session is valid, restore it
          this.sessionData = {
            user: data.user,
            token: '', // Token is in HTTP-only cookie
            expiresAt: new Date(data.expiresAt)
          };
          return;
        }
      }
      
      // Session is invalid, clear backup
      SessionPersistence.clearSessionBackup();
    } catch (error) {
      console.error('Error verifying session with server:', error);
      SessionPersistence.clearSessionBackup();
    }
  }

  /**
   * Decode JWT payload (client-side, no verification)
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Get current session data
   */
  public getSession(): SessionData | null {
    if (!this.sessionData) {
      this.loadSessionData();
    }
    
    // Check if session is expired
    if (this.sessionData && this.sessionData.expiresAt <= new Date()) {
      this.sessionData = null;
      this.clearSession();
    }
    
    return this.sessionData;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  /**
   * Check if token needs refresh
   */
  private shouldRefresh(): boolean {
    if (!this.sessionData) return false;
    
    const timeUntilExpiry = this.sessionData.expiresAt.getTime() - Date.now();
    return timeUntilExpiry <= REFRESH_THRESHOLD;
  }

  /**
   * Refresh the session token
   */
  public async refreshSession(): Promise<boolean> {
    if (this.isRefreshing || !this.sessionData) {
      return false;
    }

    this.isRefreshing = true;

    try {
      const response = await fetch('/api/auth/user/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sessionData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        this.clearSession();
        return false;
      }

      const data = await response.json();

      if (!data.success) {
        console.error('Token refresh failed:', data.error);
        this.clearSession();
        return false;
      }

      // Update session data
      this.sessionData = {
        user: data.user,
        token: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Save to localStorage backup
      SessionPersistence.saveSessionBackup(this.sessionData);

      // Cookies are automatically updated by the server response
      console.log('Session refreshed successfully');
      return true;

    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearSession();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Start automatic refresh timer
   */
  private startRefreshTimer(): void {
    // Check every minute if refresh is needed
    this.refreshTimer = setInterval(async () => {
      if (this.shouldRefresh()) {
        await this.refreshSession();
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Stop refresh timer
   */
  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clear session data
   */
  public clearSession(): void {
    this.sessionData = null;
    this.stopRefreshTimer();
    
    // Clear localStorage backup
    SessionPersistence.clearSessionBackup();
    
    // Clear cookies by setting them to expire (only on client side)
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Also clear admin cookies if they exist
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'adminUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear mock authentication data
      localStorage.removeItem('mock_authenticated');
      localStorage.removeItem('mock_user');
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/user/logout', {
        method: 'POST',
        headers: {
          'Authorization': this.sessionData ? `Bearer ${this.sessionData.token}` : '',
          'Content-Type': 'application/json'
        }
      });

      // Clear session regardless of API response
      this.clearSession();

      if (!response.ok) {
        console.error('Logout API failed:', response.status);
        return false;
      }

      const data = await response.json();
      return data.success;

    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Update session data (after login/register)
   */
  public updateSession(sessionData: SessionData): void {
    this.sessionData = sessionData;
    
    // Save to localStorage backup
    SessionPersistence.saveSessionBackup(sessionData);
    
    // If this looks like mock authentication, also save to mock storage
    if (sessionData.token === 'mock_token' || !sessionData.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_authenticated', 'true');
        localStorage.setItem('mock_user', JSON.stringify(sessionData.user));
      }
    }
    
    // Restart refresh timer
    this.stopRefreshTimer();
    this.startRefreshTimer();
  }

  /**
   * Cleanup when component unmounts
   */
  public cleanup(): void {
    this.stopRefreshTimer();
  }
}

// Export singleton instance
export const clientSession = ClientSessionManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clientSession.cleanup();
  });
}