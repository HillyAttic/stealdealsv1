import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { render, act, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { WishlistProvider, useWishlistContext } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ActivityProvider } from '@/contexts/ActivityContext';

// Mock Firebase
jest.mock('firebase/database', () => ({
  onValue: jest.fn(),
  off: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  push: jest.fn(),
  child: jest.fn(),
}));

// Mock database functions
jest.mock('@/lib/database/wishlist', () => ({
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  getRawWishlistItems: jest.fn(),
  getUserWishlistRef: jest.fn(),
}));

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

// Mock activity context
const mockActivityContext = {
  activities: [],
  stats: {
    totalViews: 0,
    totalSearches: 0,
    totalWishlistActions: 0,
    totalActivities: 0,
    recentActivities: []
  },
  isLoading: false,
  error: null,
  logActivity: jest.fn(),
  getActivityHistory: jest.fn(),
  refreshActivities: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('@/contexts/ActivityContext', () => ({
  ActivityProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="activity-provider">{children}</div>
  ),
  useActivityContext: () => mockActivityContext,
}));

// Test component to access context
function TestWishlistComponent({ onStateChange }: { onStateChange?: (state: any) => void }) {
  const context = useWishlistContext();
  
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange(context);
    }
  }, [context, onStateChange]);

  return (
    <div data-testid="wishlist-test-component">
      <div data-testid="wishlist-count">{context.wishlistCount}</div>
      <div data-testid="is-loading">{context.isLoading.toString()}</div>
      <div data-testid="is-initialized">{context.isInitialized.toString()}</div>
      <div data-testid="error">{context.error || 'null'}</div>
      <button 
        data-testid="add-property-1" 
        onClick={() => context.addToWishlist('property-1')}
      >
        Add Property 1
      </button>
      <button 
        data-testid="remove-property-1" 
        onClick={() => context.removeFromWishlist('property-1')}
      >
        Remove Property 1
      </button>
      <button 
        data-testid="toggle-property-2" 
        onClick={() => context.toggleWishlist('property-2')}
      >
        Toggle Property 2
      </button>
      <div data-testid="is-in-wishlist-1">
        {context.isInWishlist('property-1').toString()}
      </div>
      <div data-testid="is-operation-loading-1">
        {context.isOperationLoading('property-1').toString()}
      </div>
    </div>
  );
}

describe('WishlistContext Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize with empty wishlist for authenticated user', async () => {
      const onStateChange = jest.fn();
      
      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent onStateChange={onStateChange} />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
        expect(screen.getByTestId('is-initialized')).toHaveTextContent('true');
      });
    });

    it('should load from localStorage for non-authenticated user', async () => {
      // Mock non-authenticated user
      jest.mocked(mockAuthContext).isAuthenticated = false;
      jest.mocked(mockAuthContext).user = null;
      
      // Mock localStorage with existing data
      const mockGetItem = jest.fn().mockReturnValue(JSON.stringify(['property-1', 'property-2']));
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: jest.fn() },
        writable: true,
      });

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('2');
        expect(mockGetItem).toHaveBeenCalledWith('stealdeals_wishlist_temp');
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock non-authenticated user
      jest.mocked(mockAuthContext).isAuthenticated = false;
      jest.mocked(mockAuthContext).user = null;
      
      // Mock localStorage error
      const mockGetItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: jest.fn() },
        writable: true,
      });

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load saved wishlist items');
      });
    });
  });

  describe('Wishlist Operations', () => {
    beforeEach(() => {
      // Reset to authenticated user
      jest.mocked(mockAuthContext).isAuthenticated = true;
      jest.mocked(mockAuthContext).user = { id: 'test-user-1' };
    });

    it('should add property to wishlist successfully', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);
      jest.mocked(mockActivityContext.logActivity).mockResolvedValue();

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      const addButton = screen.getByTestId('add-property-1');
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-1')).toHaveTextContent('true');
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('1');
      });

      expect(addToWishlist).toHaveBeenCalledWith('test-user-1', 'property-1');
      expect(mockActivityContext.logActivity).toHaveBeenCalledWith(
        'wishlist_add',
        'property-1',
        expect.objectContaining({
          timestamp: expect.any(String),
          source: 'wishlist_button'
        })
      );
    });

    it('should handle add operation failure with rollback', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockRejectedValue(new Error('Database error'));

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      const addButton = screen.getByTestId('add-property-1');
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to add property to wishlist');
        expect(screen.getByTestId('is-in-wishlist-1')).toHaveTextContent('false');
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
      });
    });

    it('should remove property from wishlist successfully', async () => {
      const { removeFromWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(removeFromWishlist).mockResolvedValue(true);
      jest.mocked(mockActivityContext.logActivity).mockResolvedValue();

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      // First add a property
      const addButton = screen.getByTestId('add-property-1');
      await act(async () => {
        addButton.click();
      });

      // Then remove it
      const removeButton = screen.getByTestId('remove-property-1');
      await act(async () => {
        removeButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-1')).toHaveTextContent('false');
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
      });

      expect(removeFromWishlist).toHaveBeenCalledWith('test-user-1', 'property-1');
      expect(mockActivityContext.logActivity).toHaveBeenCalledWith(
        'wishlist_remove',
        'property-1',
        expect.objectContaining({
          timestamp: expect.any(String),
          source: 'wishlist_button'
        })
      );
    });

    it('should toggle property in wishlist', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      const toggleButton = screen.getByTestId('toggle-property-2');
      
      // First toggle should add
      await act(async () => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('1');
      });
    });

    it('should track operation loading states', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      let resolveAdd: (value: boolean) => void;
      const addPromise = new Promise<boolean>((resolve) => {
        resolveAdd = resolve;
      });
      jest.mocked(addToWishlist).mockReturnValue(addPromise);

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      const addButton = screen.getByTestId('add-property-1');
      
      // Start operation
      act(() => {
        addButton.click();
      });

      // Should show loading
      await waitFor(() => {
        expect(screen.getByTestId('is-operation-loading-1')).toHaveTextContent('true');
      });

      // Complete operation
      act(() => {
        resolveAdd!(true);
      });

      // Should clear loading
      await waitFor(() => {
        expect(screen.getByTestId('is-operation-loading-1')).toHaveTextContent('false');
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear errors when clearError is called', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockRejectedValue(new Error('Test error'));

      let contextRef: any;
      const onStateChange = (context: any) => {
        contextRef = context;
      };

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent onStateChange={onStateChange} />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      // Trigger error
      const addButton = screen.getByTestId('add-property-1');
      await act(async () => {
        addButton.click();
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

  describe('Real-time Updates', () => {
    it('should broadcast real-time updates on wishlist changes', async () => {
      const { addToWishlist } = await import('@/lib/database/wishlist');
      jest.mocked(addToWishlist).mockResolvedValue(true);
      
      // Mock fetch for broadcast
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      global.fetch = mockFetch;

      render(
        <AuthProvider>
          <ActivityProvider>
            <WishlistProvider>
              <TestWishlistComponent />
            </WishlistProvider>
          </ActivityProvider>
        </AuthProvider>
      );

      const addButton = screen.getByTestId('add-property-1');
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/realtime/broadcast',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('wishlist_update')
          })
        );
      });
    });
  });
});