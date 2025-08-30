import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ActivityProvider, useActivityContext } from '@/contexts/ActivityContext';
import { useActivity } from '@/hooks/useActivity';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Mock fetch
global.fetch = jest.fn();

// Mock component to test the activity hook
function TestActivityComponent() {
  const { logPropertyView, logSearch, logWishlistAdd, stats } = useActivity();

  return (
    <div>
      <button 
        onClick={() => logPropertyView('test-property-1', { propertyTitle: 'Test Property' })}
        data-testid="log-property-view"
      >
        Log Property View
      </button>
      <button 
        onClick={() => logSearch('test search', { filters: { price: '100000' } })}
        data-testid="log-search"
      >
        Log Search
      </button>
      <button 
        onClick={() => logWishlistAdd('test-property-1', { propertyTitle: 'Test Property' })}
        data-testid="log-wishlist-add"
      >
        Log Wishlist Add
      </button>
      <div data-testid="stats">
        Views: {stats.totalViews}, Searches: {stats.totalSearches}, Wishlist: {stats.totalWishlistActions}
      </div>
    </div>
  );
}

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ActivityProvider>
        {children}
      </ActivityProvider>
    </AuthProvider>
  );
}

describe('Activity Tracking System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, activity: { id: '1', type: 'property_view', timestamp: new Date() } })
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should log property view activity', async () => {
    render(
      <TestWrapper>
        <TestActivityComponent />
      </TestWrapper>
    );

    const logButton = screen.getByTestId('log-property-view');
    fireEvent.click(logButton);

    // Check that stats are updated optimistically
    await waitFor(() => {
      const stats = screen.getByTestId('stats');
      expect(stats.textContent).toContain('Views: 1');
    });
  });

  it('should log search activity', async () => {
    render(
      <TestWrapper>
        <TestActivityComponent />
      </TestWrapper>
    );

    const logButton = screen.getByTestId('log-search');
    fireEvent.click(logButton);

    // Check that stats are updated optimistically
    await waitFor(() => {
      const stats = screen.getByTestId('stats');
      expect(stats.textContent).toContain('Searches: 1');
    });
  });

  it('should log wishlist activity', async () => {
    render(
      <TestWrapper>
        <TestActivityComponent />
      </TestWrapper>
    );

    const logButton = screen.getByTestId('log-wishlist-add');
    fireEvent.click(logButton);

    // Check that stats are updated optimistically
    await waitFor(() => {
      const stats = screen.getByTestId('stats');
      expect(stats.textContent).toContain('Wishlist: 1');
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <TestActivityComponent />
      </TestWrapper>
    );

    const logButton = screen.getByTestId('log-property-view');
    fireEvent.click(logButton);

    // Stats should still be updated optimistically even if API fails
    await waitFor(() => {
      const stats = screen.getByTestId('stats');
      expect(stats.textContent).toContain('Views: 1');
    });
  });
});

describe('Activity Context', () => {
  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestActivityComponent />);
    }).toThrow('useActivityContext must be used within an ActivityProvider');

    consoleSpy.mockRestore();
  });

  it('should provide activity context when wrapped in provider', () => {
    expect(() => {
      render(
        <TestWrapper>
          <TestActivityComponent />
        </TestWrapper>
      );
    }).not.toThrow();
  });
});