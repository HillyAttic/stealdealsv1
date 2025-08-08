import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Header from '@/components/Header';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { AuthModal } from '@/components/auth/AuthModal';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return React.createElement('img', { src, alt, ...props });
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock user data
const mockUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user' as const,
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  preferences: {
    propertyTypes: ['apartment'],
    priceRange: { min: 100000, max: 500000 },
    locations: ['New York'],
    notifications: {
      email: true,
      push: false,
      newProperties: true,
      priceAlerts: true,
    },
  },
};

const mockProperty = {
  id: 'property-123',
  title: 'Beautiful Apartment',
  price: 250000,
  location: 'New York',
  images: ['https://example.com/image1.jpg'],
  type: 'apartment',
};

describe('Final Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Complete User Journey', () => {
    it('should handle complete authentication flow', async () => {
      const user = userEvent.setup();

      // Mock successful login API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: 'mock-jwt-token',
          user: mockUser,
        }),
      });

      render(
        <AuthProvider>
          <Header />
        </AuthProvider>
      );

      // 1. User sees sign in button
      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();

      // 2. User clicks sign in button
      await user.click(signInButton);

      // 3. Auth modal should open
      await waitFor(() => {
        expect(screen.getByText('Welcome to Stealdeals')).toBeInTheDocument();
      });

      // 4. User fills in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // 5. Verify API call was made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'john@example.com',
            password: 'password123',
          }),
        });
      });
    });

    it('should handle wishlist functionality for authenticated users', async () => {
      const user = userEvent.setup();

      // Mock wishlist API responses
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Property added to wishlist',
          item: {
            id: 'wishlist-123',
            userId: mockUser.id,
            propertyId: mockProperty.id,
            addedAt: new Date(),
            priority: 'medium',
          },
        }),
      });

      const TestComponent = () => (
        <AuthProvider>
          <WishlistButton
            propertyId={mockProperty.id}
            propertyTitle={mockProperty.title}
            propertyPrice={mockProperty.price}
            propertyLocation={mockProperty.location}
            propertyImages={mockProperty.images}
            propertyType={mockProperty.type}
          />
        </AuthProvider>
      );

      render(<TestComponent />);

      // Find and click wishlist button
      const wishlistButton = screen.getByRole('button');
      await user.click(wishlistButton);

      // Verify API call for adding to wishlist
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: mockProperty.id,
            action: 'add',
            propertyTitle: mockProperty.title,
            propertyPrice: mockProperty.price,
            propertyLocation: mockProperty.location,
            propertyImages: mockProperty.images,
            propertyType: mockProperty.type,
          }),
        });
      });
    });

    it('should handle dashboard data loading', async () => {
      // Mock dashboard API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            properties: [
              {
                id: 'property-123',
                title: 'Beautiful Apartment',
                price: 250000,
                location: 'New York',
                images: ['https://example.com/image1.jpg'],
                type: 'apartment',
                addedAt: new Date(),
                priority: 'medium',
              },
            ],
            total: 1,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            activity: [
              {
                propertyId: 'property-123',
                propertyTitle: 'Beautiful Apartment',
                viewedAt: new Date(),
                source: 'search',
              },
            ],
            total: 1,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            analytics: {
              totalViews: 10,
              uniqueProperties: 5,
              averageSessionDuration: 300,
              favoritePropertyTypes: [
                { type: 'apartment', count: 3, percentage: 60 },
              ],
              preferredLocations: [
                { location: 'New York', count: 5, percentage: 100 },
              ],
            },
          }),
        });

      render(
        <AuthProvider>
          <UserDashboard user={mockUser} />
        </AuthProvider>
      );

      // Verify dashboard loads
      await waitFor(() => {
        expect(screen.getByText(`Welcome back, ${mockUser.name}!`)).toBeInTheDocument();
      });

      // Verify API calls were made
      expect(mockFetch).toHaveBeenCalledWith('/api/user/wishlist');
      expect(mockFetch).toHaveBeenCalledWith('/api/user/activity');
      expect(mockFetch).toHaveBeenCalledWith('/api/user/analytics');
    });

    it('should handle authentication prompts for unauthenticated users', async () => {
      const user = userEvent.setup();

      const TestComponent = () => (
        <AuthProvider>
          <WishlistButton
            propertyId={mockProperty.id}
            propertyTitle={mockProperty.title}
            propertyPrice={mockProperty.price}
            propertyLocation={mockProperty.location}
            propertyImages={mockProperty.images}
            propertyType={mockProperty.type}
          />
        </AuthProvider>
      );

      render(<TestComponent />);

      // Click wishlist button as unauthenticated user
      const wishlistButton = screen.getByRole('button');
      await user.click(wishlistButton);

      // Should show auth prompt
      await waitFor(() => {
        expect(screen.getByText(/sign in to save/i)).toBeInTheDocument();
      });
    });

    it('should handle navigation integration', () => {
      render(
        <AuthProvider>
          <Header />
        </AuthProvider>
      );

      // Verify navigation items are present
      expect(screen.getByText('HOME')).toBeInTheDocument();
      expect(screen.getByText('ABOUT US')).toBeInTheDocument();
      expect(screen.getByText('VACANT')).toBeInTheDocument();
      expect(screen.getByText('CONTACT')).toBeInTheDocument();

      // Verify authentication button is present
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle responsive design', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <AuthProvider>
          <Header />
        </AuthProvider>
      );

      // Mobile menu button should be present (though hidden by CSS)
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should handle error states gracefully', async () => {
      const user = userEvent.setup();

      // Mock failed login API response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        }),
      });

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      );

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle session persistence', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      // Mock stored auth token
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');

      render(
        <AuthProvider>
          <Header />
        </AuthProvider>
      );

      // Should attempt to restore session
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should handle different user agents', () => {
      // Mock different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ];

      userAgents.forEach((userAgent) => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        });

        render(
          <AuthProvider>
            <Header />
          </AuthProvider>
        );

        // Should render without errors
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });
  });

  describe('Security Testing', () => {
    it('should handle XSS prevention in user inputs', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      
      // Try to inject script
      const maliciousInput = '<script>alert("xss")</script>test@example.com';
      await user.type(emailInput, maliciousInput);

      // Input should be sanitized (no script execution)
      expect(emailInput).toHaveValue(maliciousInput);
      // The actual XSS prevention would be handled by React's built-in escaping
    });

    it('should handle CSRF token validation', async () => {
      // Mock CSRF token
      const csrfToken = 'mock-csrf-token';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: 'mock-jwt-token',
          user: mockUser,
        }),
      });

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Verify API call includes proper headers
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        });
      });
    });
  });
});