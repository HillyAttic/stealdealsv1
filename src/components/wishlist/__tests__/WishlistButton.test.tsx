import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import WishlistButton from '../WishlistButton'
import { mockUser, mockProperty, mockToast } from '@/test/utils'

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: mockToast
}))

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: vi.fn()
}))

// Mock fetch for API calls
global.fetch = vi.fn()

describe('WishlistButton', () => {
  const mockAuthContext = {
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockClear()
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
  })

  it('should render wishlist button for unauthenticated user', () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    expect(button).toBeInTheDocument()
    
    // Should show empty heart icon
    const heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-gray-400')
  })

  it('should show auth prompt when unauthenticated user clicks button', async () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-prompt')).toBeInTheDocument()
    })
  })

  it('should add property to wishlist for authenticated user', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock successful API call
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Property added to wishlist',
        item: {
          id: 'wishlist-123',
          userId: mockUser.id,
          propertyId: mockProperty.id,
          addedAt: new Date(),
          priority: 'medium'
        }
      })
    } as Response)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: mockProperty.id,
          action: 'add'
        })
      })
    })
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Property added to wishlist')
    })
    
    // Button should now show filled heart
    const heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-red-500')
  })

  it('should remove property from wishlist', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock successful API call
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Property removed from wishlist'
      })
    } as Response)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={true}
      />
    )
    
    const button = screen.getByRole('button', { name: /remove from wishlist/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: mockProperty.id,
          action: 'remove'
        })
      })
    })
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Property removed from wishlist')
    })
    
    // Button should now show empty heart
    const heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-gray-400')
  })

  it('should show loading state during API call', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock delayed API call
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('should handle API errors gracefully', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock API error
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Property already in wishlist'
      })
    } as Response)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Property already in wishlist')
    })
    
    // State should remain unchanged
    const heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-gray-400')
  })

  it('should handle network errors', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock network error
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.'
      )
    })
  })

  it('should use optimistic updates', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock delayed successful API call
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Property added to wishlist'
          })
        } as Response), 100)
      )
    )

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    // Should immediately show filled heart (optimistic update)
    const heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-red-500')
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Property added to wishlist')
    })
  })

  it('should revert optimistic update on API failure', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock API failure
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Failed to add to wishlist'
      })
    } as Response)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(button)
    
    // Should immediately show filled heart (optimistic update)
    let heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-red-500')
    
    // Wait for API call to fail and revert
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to add to wishlist')
    })
    
    // Should revert to empty heart
    heartIcon = screen.getByTestId('heart-icon')
    expect(heartIcon).toHaveClass('text-gray-400')
  })

  it('should support custom size prop', () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
        size="large"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-3') // Large size class
  })

  it('should support custom className', () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
        className="custom-wishlist-button"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-wishlist-button')
  })

  it('should be disabled when disabled prop is true', () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
        disabled={true}
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should handle rapid clicks gracefully', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true

    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    // Mock successful API call
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Property added to wishlist'
      })
    } as Response)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
      />
    )
    
    const button = screen.getByRole('button', { name: /add to wishlist/i })
    
    // Click multiple times rapidly
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    // Should only make one API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('should show tooltip on hover', async () => {
    const { useAuth } = require('@/components/auth/AuthProvider')
    vi.mocked(useAuth).mockReturnValue(mockAuthContext)

    render(
      <WishlistButton 
        propertyId={mockProperty.id}
        initialIsInWishlist={false}
        showTooltip={true}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    
    await waitFor(() => {
      expect(screen.getByText('Add to wishlist')).toBeInTheDocument()
    })
  })
})