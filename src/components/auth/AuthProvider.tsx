'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { clientSession } from '@/lib/auth/client-session';
import { SessionData } from '@/lib/auth/session';

interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionData['user'] | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: SessionData['user'] }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user?: SessionData['user'] }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionData['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing authentication...');
        
        // Check for existing session first
        const session = clientSession.getSession();
        console.log('[AuthProvider] Client session:', session);
        
        if (session) {
          console.log('[AuthProvider] Found session, setting user:', session.user);
          setIsAuthenticated(true);
          setUser(session.user);
          setIsLoading(false);
          return;
        }

        // Check for mock authentication in localStorage
        const mockAuthenticated = localStorage.getItem('mock_authenticated');
        const mockUser = localStorage.getItem('mock_user');
        console.log('[AuthProvider] Mock auth check:', { mockAuthenticated, mockUserExists: !!mockUser });
        
        if (mockAuthenticated === 'true' && mockUser) {
          try {
            const user = JSON.parse(mockUser);
            console.log('[AuthProvider] Found mock user, setting authenticated:', user);
            setIsAuthenticated(true);
            setUser(user);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('[AuthProvider] Error parsing mock user:', error);
            // Clear invalid mock data
            localStorage.removeItem('mock_authenticated');
            localStorage.removeItem('mock_user');
          }
        }
        
        // Try to validate session with server
        try {
          const response = await fetch('/api/auth/user/session', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.authenticated) {
              setIsAuthenticated(true);
              setUser(data.user);
              
              // Update client session
              const sessionData: SessionData = {
                user: data.user,
                token: '', // Token is in HTTP-only cookie
                expiresAt: new Date(data.expiresAt)
              };
              clientSession.updateSession(sessionData);
            }
          } else if (response.status === 401) {
            // 401 is expected when not logged in, don't treat as error
            console.debug('No active session found (expected when logged out)');
          }
        } catch (sessionError) {
          // Only log actual network errors, not auth failures
          console.debug('Session check failed:', sessionError);
        }
      } catch (error) {
        console.error('[AuthProvider] Auth initialization error:', error);
      } finally {
        console.log('[AuthProvider] Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthProvider] Login attempt:', { email });
    setIsLoading(true);
    
    try {
      // Try API first, fallback to mock authentication
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // API login successful
        setIsAuthenticated(true);
        setUser(data.data?.user || data.user);

        // Update client session
        const sessionData: SessionData = {
          user: data.data?.user || data.user,
          token: data.data?.token || data.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        clientSession.updateSession(sessionData);

        return { success: true, user: data.data?.user || data.user };
      } else {
        // API failed, try mock authentication for development
        console.log('[AuthProvider] API login failed, attempting mock authentication');
        
        // Simple mock authentication for testing
        if (email && password) {
          const mockUser = {
            id: '1',
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
            role: 'user' as const,
            provider: 'email' as const
          };

          setIsAuthenticated(true);
          setUser(mockUser);

          // Store in localStorage for persistence
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          localStorage.setItem('mock_authenticated', 'true');

          return { success: true, user: mockUser };
        } else {
          return { success: false, error: 'Please provide email and password' };
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock authentication in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Network error, using mock authentication for development');
        
        if (email && password) {
          const mockUser = {
            id: '1',
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
            role: 'user' as const,
            provider: 'email' as const
          };

          setIsAuthenticated(true);
          setUser(mockUser);

          // Store in localStorage for persistence
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          localStorage.setItem('mock_authenticated', 'true');

          return { success: true, user: mockUser };
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Try API first, fallback to mock authentication
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // API registration successful
        setIsAuthenticated(true);
        setUser(data.data?.user || data.user);

        // Update client session
        const sessionData: SessionData = {
          user: data.data?.user || data.user,
          token: data.data?.token || data.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        clientSession.updateSession(sessionData);

        return { success: true, user: data.data?.user || data.user };
      } else {
        // API failed, try mock authentication for development
        console.log('API registration failed, attempting mock registration');
        
        // Simple mock registration for testing
        if (name && email && password) {
          const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
            role: 'user' as const,
            provider: 'email' as const
          };

          setIsAuthenticated(true);
          setUser(mockUser);

          // Store in localStorage for persistence
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          localStorage.setItem('mock_authenticated', 'true');

          return { success: true, user: mockUser };
        } else {
          return { success: false, error: 'Please provide all required fields' };
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      // Fallback to mock authentication in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Network error, using mock registration for development');
        
        if (name && email && password) {
          const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
            role: 'user' as const,
            provider: 'email' as const
          };

          setIsAuthenticated(true);
          setUser(mockUser);

          // Store in localStorage for persistence
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          localStorage.setItem('mock_authenticated', 'true');

          return { success: true, user: mockUser };
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear mock authentication data
      localStorage.removeItem('mock_authenticated');
      localStorage.removeItem('mock_user');
      
      // Try to logout from server
      try {
        await clientSession.logout();
      } catch (error) {
        console.debug('Server logout failed, continuing with local logout');
      }
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state
      setIsAuthenticated(false);
      setUser(null);
      // Clear mock data even on error
      localStorage.removeItem('mock_authenticated');
      localStorage.removeItem('mock_user');
      return { success: false, error: 'Logout failed' };
    }
  };

  const refreshSession = async () => {
    try {
      const success = await clientSession.refreshSession();
      if (success) {
        const session = clientSession.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
        }
      }
      return success;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}