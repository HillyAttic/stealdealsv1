'use client';

import { useState, useEffect, useCallback } from 'react';
import { clientSession } from '@/lib/auth/client-session';
import { SessionData } from '@/lib/auth/session';

interface AuthState {
  isAuthenticated: boolean;
  user: SessionData['user'] | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  // Load initial session state
  useEffect(() => {
    const loadSession = () => {
      try {
        const session = clientSession.getSession();
        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading session:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Failed to load session'
        });
      }
    };

    loadSession();

    // Set up periodic session checks
    const interval = setInterval(loadSession, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Update client session
      const sessionData: SessionData = {
        user: data.user,
        token: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      clientSession.updateSession(sessionData);

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        error: null
      });

      return { success: true, user: data.user };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Update client session
      const sessionData: SessionData = {
        user: data.user,
        token: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      clientSession.updateSession(sessionData);

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        error: null
      });

      return { success: true, user: data.user };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await clientSession.logout();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
      return { success: false, error: 'Logout failed' };
    }
  }, []);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const success = await clientSession.refreshSession();
      if (success) {
        const session = clientSession.getSession();
        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
          isLoading: false,
          error: null
        });
      }
      return success;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }, []);

  // Check session function
  const checkSession = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/user/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.authenticated) {
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        });
        return false;
      }

    } catch (error) {
      console.error('Session check error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Session check failed'
      });
      return false;
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshSession,
    checkSession
  };
}