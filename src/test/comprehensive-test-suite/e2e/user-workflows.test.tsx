import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

// Mock all external dependencies
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

jest.mock('@/lib/database/wishlist', () => ({
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  getRawWishlistItems: jest.fn(),
  getUserWishlistRef: jest.fn(),
  getUserWishlist: jest.fn(),
}));

jest.mock('@/lib/database/activity', () => ({
  logUserActivity: jest.fn(),
  getUserActivities: jest.fn(),
  getUserActivityStats: jest.fn(),
}));

// Mock auth context
const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 'test-user-1', email: 'test@example.com' },
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

// Mock WishlistButton component
jest.mock('@/components/wishlist/WishlistButton', () => ({
  WishlistButton: ({ propertyId, showText, onToggle }: any) => {
    const { useWishlistContext } = require('@/contexts/WishlistContext');
    const { isInWishlist, toggleWishlist, isOperationLoading } = useWishlistContext();
    
    const handleClick = async () => {
      const result = await toggleWishlist(propertyId);
      if (onToggle) onToggle(result);
    };

    return (
      <button
        data-testid={`wishlist-button-${propertyId}`}
        onClick={handleClick}
        disabled={isOperationLoading(propertyId)}
        className={isInWishlist(propertyId) ? 'active' : 'inactive'}
      >
        {isOperationLoading(propertyId) ? 'Loading...' : 
         isInWishlist(propertyId) ? '❤️ Remove' : '🤍 Add'}
        {showText && (isInWishlist(propertyId) ? ' Remove from Wishlist' : ' Add to Wishlist')}
      </button>
    );
  }
}));

// Test component that simulates a property listing page
function PropertyListingPage({ propertyId }: { propertyId: string }) {
  const { logActivity } = require('@/contexts/ActivityContext').useActivityContext();
  
  React.useEffect(() => {
    // Simulate property view activity
    logActivity('property_view', propertyId, {
      duration: 0,
      source: 'property_listing'
    });
  }, [propertyId, logActivity]);

  return (
    <div data-testid="property-listing">
      <h1>Property {propertyId}</h1>
      <div data-testid="property-details">
        <p>Price: $100,000</p>
        <p>Location: Test Location</p>
        <p>Type: Apartment</p>
      </div>
      <WishlistButton propertyId={propertyId} showText />
    </div>
  );
}

