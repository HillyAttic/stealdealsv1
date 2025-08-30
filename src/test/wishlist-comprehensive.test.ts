import { describe, it, expect, beforeEach, beforeAll, afterEach } from '@jest/globals';
const vi = jest;;
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock Firebase
const mockFirebaseApp = {};
const mockDatabase = {};
const mockRef = jest.fn(() => ({}));
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockPush = jest.fn(() => ({ key: 'test-key' }));
const mockQuery = jest.fn();
const mockOrderByChild = jest.fn();
const mockEqualTo = jest.fn();
const mockOnValue = jest.fn();
const mockUpdate = jest.fn();

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => mockFirebaseApp)
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => mockDatabase),
  ref: mockRef,
  get: mockGet,
  set: mockSet,
  push: mockPush,
  query: mockQuery,
  orderByChild: mockOrderByChild,
  equalTo: mockEqualTo,
  onValue: mockOnValue,
  off: jest.fn(),
  update: mockUpdate,
  remove: jest.fn()
}));

// Mock the Firebase config
jest.mock('@/lib/firebase', () => ({
  database: mockDatabase,
  getPropertyById: jest.fn()
}));

// Mock auth provider
const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com'
};

const mockAuthContext = {
  isAuthenticated: true,
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn()
};

jest.mock('@/components/auth/AuthProvider', () => ({
  useAuthContext: () => mockAuthContext
}));

// Mock Next.js components
jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children);
  }
}));

jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return React.createElement('img', { src, alt, ...props });
  }
}));

// Import components after mocking
import { WishlistProvider, useWishlistContext } from '@/contexts/WishlistContext';
import { WishlistSection } from '@/components/wishlist/WishlistSection';
import WishlistPage from '@/app/wishlist/page';

