import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { EnhancedWishlistProvider } from '@/contexts/EnhancedWishlistContext';
import { EnhancedActivityProvider } from '@/contexts/EnhancedActivityContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { EnhancedWishlistButton } from '@/components/wishlist/EnhancedWishlistButton';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { WishlistErrorBoundary } from '@/components/error-boundaries/WishlistErrorBoundary';
import { ActivityErrorBoundary } from '@/components/error-boundaries/ActivityErrorBoundary';

// Mock Firebase
jest.mock('firebase/database', () => ({
  onValue: jest.fn(),
  off: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  remove: jest.fn()
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock window events
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <EnhancedActivityProvider>
          <EnhancedWishlistProvider>
            {children}
          </EnhancedWishlistProvider>
        </EnhancedActivityProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Error Handling and Offline Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
    navigator.onLine = true;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Retry Mechanisms', () => {
    it('should retry failed wishlist operations', async () => {
      // Mock initial failure then success
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show loading state
      expect(screen.getByText('Updating...')).toBeInTheDocument();

      // Wait for retry to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle maximum retry attempts', async () => {
      // Mock all attempts to fail
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for all retry attempts
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('Offline Queue', () => {
    it('should queue operations when offline', async () => {
      // Simulate offline state
      navigator.onLine = false;

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show queued state
      await waitFor(() => {
        expect(screen.getByText('Queued')).toBeInTheDocument();
      });

      // Should show offline status
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should process queue when coming back online', async () => {
      // Start offline
      navigator.onLine = false;

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show offline status
      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
      });

      // Simulate coming back online
      act(() => {
        navigator.onLine = true;
        // Trigger online event
        const onlineHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'online'
        )?.[1];
        if (onlineHandler) {
          onlineHandler();
        }
      });

      // Mock successful API call for queued operation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Should process queued operations
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and display wishlist errors', () => {
      const ThrowError = () => {
        throw new Error('Test wishlist error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WishlistErrorBoundary>
          <ThrowError />
        </WishlistErrorBoundary>
      );

      expect(screen.getByText('Wishlist Error')).toBeInTheDocument();
      expect(screen.getByText('Test wishlist error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should catch and display activity errors', () => {
      const ThrowError = () => {
        throw new Error('Test activity error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ActivityErrorBoundary>
          <ThrowError />
        </ActivityErrorBoundary>
      );

      expect(screen.getByText('Activity Tracking Error')).toBeInTheDocument();
      expect(screen.getByText('Test activity error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should provide retry functionality in error boundaries', () => {
      let shouldThrow = true;
      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Conditional error');
        }
        return <div>Success</div>;
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WishlistErrorBoundary>
          <ConditionalError />
        </WishlistErrorBoundary>
      );

      expect(screen.getByText('Wishlist Error')).toBeInTheDocument();

      // Click retry button
      shouldThrow = false;
      const retryButton = screen.getByText(/Try Again/);
      fireEvent.click(retryButton);

      expect(screen.getByText('Success')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('User Feedback Notifications', () => {
    it('should show success notifications for wishlist operations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show success toast
      await waitFor(() => {
        expect(screen.getByText('Added to wishlist')).toBeInTheDocument();
      });
    });

    it('should show error notifications for failed operations', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show error toast after retries fail
      await waitFor(() => {
        expect(screen.getByText('Wishlist Error')).toBeInTheDocument();
      });
    });

    it('should show offline notifications', async () => {
      navigator.onLine = false;

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" showText />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show offline warning
      await waitFor(() => {
        expect(screen.getByText('Will sync when connection is restored')).toBeInTheDocument();
      });
    });
  });

  describe('Connection Status Component', () => {
    it('should display online status when connected', () => {
      navigator.onLine = true;

      render(
        <TestWrapper>
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should display offline status when disconnected', () => {
      navigator.onLine = false;

      render(
        <TestWrapper>
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should show queued operations count', async () => {
      navigator.onLine = false;

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" />
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      // Trigger an operation while offline
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show queued operations
      await waitFor(() => {
        expect(screen.getByText(/pending/)).toBeInTheDocument();
      });
    });

    it('should provide retry functionality', async () => {
      navigator.onLine = false;

      render(
        <TestWrapper>
          <EnhancedWishlistButton propertyId="test-property" />
          <ConnectionStatus showDetails />
        </TestWrapper>
      );

      // Trigger an operation while offline
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show retry button
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Mock successful retry
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Click retry
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should show retry notification
      await waitFor(() => {
        expect(screen.getByText('Retry initiated')).toBeInTheDocument();
      });
    });
  });
});