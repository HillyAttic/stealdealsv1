import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { render, act, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { ActivityProvider, useActivityContext } from '@/contexts/ActivityContext';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Mock auth context
const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 'test-user-1' },
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  refreshAuth: jest.fn(),
};

jest.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuthContext: () => mockAuthContext,
}));

// Test component to access context
function TestActivityComponent({ onStateChange }: { onStateChange?: (state: any) => void }) {
  const context = useActivityContext();
  
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange(context);
    }
  }, [context, onStateChange]);

  return (
    <div data-testid="activity-test-component">
      <div data-testid="total-activities">{context.stats.totalActivities}</div>
      <div data-testid="total-views">{context.stats.totalViews}</div>
      <div data-testid="total-searches">{context.stats.totalSearches}</div>
      <div data-testid="total-wishlist-actions">{context.stats.totalWishlistActions}</div>
      <div data-testid="is-loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error || 'null'}</div>
      <div data-testid="activities-count">{context.activities.length}</div>
      <button 
        data-testid="log-property-view" 
        onClick={() => context.logActivity('property_view', 'property-1', { duration: 5000 })}
      >
        Log Property View
      </button>
      <button 
        data-testid="log-search" 
        onClick={() => context.logActivity('search', undefined, { query: 'test search' })}
      >
        Log Search
      </button>
      <button 
        data-testid="log-wishlist-add" 
        onClick={() => context.logActivity('wishlist_add', 'property-2')}
      >
        Log Wishlist Add
      </button>
      <button 
        data-testid="refresh-activities" 
        onClick={() => context.refreshActivities()}
      >
        Refresh Activities
      </button>
    </div>
  );
}