// Test component that simulates a search page
function SearchPage() {
  const { logActivity } = require('@/contexts/ActivityContext').useActivityContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<string[]>([]);

  const handleSearch = async () => {
    await logActivity('search', undefined, {
      query: searchQuery,
      filters: { type: 'apartment' },
      source: 'search_page'
    });
    
    // Simulate search results
    setSearchResults(['property-1', 'property-2', 'property-3']);
  };

  return (
    <div data-testid="search-page">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search properties..."
      />
      <button data-testid="search-button" onClick={handleSearch}>
        Search
      </button>
      <div data-testid="search-results">
        {searchResults.map(propertyId => (
          <div key={propertyId} data-testid={`search-result-${propertyId}`}>
            <h3>Property {propertyId}</h3>
            <WishlistButton propertyId={propertyId} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Test component that simulates a wishlist page
function WishlistPage() {
  const { wishlistItems, wishlistCount } = require('@/contexts/WishlistContext').useWishlistContext();
  
  return (
    <div data-testid="wishlist-page">
      <h1>My Wishlist ({wishlistCount})</h1>
      <div data-testid="wishlist-items">
        {Array.from(wishlistItems).map(propertyId => (
          <div key={propertyId} data-testid={`wishlist-item-${propertyId}`}>
            <h3>Property {propertyId}</h3>
            <WishlistButton propertyId={propertyId} showText />
          </div>
        ))}
      </div>
      {wishlistCount === 0 && (
        <p data-testid="empty-wishlist">Your wishlist is empty</p>
      )}
    </div>
  );
}

// Test wrapper component
function TestApp({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ActivityProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { totalSessions: 0, averageSessionDuration: 0, pagesPerSession: 0, bounceRate: 0 }
        })
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Property Discovery and Wishlist Workflow', () => {
    it('should complete full property discovery to wishlist workflow', async () => {
      const user = userEvent.setup();
      const { addToWishlist } = await import('@/lib/database/wishlist');
      const { logUserActivity } = await import('@/lib/database/activity');
      
      jest.mocked(addToWishlist).mockResolvedValue(true);
      jest.mocked(logUserActivity).mockResolvedValue({
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'property_view',
        timestamp: new Date()
      });

      // Mock additional fetch calls for activity logging and broadcasting
      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <SearchPage />
        </TestApp>
      );

      // Step 1: User searches for properties
      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.type(searchInput, 'apartment near downtown');
      await user.click(searchButton);

      // Verify search results appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
        expect(screen.getByTestId('search-result-property-1')).toBeInTheDocument();
      });

      // Step 2: User adds property to wishlist from search results
      const wishlistButton = screen.getByTestId('wishlist-button-property-1');
      expect(wishlistButton).toHaveTextContent('🤍 Add');

      await user.click(wishlistButton);

      // Verify wishlist button state changes
      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('❤️ Remove');
        expect(wishlistButton).toHaveClass('active');
      }, { timeout: 6000 });

      // Step 3: User navigates to property details
      rerender(
        <TestApp>
          <PropertyListingPage propertyId="property-1" />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByTestId('property-listing')).toBeInTheDocument();
      });

      // Verify property is already in wishlist
      const propertyWishlistButton = screen.getByTestId('wishlist-button-property-1');
      expect(propertyWishlistButton).toHaveTextContent('❤️ Remove');

      // Step 4: User navigates to wishlist page
      rerender(
        <TestApp>
          <WishlistPage />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-page')).toBeInTheDocument();
        expect(screen.getByText('My Wishlist (1)')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-item-property-1')).toBeInTheDocument();
      });

      // Verify API calls were made
      expect(addToWishlist).toHaveBeenCalledWith('test-user-1', 'property-1');
      expect(logUserActivity).toHaveBeenCalledWith(
        'test-user-1',
        'search',
        undefined,
        expect.objectContaining({
          query: 'apartment near downtown',
          filters: { type: 'apartment' }
        }),
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should handle wishlist removal workflow', async () => {
      const user = userEvent.setup();
      const { addToWishlist, removeFromWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(addToWishlist).mockResolvedValue(true);
      jest.mocked(removeFromWishlist).mockResolvedValue(true);

      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <PropertyListingPage propertyId="property-2" />
        </TestApp>
      );

      // Step 1: Add property to wishlist
      const wishlistButton = screen.getByTestId('wishlist-button-property-2');
      await user.click(wishlistButton);

      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('❤️ Remove');
      }, { timeout: 6000 });

      // Step 2: Navigate to wishlist page
      rerender(
        <TestApp>
          <WishlistPage />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (1)')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-item-property-2')).toBeInTheDocument();
      });

      // Step 3: Remove property from wishlist
      const removeButton = screen.getByTestId('wishlist-button-property-2');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (0)')).toBeInTheDocument();
        expect(screen.getByTestId('empty-wishlist')).toBeInTheDocument();
      }, { timeout: 6000 });

      // Verify API calls
      expect(addToWishlist).toHaveBeenCalledWith('test-user-1', 'property-2');
      expect(removeFromWishlist).toHaveBeenCalledWith('test-user-1', 'property-2');
    });
  });

  describe('Multi-Property Wishlist Management', () => {
    it('should handle adding multiple properties to wishlist', async () => {
      const user = userEvent.setup();
      const { addToWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(addToWishlist).mockResolvedValue(true);

      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <SearchPage />
        </TestApp>
      );

      // Trigger search to show results
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Add multiple properties to wishlist
      const properties = ['property-1', 'property-2', 'property-3'];
      
      for (const propertyId of properties) {
        const button = screen.getByTestId(`wishlist-button-${propertyId}`);
        await user.click(button);
        
        await waitFor(() => {
          expect(button).toHaveTextContent('❤️ Remove');
        }, { timeout: 6000 });
      }

      // Navigate to wishlist page
      rerender(
        <TestApp>
          <WishlistPage />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (3)')).toBeInTheDocument();
        properties.forEach(propertyId => {
          expect(screen.getByTestId(`wishlist-item-${propertyId}`)).toBeInTheDocument();
        });
      });

      // Verify all API calls were made
      properties.forEach(propertyId => {
        expect(addToWishlist).toHaveBeenCalledWith('test-user-1', propertyId);
      });
    });

    it('should handle selective removal from multi-item wishlist', async () => {
      const user = userEvent.setup();
      const { addToWishlist, removeFromWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(addToWishlist).mockResolvedValue(true);
      jest.mocked(removeFromWishlist).mockResolvedValue(true);

      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <SearchPage />
        </TestApp>
      );

      // Add multiple properties
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const properties = ['property-1', 'property-2', 'property-3'];
      
      for (const propertyId of properties) {
        const button = screen.getByTestId(`wishlist-button-${propertyId}`);
        await user.click(button);
        await waitFor(() => {
          expect(button).toHaveTextContent('❤️ Remove');
        }, { timeout: 6000 });
      }

      // Navigate to wishlist and remove middle item
      rerender(
        <TestApp>
          <WishlistPage />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (3)')).toBeInTheDocument();
      });

      // Remove property-2
      const removeButton = screen.getByTestId('wishlist-button-property-2');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (2)')).toBeInTheDocument();
        expect(screen.queryByTestId('wishlist-item-property-2')).not.toBeInTheDocument();
        expect(screen.getByTestId('wishlist-item-property-1')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-item-property-3')).toBeInTheDocument();
      }, { timeout: 6000 });

      expect(removeFromWishlist).toHaveBeenCalledWith('test-user-1', 'property-2');
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const { addToWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(addToWishlist).mockRejectedValue(new Error('Network error'));

      global.fetch = jest.fn()
        .mockRejectedValue(new Error('Network error'));

      render(
        <TestApp>
          <PropertyListingPage propertyId="property-1" />
        </TestApp>
      );

      const wishlistButton = screen.getByTestId('wishlist-button-property-1');
      await user.click(wishlistButton);

      // Should show loading state briefly, then revert
      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('🤍 Add');
        expect(wishlistButton).toHaveClass('inactive');
      }, { timeout: 6000 });

      // Error should be handled gracefully without crashing
      expect(screen.getByTestId('property-listing')).toBeInTheDocument();
    });

    it('should handle concurrent operations correctly', async () => {
      const user = userEvent.setup();
      const { addToWishlist } = await import('@/lib/database/wishlist');
      
      // Simulate slow network response
      jest.mocked(addToWishlist).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 1000))
      );

      global.fetch = jest.fn()
        .mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          }), 1000))
        );

      render(
        <TestApp>
          <PropertyListingPage propertyId="property-1" />
        </TestApp>
      );

      const wishlistButton = screen.getByTestId('wishlist-button-property-1');
      
      // Click multiple times rapidly
      await user.click(wishlistButton);
      await user.click(wishlistButton);
      await user.click(wishlistButton);

      // Should show loading state
      expect(wishlistButton).toHaveTextContent('Loading...');
      expect(wishlistButton).toBeDisabled();

      // Wait for operation to complete
      await waitFor(() => {
        expect(wishlistButton).not.toBeDisabled();
        expect(wishlistButton).not.toHaveTextContent('Loading...');
      }, { timeout: 6000 });

      // Should only make one API call despite multiple clicks
      expect(addToWishlist).toHaveBeenCalledTimes(1);
    });
  });

  describe('Activity Tracking Integration', () => {
    it('should track user journey through property discovery', async () => {
      const user = userEvent.setup();
      const { logUserActivity } = await import('@/lib/database/activity');
      const { addToWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(logUserActivity).mockResolvedValue({
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'search',
        timestamp: new Date()
      });
      jest.mocked(addToWishlist).mockResolvedValue(true);

      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <SearchPage />
        </TestApp>
      );

      // Step 1: Search activity
      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.type(searchInput, 'luxury apartment');
      await user.click(searchButton);

      // Step 2: Property view activity
      rerender(
        <TestApp>
          <PropertyListingPage propertyId="property-1" />
        </TestApp>
      );

      // Step 3: Wishlist activity
      const wishlistButton = screen.getByTestId('wishlist-button-property-1');
      await user.click(wishlistButton);

      // Verify all activities were tracked
      await waitFor(() => {
        expect(logUserActivity).toHaveBeenCalledWith(
          'test-user-1',
          'search',
          undefined,
          expect.objectContaining({
            query: 'luxury apartment'
          }),
          expect.any(String),
          expect.any(String),
          expect.any(String)
        );

        expect(logUserActivity).toHaveBeenCalledWith(
          'test-user-1',
          'property_view',
          'property-1',
          expect.objectContaining({
            source: 'property_listing'
          }),
          expect.any(String),
          expect.any(String),
          expect.any(String)
        );
      }, { timeout: 6000 });
    });
  });

  describe('State Persistence Across Navigation', () => {
    it('should maintain wishlist state across page navigation', async () => {
      const user = userEvent.setup();
      const { addToWishlist } = await import('@/lib/database/wishlist');
      
      jest.mocked(addToWishlist).mockResolvedValue(true);

      global.fetch = jest.fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { rerender } = render(
        <TestApp>
          <PropertyListingPage propertyId="property-1" />
        </TestApp>
      );

      // Add to wishlist
      const wishlistButton = screen.getByTestId('wishlist-button-property-1');
      await user.click(wishlistButton);

      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('❤️ Remove');
      }, { timeout: 6000 });

      // Navigate to search page
      rerender(
        <TestApp>
          <SearchPage />
        </TestApp>
      );

      // Trigger search to show results
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Verify property-1 is still in wishlist
      const searchResultButton = screen.getByTestId('wishlist-button-property-1');
      expect(searchResultButton).toHaveTextContent('❤️ Remove');
      expect(searchResultButton).toHaveClass('active');

      // Navigate to wishlist page
      rerender(
        <TestApp>
          <WishlistPage />
        </TestApp>
      );

      await waitFor(() => {
        expect(screen.getByText('My Wishlist (1)')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-item-property-1')).toBeInTheDocument();
      });
    });
  });
});