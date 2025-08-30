import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  database: {},
  auth: {}
}));

jest.mock('@/lib/database/wishlist', () => ({
  addToWishlist: jest.fn().mockResolvedValue(true),
  removeFromWishlist: jest.fn().mockResolvedValue(true),
  getRawWishlistItems: jest.fn().mockResolvedValue([]),
  getUserWishlistRef: jest.fn().mockReturnValue({})
}));

jest.mock('firebase/database', () => ({
  onValue: jest.fn(),
  off: jest.fn()
}));

jest.mock('@/lib/activity-tracker', () => ({
  trackWishlistAdd: jest.fn(),
  trackWishlistRemove: jest.fn()
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-id'
  }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User'
    }
  })
}));

describe('Wishlist Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render wishlist button with proper state management', async () => {
    render(
      <AuthProvider>
        <WishlistProvider>
          <WishlistButton propertyId="test-property-1" showText />
        </WishlistProvider>
      </AuthProvider>
    );

    // Should render the button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Should show "Save" text initially
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should handle wishlist toggle with loading states', async () => {
    render(
      <AuthProvider>
        <WishlistProvider>
          <WishlistButton propertyId="test-property-2" showText />
        </WishlistProvider>
      </AuthProvider>
    );

    const button = screen.getByRole('button');
    
    // Click to add to wishlist
    fireEvent.click(button);
    
    // Should show loading state briefly
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});