describe('ActivityContext Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'test-user-agent'
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize with empty stats for authenticated user', async () => {
      // Mock API responses
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              totalSessions: 0,
              averageSessionDuration: 0,
              pagesPerSession: 0,
              bounceRate: 0
            }
          })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-activities')).toHaveTextContent('0');
        expect(screen.getByTestId('total-views')).toHaveTextContent('0');
        expect(screen.getByTestId('total-searches')).toHaveTextContent('0');
        expect(screen.getByTestId('total-wishlist-actions')).toHaveTextContent('0');
      });
    });

    it('should clear activities for non-authenticated user', async () => {
      // Mock non-authenticated user
      jest.mocked(mockAuthContext).isAuthenticated = false;
      jest.mocked(mockAuthContext).user = null;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-activities')).toHaveTextContent('0');
        expect(screen.getByTestId('activities-count')).toHaveTextContent('0');
      });
    });

    it('should generate and store session ID', async () => {
      const mockSetItem = jest.fn();
      const mockGetItem = jest.fn().mockReturnValue(null);
      Object.defineProperty(window, 'sessionStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true,
      });

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      expect(mockGetItem).toHaveBeenCalledWith('activity_session_id');
      expect(mockSetItem).toHaveBeenCalledWith(
        'activity_session_id',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      );
    });
  });

  describe('Activity Logging', () => {
    beforeEach(() => {
      // Reset to authenticated user
      jest.mocked(mockAuthContext).isAuthenticated = true;
      jest.mocked(mockAuthContext).user = { id: 'test-user-1' };
    });

    it('should log property view activity successfully', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1', type: 'property_view' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const logButton = screen.getByTestId('log-property-view');
      
      await act(async () => {
        logButton.click();
      });

      // Wait for batch processing
      await waitFor(() => {
        expect(screen.getByTestId('total-views')).toHaveTextContent('1');
        expect(screen.getByTestId('total-activities')).toHaveTextContent('1');
      }, { timeout: 6000 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/user/activity',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('property_view')
        })
      );
    });

    it('should log search activity successfully', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1', type: 'search' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const logButton = screen.getByTestId('log-search');
      
      await act(async () => {
        logButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-searches')).toHaveTextContent('1');
        expect(screen.getByTestId('total-activities')).toHaveTextContent('1');
      }, { timeout: 6000 });
    });

    it('should log wishlist activity successfully', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1', type: 'wishlist_add' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const logButton = screen.getByTestId('log-wishlist-add');
      
      await act(async () => {
        logButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-wishlist-actions')).toHaveTextContent('1');
        expect(screen.getByTestId('total-activities')).toHaveTextContent('1');
      }, { timeout: 6000 });
    });

    it('should handle activity logging failures with retry', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1', type: 'property_view' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const logButton = screen.getByTestId('log-property-view');
      
      await act(async () => {
        logButton.click();
      });

      // Should eventually succeed after retries
      await waitFor(() => {
        expect(screen.getByTestId('total-views')).toHaveTextContent('1');
      }, { timeout: 10000 });

      // Should have made multiple attempts
      expect(mockFetch).toHaveBeenCalledTimes(4); // 3 attempts + 1 broadcast
    });

    it('should batch multiple activities', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1' } })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      // Log multiple activities quickly
      const viewButton = screen.getByTestId('log-property-view');
      const searchButton = screen.getByTestId('log-search');
      const wishlistButton = screen.getByTestId('log-wishlist-add');
      
      await act(async () => {
        viewButton.click();
        searchButton.click();
        wishlistButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-activities')).toHaveTextContent('3');
      }, { timeout: 6000 });

      // Should have batched the requests
      expect(mockFetch).toHaveBeenCalledTimes(6); // 3 activity calls + 3 broadcast calls
    });
  });

  describe('Activity History', () => {
    it('should get activity history successfully', async () => {
      const mockActivities = [
        { id: '1', type: 'property_view', propertyId: 'prop-1', timestamp: new Date() },
        { id: '2', type: 'search', metadata: { query: 'test' }, timestamp: new Date() }
      ];

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockActivities })
      });
      global.fetch = mockFetch;

      let contextRef: any;
      const onStateChange = (context: any) => {
        contextRef = context;
      };

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent onStateChange={onStateChange} />
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextRef).toBeDefined();
      });

      const result = await act(async () => {
        return contextRef.getActivityHistory(10);
      });

      expect(result).toEqual(mockActivities);
      expect(mockFetch).toHaveBeenCalledWith('/api/user/activity?limit=10');
    });

    it('should handle activity history errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
      });
      global.fetch = mockFetch;

      let contextRef: any;
      const onStateChange = (context: any) => {
        contextRef = context;
      };

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent onStateChange={onStateChange} />
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextRef).toBeDefined();
      });

      const result = await act(async () => {
        return contextRef.getActivityHistory();
      });

      expect(result).toEqual([]);
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load activity history');
      });
    });
  });

  describe('Refresh Activities', () => {
    it('should refresh activities and stats successfully', async () => {
      const mockActivities = [
        { id: '1', type: 'property_view', propertyId: 'prop-1', timestamp: new Date() },
        { id: '2', type: 'search', metadata: { query: 'test' }, timestamp: new Date() }
      ];

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockActivities })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            data: {
              totalSessions: 5,
              averageSessionDuration: 300,
              pagesPerSession: 3.5,
              bounceRate: 0.2
            }
          })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const refreshButton = screen.getByTestId('refresh-activities');
      
      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('activities-count')).toHaveTextContent('2');
        expect(screen.getByTestId('total-views')).toHaveTextContent('1');
        expect(screen.getByTestId('total-searches')).toHaveTextContent('1');
      });
    });

    it('should handle refresh errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const refreshButton = screen.getByTestId('refresh-activities');
      
      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to refresh activities');
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear errors when clearError is called', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Test error'));
      global.fetch = mockFetch;

      let contextRef: any;
      const onStateChange = (context: any) => {
        contextRef = context;
      };

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent onStateChange={onStateChange} />
          </ActivityProvider>
        </AuthProvider>
      );

      // Trigger error
      const refreshButton = screen.getByTestId('refresh-activities');
      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null');
      });

      // Clear error
      act(() => {
        contextRef.clearError();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  describe('Real-time Broadcasting', () => {
    it('should broadcast activity updates', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, activity: { id: '1', type: 'property_view' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <TestActivityComponent />
          </ActivityProvider>
        </AuthProvider>
      );

      const logButton = screen.getByTestId('log-property-view');
      
      await act(async () => {
        logButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/realtime/broadcast',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('activity_update')
          })
        );
      }, { timeout: 6000 });
    });
  });
});