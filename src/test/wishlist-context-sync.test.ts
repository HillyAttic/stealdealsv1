import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlistContext } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import React from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth context
vi.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuthContext: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', email: 'test@example.com' }
  })
}));

// Test component to access context
function TestComponent({ 
  onStateChange 
}: { 
  onStateChange: (state: any) => void;
}) {
  const context = useWishlistContext();
  
  React.useEffect(() => {
    onStateChange({
      items: Array.from(context.wishlistItems),
      count: context.wishlistCount,
      isLoading: context.isLoading
    });
  }, [context.wishlistItems, context.wishlistCount, context.isLoading, onStateChange]);
  
  return (
    <div>
      <div data-testid="wishlist-count">{context.wishlistCount}</div>
      <div data-testid="wishlist-items">{Array.from(context.wishlistItems).join(',')}</div>
      <button 
        data-testid="add-button" 
        onClick={() => context.addToWishlist('2')}
      >
        Add Property 2
      </button>
      <button 
        data-testid="remove-button" 
        onClick={() => context.removeFromWishlist('2')}
      >
        Remove Property 2
      </button>
      <button 
        data-testid="refresh-button" 
        onClick={() => context.refreshWishlist()}
      >
        Refresh
      </button>
    </div>
  );
}

describe('Wishlist Context Synchronization', () => {
  let stateChanges: any[] = [];
  
  const onStateChange = (state: any) => {
    stateChanges.push({
      ...state,
      timestamp: Date.now()
    });
  };

  beforeEach(() => {
    stateChanges = [];
    vi.clearAllMocks();
    
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Load Behavior', () => {
    it('should start with empty wishlist and load from server', async () => {
      // Mock empty server response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [],
          total: 0
        })
      });

      render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(0);
      });

      // Check that fetch was called for initial load
      expect(mockFetch).toHaveBeenCalledWith('/api/user/wishlist', {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-mock-user-id': 'user-1',
          'x-mock-user-email': 'test@example.com'
        }),
        credentials: 'include'
      });

      // Final state should be empty
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.items).toEqual([]);
      expect(finalState.count).toBe(0);
    });

    it('should load existing wishlist from server', async () => {
      // Mock server response with property 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [
            { id: '2', title: 'Test Property 2' }
          ],
          total: 1
        })
      });

      render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 1;
      });

      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.items).toEqual(['2']);
      expect(finalState.count).toBe(1);
    });
  });

  describe('Add to Wishlist Behavior', () => {
    it('should optimistically update then sync with server', async () => {
      // Mock initial empty response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [],
          total: 0
        })
      });

      const { getByTestId } = render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 0 && !finalState.isLoading;
      });

      // Clear previous state changes
      stateChanges = [];

      // Mock successful add response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Property added to wishlist',
          item: { propertyId: '2', userId: 'user-1' }
        })
      });

      // Click add button
      const addButton = getByTestId('add-button');
      act(() => {
        addButton.click();
      });

      // Should immediately show optimistic update
      await waitFor(() => {
        return stateChanges.some(state => state.count === 1);
      });

      // Should have made API call
      expect(mockFetch).toHaveBeenCalledWith('/api/user/wishlist', {
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-mock-user-id': 'user-1',
          'x-mock-user-email': 'test@example.com'
        }),
        credentials: 'include',
        body: JSON.stringify({ propertyId: '2', action: 'add' })
      });

      // Final state should include the property
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.items).toContain('2');
      expect(finalState.count).toBe(1);
    });

    it('should revert optimistic update on server error', async () => {
      // Mock initial empty response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [],
          total: 0
        })
      });

      const { getByTestId } = render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 0 && !finalState.isLoading;
      });

      stateChanges = [];

      // Mock server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Property already in wishlist'
        })
      });

      // Click add button
      const addButton = getByTestId('add-button');
      act(() => {
        addButton.click();
      });

      // Should temporarily show optimistic update, then revert
      await waitFor(() => {
        return stateChanges.length >= 2;
      });

      // Should have optimistic update first
      expect(stateChanges.some(state => state.count === 1)).toBe(true);
      
      // Then should revert back to 0
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.count).toBe(0);
      expect(finalState.items).not.toContain('2');
    });
  });

  describe('Remove from Wishlist Behavior', () => {
    it('should optimistically remove then sync with server', async () => {
      // Mock initial response with property 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [{ id: '2', title: 'Test Property 2' }],
          total: 1
        })
      });

      const { getByTestId } = render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      // Wait for initial load with property 2
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 1 && !finalState.isLoading;
      });

      stateChanges = [];

      // Mock successful remove response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Property removed from wishlist'
        })
      });

      // Click remove button
      const removeButton = getByTestId('remove-button');
      act(() => {
        removeButton.click();
      });

      // Should immediately show optimistic update
      await waitFor(() => {
        return stateChanges.some(state => state.count === 0);
      });

      // Should have made API call
      expect(mockFetch).toHaveBeenCalledWith('/api/user/wishlist', {
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        credentials: 'include',
        body: JSON.stringify({ propertyId: '2', action: 'remove' })
      });

      // Final state should not include the property
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.items).not.toContain('2');
      expect(finalState.count).toBe(0);
    });
  });

  describe('Context and Server Sync Issues', () => {
    it('should handle discrepancy between context state and server state', async () => {
      // Mock initial load with property 2 on server
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [{ id: '2', title: 'Test Property 2' }],
          total: 1
        })
      });

      const { getByTestId } = render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 1 && !finalState.isLoading;
      });

      stateChanges = [];

      // Mock server says property not in wishlist (404 error)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          success: false,
          error: 'Property not found in wishlist'
        })
      });

      // Try to remove (this should fail and show the discrepancy)
      const removeButton = getByTestId('remove-button');
      act(() => {
        removeButton.click();
      });

      // Should show optimistic removal, then revert due to server error
      await waitFor(() => {
        return stateChanges.length >= 2;
      });

      // Should have optimistic removal
      expect(stateChanges.some(state => state.count === 0)).toBe(true);
      
      // Then should revert back to having the item (because server said it wasn't there)
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.count).toBe(1);
      expect(finalState.items).toContain('2');
    });

    it('should refresh wishlist to sync with server', async () => {
      // Mock initial empty response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [],
          total: 0
        })
      });

      const { getByTestId } = render(
        <AuthProvider>
          <WishlistProvider>
            <TestComponent onStateChange={onStateChange} />
          </WishlistProvider>
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 0 && !finalState.isLoading;
      });

      stateChanges = [];

      // Mock refresh response with property 2 (simulating server state change)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [
            { id: '2', title: 'Test Property 2' },
            { id: '3', title: 'Test Property 3' }
          ],
          total: 2
        })
      });

      // Click refresh
      const refreshButton = getByTestId('refresh-button');
      act(() => {
        refreshButton.click();
      });

      // Should update to match server state
      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        return finalState.count === 2 && !finalState.isLoading;
      });

      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.items).toEqual(['2', '3']);
      expect(finalState.count).toBe(2);
    });
  });
});