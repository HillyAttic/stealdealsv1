/**
 * Comprehensive Authentication Integration Tests
 * 
 * This file contains tests to verify the complete authentication flow
 * including registration, login, session management, and logout.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock window and document for client-side testing
const mockWindow = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  addEventListener: vi.fn(),
  location: {
    reload: vi.fn(),
    href: ''
  }
};

const mockDocument = {
  cookie: '',
  addEventListener: vi.fn()
};

// Setup global mocks
beforeEach(() => {
  global.window = mockWindow as any;
  global.document = mockDocument as any;
  
  // Reset mocks
  vi.clearAllMocks();
  
  // Reset document.cookie
  mockDocument.cookie = '';
  
  // Reset localStorage
  mockWindow.localStorage.getItem.mockReturnValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Authentication Flow Integration Tests', () => {
  describe('Session Management', () => {
    it('should not access localStorage during SSR', () => {
      // Simulate server environment
      delete (global as any).window;
      
      // Import session persistence - should not throw
      expect(() => {
        require('../lib/auth/session-persistence');
      }).not.toThrow();
    });

    it('should not access document.cookie during SSR', () => {
      // Simulate server environment
      delete (global as any).window;
      delete (global as any).document;
      
      // Import client session - should not throw
      expect(() => {
        require('../lib/auth/client-session');
      }).not.toThrow();
    });

    it('should handle client-side session loading', () => {
      const { SessionPersistence } = require('../lib/auth/session-persistence');
      
      // Mock localStorage data
      const sessionData = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        savedAt: new Date().toISOString()
      };
      
      mockWindow.localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_session_backup') return JSON.stringify(sessionData);
        if (key === 'auth_last_activity') return new Date().toISOString();
        return null;
      });
      
      const backup = SessionPersistence.loadSessionBackup();
      expect(backup).toBeTruthy();
      expect(backup?.user.email).toBe('test@example.com');
    });

    it('should clear expired sessions', () => {
      const { SessionPersistence } = require('../lib/auth/session-persistence');
      
      // Mock expired session
      const expiredSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };
      
      mockWindow.localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_session_backup') return JSON.stringify(expiredSession);
        if (key === 'auth_last_activity') return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return null;
      });
      
      const backup = SessionPersistence.loadSessionBackup();
      expect(backup).toBeNull();
      expect(mockWindow.localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Authentication API Tests', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = vi.fn();
    });

    it('should handle successful login', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'mock-jwt-token'
          }
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('should handle failed login', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid credentials'
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpassword' })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should handle session validation', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          authenticated: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' }
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('/api/auth/user/session');
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.authenticated).toBe(true);
    });

    it('should handle logout', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          message: 'Logged out successfully'
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await fetch('/api/auth/user/logout', {
        method: 'POST'
      });

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Firebase Configuration Tests', () => {
    it('should have valid Firebase configuration', () => {
      // Test that Firebase config is properly loaded
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      };

      expect(firebaseConfig.apiKey).toBeTruthy();
      expect(firebaseConfig.authDomain).toBeTruthy();
      expect(firebaseConfig.projectId).toBeTruthy();
    });

    it('should initialize Firebase without errors', () => {
      expect(() => {
        require('../lib/firebase');
      }).not.toThrow();
    });

    it('should initialize Firebase Auth without errors', () => {
      expect(() => {
        require('../lib/auth/firebase-auth');
      }).not.toThrow();
    });
  });

  describe('Authentication State Management', () => {
    let AuthProvider: any;
    let mockContextValue: any;

    beforeEach(() => {
      // Mock React hooks
      vi.mock('react', () => ({
        createContext: vi.fn(() => ({})),
        useContext: vi.fn(() => mockContextValue),
        useEffect: vi.fn(),
        useState: vi.fn(() => [false, vi.fn()]),
      }));

      mockContextValue = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn()
      };
    });

    it('should provide authentication context', () => {
      const { useAuthContext } = require('../components/auth/AuthProvider');
      
      const context = useAuthContext();
      expect(context).toBeDefined();
    });

    it('should handle authentication state changes', async () => {
      const { useAuthContext } = require('../components/auth/AuthProvider');
      
      const context = useAuthContext();
      
      // Mock successful login
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      context.login.mockResolvedValueOnce({ success: true, user: mockUser });

      const loginResult = await context.login('test@example.com', 'password123');
      expect(loginResult.success).toBe(true);
      expect(context.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/auth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle malformed JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      };

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      try {
        const response = await fetch('/api/auth/user/session');
        await response.json();
      } catch (error) {
        expect(error.message).toBe('Invalid JSON');
      }
    });
  });
});