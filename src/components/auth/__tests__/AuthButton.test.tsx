import React from 'react'
import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import AuthButton from '../AuthButton'
import { mockUser } from '@/test/utils'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false
}

jest.mock('../AuthProvider', () => ({
  useAuthContext: () => mockAuthContext
}))

// Mock the AuthModal
jest.mock('../AuthModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="auth-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  )
}))

describe('AuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockAuthContext.isLoading = false
  })

  it('should render authentication button for unauthenticated user', () => {
    render(<AuthButton />)
    
    const authButton = screen.getByRole('button')
    expect(authButton).toBeInTheDocument()
    
    // Should show the user icon
    const icon = screen.getByAltText('User')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('src', 'https://cdn-icons-png.flaticon.com/512/17468/17468741.png')
  })

  it('should open auth modal when clicked', async () => {
    render(<AuthButton />)
    
    const authButton = screen.getByRole('button')
    fireEvent.click(authButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })
  })

  it('should close auth modal when close button is clicked', async () => {
    render(<AuthButton />)
    
    const authButton = screen.getByRole('button')
    fireEvent.click(authButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByText('Close Modal')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })
  })

  it('should render user dropdown for authenticated user', () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    render(<AuthButton />)
    
    // Should show user name
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    
    // Should show user avatar or user icon
    const avatar = screen.getByAltText('User')
    expect(avatar).toBeInTheDocument()
  })

  it('should show dropdown menu when authenticated user clicks button', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    render(<AuthButton />)
    
    const userButton = screen.getByRole('button')
    fireEvent.click(userButton)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })

  it('should call logout when logout is clicked', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    render(<AuthButton />)
    
    const userButton = screen.getByRole('button')
    fireEvent.click(userButton)
    
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
    
    const logoutButton = screen.getByText('Sign Out')
    fireEvent.click(logoutButton)
    
    expect(mockAuthContext.logout).toHaveBeenCalled()
  })

  it('should show loading state', () => {
    mockAuthContext.isLoading = true
    
    render(<AuthButton />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should navigate to dashboard when dashboard link is clicked', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    // Mock window.location.href
    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })
    
    render(<AuthButton />)
    
    const userButton = screen.getByRole('button')
    fireEvent.click(userButton)
    
    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument()
    })
    
    const wishlistLink = screen.getByText('My Wishlist')
    fireEvent.click(wishlistLink)
    
    expect(mockLocation.href).toBe('/wishlist')
  })

  it('should close dropdown when clicking outside', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    render(<AuthButton />)
    
    const userButton = screen.getByRole('button')
    fireEvent.click(userButton)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    
    // Click outside the dropdown
    fireEvent.click(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isAuthenticated = true
    
    render(<AuthButton />)
    
    const userButton = screen.getByRole('button')
    
    // Open dropdown with Enter key
    fireEvent.keyDown(userButton, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    
    // Close dropdown with Escape key
    fireEvent.keyDown(userButton, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })
})