describe('Wishlist System Comprehensive Tests', () => {
  beforeAll(() => {
    // Mock window and localStorage
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

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockGet.mockResolvedValue({ exists: () => false });
    mockSet.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
    
    // Setup localStorage mock
    const localStorageMock = window.localStorage as any;
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  describe('WishlistContext', () => {
    it('should initialize with empty wishlist for authenticated users', async () => {
      // Mock Firebase snapshot for empty wishlist
      mockGet.mockResolvedValue({ 
        exists: () => false 
      });

      const TestComponent = () => {
        const context = useWishlistContext();
        return React.createElement('div', null,
          React.createElement('span', { 'data-testid': 'count' }, context.wishlistCount),
          React.createElement('span', { 'data-testid': 'loading' }, context.isLoading ? 'loading' : 'loaded'),
          React.createElement('span', { 'data-testid': 'initialized' }, context.isInitialized ? 'yes' : 'no')
        );
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0');
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('initialized')).toHaveTextContent('yes');
      });
    });

    it('should load wishlist items from Firebase for authenticated users', async () => {
      // Mock Firebase snapshot with data
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          callback({
            key: 'item1',
            val: () => ({
              propertyId: 'property-1',
              userId: 'test-user-1',
              addedAt: new Date().toISOString(),
              priority: 'medium'
            })
          });
          callback({
            key: 'item2', 
            val: () => ({
              propertyId: 'property-2',
              userId: 'test-user-1',
              addedAt: new Date().toISOString(),
              priority: 'high'
            })
          });
        }
      };

      // Mock onValue to simulate real-time updates
      mockOnValue.mockImplementation((ref, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return () => {}; // unsubscribe function
      });

      const TestComponent = () => {
        const context = useWishlistContext();
        return (
          <div>
            <span data-testid="count">{context.wishlistCount}</span>
            <span data-testid="items">{Array.from(context.wishlistItems).join(',')}</span>
          </div>
        );
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2');
        expect(screen.getByTestId('items')).toHaveTextContent('property-1,property-2');
      });
    });

    it('should handle adding items to wishlist', async () => {
      mockSet.mockResolvedValue(undefined);
      mockGet.mockResolvedValue({ exists: () => false });

      const TestComponent = () => {
        const context = useWishlistContext();
        return (
          <div>
            <span data-testid="count">{context.wishlistCount}</span>
            <button 
              onClick={() => context.addToWishlist('property-3')}
              data-testid="add-button"
            >
              Add Property
            </button>
          </div>
        );
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      fireEvent.click(screen.getByTestId('add-button'));

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });

    it('should handle localStorage for unauthenticated users', () => {
      // Mock unauthenticated state
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;

      const localStorageMock = window.localStorage as any;
      localStorageMock.getItem.mockReturnValue('["property-1", "property-2"]');

      const TestComponent = () => {
        const context = useWishlistContext();
        return (
          <div>
            <span data-testid="count">{context.wishlistCount}</span>
          </div>
        );
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });
  });

  describe('WishlistSection Component', () => {
    it('should display empty state when no wishlist items', async () => {
      mockGet.mockResolvedValue({ exists: () => false });

      render(
        <WishlistProvider>
          <WishlistSection />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
        expect(screen.getByText('Browse Properties')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock context with items but API failure
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          callback({
            key: 'item1',
            val: () => ({
              propertyId: 'property-1',
              userId: 'test-user-1'
            })
          });
        }
      };

      mockOnValue.mockImplementation((ref, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return () => {};
      });

      // Mock fetch to simulate API error
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ 
            success: false, 
            error: 'Server error' 
          })
        })
      ) as any;

      render(
        <WishlistProvider>
          <WishlistSection />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Error loading wishlist/)).toBeInTheDocument();
      });
    });
  });

  describe('WishlistPage Component', () => {
    it('should show sign-in prompt for unauthenticated users', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;

      render(<WishlistPage />);

      expect(screen.getByText('Sign in to view your wishlist')).toBeInTheDocument();
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      const TestPage = () => {
        return <WishlistPage />;
      };

      render(<TestPage />);

      // Should show loading spinner initially
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should handle successful wishlist API response', async () => {
      const mockProperties = [
        {
          id: 'property-1',
          title: 'Test Property 1',
          price: 100000,
          location: 'Test Location',
          images: ['test-image.jpg'],
          type: 'Apartment',
          addedAt: new Date().toISOString(),
          priority: 'medium'
        }
      ];

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            properties: mockProperties,
            total: 1
          })
        })
      ) as any;

      // Mock context to have items
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          callback({
            key: 'item1',
            val: () => ({
              propertyId: 'property-1',
              userId: 'test-user-1'
            })
          });
        }
      };

      mockOnValue.mockImplementation((ref, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return () => {};
      });

      render(
        <WishlistProvider>
          <WishlistSection />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/wishlist', expect.any(Object));
      });
    });

    it('should handle API timeout/network errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as any;

      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          callback({
            key: 'item1',
            val: () => ({
              propertyId: 'property-1',
              userId: 'test-user-1'
            })
          });
        }
      };

      mockOnValue.mockImplementation((ref, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return () => {};
      });

      render(
        <WishlistProvider>
          <WishlistSection />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed localStorage data', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;

      const localStorageMock = window.localStorage as any;
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const TestComponent = () => {
        const context = useWishlistContext();
        return <span data-testid="count">{context.wishlistCount}</span>;
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Should handle gracefully and show 0
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    it('should handle Firebase connection errors', async () => {
      mockOnValue.mockImplementation((ref, callback, errorCallback) => {
        setTimeout(() => errorCallback(new Error('Firebase connection error')), 0);
        return () => {};
      });

      const TestComponent = () => {
        const context = useWishlistContext();
        return (
          <div>
            <span data-testid="loading">{context.isLoading ? 'loading' : 'loaded'}</span>
          </div>
        );
      };

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });
    });

    it('should handle missing property data gracefully', async () => {
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          callback({
            key: 'item1',
            val: () => ({
              propertyId: 'nonexistent-property',
              userId: 'test-user-1'
            })
          });
        }
      };

      mockOnValue.mockImplementation((ref, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return () => {};
      });

      // Mock API to return empty properties array
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            properties: [], // Empty array means property not found
            total: 0
          })
        })
      ) as any;

      render(
        <WishlistProvider>
          <WishlistSection />
        </WishlistProvider>
      );

      await waitFor(() => {
        // Should show empty state or handle gracefully
        expect(screen.queryByText(/Error loading wishlist/) || screen.queryByText('Your wishlist is empty')).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    // Reset auth context
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = mockUser;
  });
});