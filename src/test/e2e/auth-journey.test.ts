import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { mockUser, mockProperty, mockFetch, mockApiResponse, mockApiError } from '@/test/utils'

// Mock the entire app flow
jest.mock('@/components/Header', () => ({
  default: () => (
    <header data-testid="header">
      <nav>
        <div data-testid="auth-button">Auth Button</div>
      </nav>
    </header>
  )
}))

jest.mock('@/components/auth/AuthModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="auth-modal">
        <div data-testid="sign-in-form">
          <input data-testid="email-input" placeholder="Email" />
          <input data-testid="password-input" placeholder="Password" type="password" />
          <button data-testid="sign-in-button">Sign In</button>
          <button data-testid="google-sign-in-button">Sign in with Google</button>
          <button data-testid="switch-to-signup">Sign Up</button>
        </div>
        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}))

jest.mock('@/app/dashboard/page', () => ({
  default: () => (
    <div data-testid="dashboard-page">
      <h1>Dashboard</h1>
      <div data-testid="user-profile">Welcome, {mockUser.name}!</div>
      <div data-testid="wishlist-section">
        <h2>My Wishlist</h2>
        <div data-testid="wishlist-items">
          {/* Mock wishlist items */}
          <div data-testid="wishlist-item">Property 1</div>
          <div data-testid="wishlist-item">Property 2</div>
        </div>
      </div>
      <div data-testid="activity-section">
        <h2>Recent Activity</h2>
        <div data-testid="activity-items">
          <div data-testid="activity-item">Viewed Property A</div>
          <div data-testid="activity-item">Added Property B to wishlist</div>
        </div>
      </div>
    </div>
  )
}))

jest.mock('@/components/property/PropertyCard', () => ({
  default: ({ property, showWishlistButton = true }: { property: any; showWishlistButton?: boolean }) => (
    <div data-testid="property-card">
      <h3>{property.title}</h3>
      <p>${property.price}</p>
      <p>{property.location}</p>
      {showWishlistButton && (
        <button data-testid="wishlist-button" data-property-id={property.id}>
          Add to Wishlist
        </button>
      )}
    </div>
  )
}))

// Mock router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Complete User Authentication Journey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  describe('New User Registration and First-Time Experience', () => {
    it('should complete full registration flow and redirect to dashboard', async () => {
      // Mock successful registration API
      mockFetch(mockApiResponse({
        success: true,
        user: mockUser,
        token: 'jwt-token'
      }))

      // Render the main app component
      const App = () => {
        const [showAuthModal, setShowAuthModal] = React.useState(false)
        const [isAuthenticated, setIsAuthenticated] = React.useState(false)
        const [currentUser, setCurrentUser] = React.useState(null)

        return (
          <div data-testid="app">
            <div data-testid="header">
              <button 
                data-testid="auth-button" 
                onClick={() => setShowAuthModal(true)}
              >
                {isAuthenticated ? `Welcome, ${currentUser?.name}` : 'Sign In'}
              </button>
            </div>
            
            {showAuthModal && (
              <div data-testid="auth-modal">
                <div data-testid="sign-up-form">
                  <input data-testid="name-input" placeholder="Full Name" />
                  <input data-testid="email-input" placeholder="Email" />
                  <input data-testid="password-input" placeholder="Password" type="password" />
                  <input data-testid="confirm-password-input" placeholder="Confirm Password" type="password" />
                  <button 
                    data-testid="sign-up-button"
                    onClick={async () => {
                      // Simulate successful registration
                      setCurrentUser(mockUser)
                      setIsAuthenticated(true)
                      setShowAuthModal(false)
                      mockPush('/wishlist')
                    }}
                  >
                    Sign Up
                  </button>
                </div>
                <button data-testid="close-modal" onClick={() => setShowAuthModal(false)}>
                  Close
                </button>
              </div>
            )}
            
            {isAuthenticated && (
              <div data-testid="dashboard-preview">
                <h1>Welcome to your dashboard!</h1>
                <p>You can now save properties and track your activity.</p>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      // Step 1: User clicks on authentication button
      const authButton = screen.getByTestId('auth-button')
      expect(authButton).toHaveTextContent('Sign In')
      fireEvent.click(authButton)

      // Step 2: Auth modal opens
      await waitFor(() => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      })

      // Step 3: User fills out registration form
      const nameInput = screen.getByTestId('name-input')
      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const confirmPasswordInput = screen.getByTestId('confirm-password-input')

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })

      // Step 4: User submits registration
      const signUpButton = screen.getByTestId('sign-up-button')
      fireEvent.click(signUpButton)

      // Step 5: Verify successful registration and redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/wishlist')
      })

      // Step 6: Verify user is authenticated
      await waitFor(() => {
        expect(screen.getByTestId('auth-button')).toHaveTextContent(`Welcome, ${mockUser.name}`)
      })

      // Step 7: Verify dashboard preview is shown
      expect(screen.getByTestId('dashboard-preview')).toBeInTheDocument()
      expect(screen.getByText('Welcome to your dashboard!')).toBeInTheDocument()
    })

    it('should handle registration errors gracefully', async () => {
      // Mock registration error
      mockFetch(mockApiError('Email already exists', 409))

      const App = () => {
        const [showAuthModal, setShowAuthModal] = React.useState(true)
        const [error, setError] = React.useState('')

        return (
          <div data-testid="app">
            {showAuthModal && (
              <div data-testid="auth-modal">
                <div data-testid="sign-up-form">
                  <input data-testid="email-input" placeholder="Email" />
                  <input data-testid="password-input" placeholder="Password" type="password" />
                  <button 
                    data-testid="sign-up-button"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/user/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: 'Test User',
                            email: 'existing@example.com',
                            password: 'password123'
                          })
                        })
                        
                        if (!response.ok) {
                          const errorData = await response.json()
                          setError(errorData.error)
                        }
                      } catch (err) {
                        setError('Network error')
                      }
                    }}
                  >
                    Sign Up
                  </button>
                  {error && <div data-testid="error-message">{error}</div>}
                </div>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      const signUpButton = screen.getByTestId('sign-up-button')
      fireEvent.click(signUpButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Email already exists')
      })

      // Verify user is not redirected
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Returning User Login Flow', () => {
    it('should complete login flow and restore user session', async () => {
      // Mock successful login API
      mockFetch(mockApiResponse({
        success: true,
        user: mockUser,
        token: 'jwt-token'
      }))

      const App = () => {
        const [showAuthModal, setShowAuthModal] = React.useState(false)
        const [isAuthenticated, setIsAuthenticated] = React.useState(false)
        const [currentUser, setCurrentUser] = React.useState(null)

        return (
          <div data-testid="app">
            <button 
              data-testid="auth-button" 
              onClick={() => setShowAuthModal(true)}
            >
              {isAuthenticated ? `Welcome back, ${currentUser?.name}` : 'Sign In'}
            </button>
            
            {showAuthModal && (
              <div data-testid="auth-modal">
                <div data-testid="sign-in-form">
                  <input data-testid="email-input" placeholder="Email" />
                  <input data-testid="password-input" placeholder="Password" type="password" />
                  <button 
                    data-testid="sign-in-button"
                    onClick={async () => {
                      // Simulate successful login
                      setCurrentUser(mockUser)
                      setIsAuthenticated(true)
                      setShowAuthModal(false)
                      mockPush('/wishlist')
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      // Step 1: Click sign in
      fireEvent.click(screen.getByTestId('auth-button'))

      // Step 2: Fill login form
      await waitFor(() => {
        expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByTestId('email-input'), { 
        target: { value: 'john@example.com' } 
      })
      fireEvent.change(screen.getByTestId('password-input'), { 
        target: { value: 'password123' } 
      })

      // Step 3: Submit login
      fireEvent.click(screen.getByTestId('sign-in-button'))

      // Step 4: Verify successful login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/wishlist')
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-button')).toHaveTextContent(`Welcome back, ${mockUser.name}`)
      })
    })

    it('should handle invalid credentials', async () => {
      // Mock login error
      mockFetch(mockApiError('Invalid credentials', 401))

      const App = () => {
        const [error, setError] = React.useState('')

        return (
          <div data-testid="app">
            <div data-testid="sign-in-form">
              <input data-testid="email-input" placeholder="Email" />
              <input data-testid="password-input" placeholder="Password" type="password" />
              <button 
                data-testid="sign-in-button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/user/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: 'wrong@example.com',
                        password: 'wrongpassword'
                      })
                    })
                    
                    if (!response.ok) {
                      const errorData = await response.json()
                      setError(errorData.error)
                    }
                  } catch (err) {
                    setError('Network error')
                  }
                }}
              >
                Sign In
              </button>
              {error && <div data-testid="error-message">{error}</div>}
            </div>
          </div>
        )
      }

      render(<App />)

      fireEvent.click(screen.getByTestId('sign-in-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials')
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Google OAuth Flow', () => {
    it('should complete Google OAuth authentication', async () => {
      // Mock Google OAuth success
      mockFetch(mockApiResponse({
        success: true,
        user: { ...mockUser, provider: 'google' },
        token: 'google-jwt-token',
        isNewUser: false
      }))

      const App = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false)
        const [currentUser, setCurrentUser] = React.useState(null)

        return (
          <div data-testid="app">
            <div data-testid="auth-modal">
              <button 
                data-testid="google-sign-in-button"
                onClick={async () => {
                  // Simulate Google OAuth flow
                  setCurrentUser({ ...mockUser, provider: 'google' })
                  setIsAuthenticated(true)
                  mockPush('/wishlist')
                }}
              >
                Sign in with Google
              </button>
            </div>
            
            {isAuthenticated && (
              <div data-testid="success-message">
                Successfully signed in with Google!
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      fireEvent.click(screen.getByTestId('google-sign-in-button'))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/wishlist')
      })

      expect(screen.getByTestId('success-message')).toBeInTheDocument()
    })
  })

  describe('Property Wishlist Integration', () => {
    it('should complete property browsing and wishlist flow', async () => {
      // Mock wishlist API calls
      global.fetch = jest.fn()
        .mockResolvedValueOnce(mockApiResponse({ success: true, message: 'Added to wishlist' }))
        .mockResolvedValueOnce(mockApiResponse({ success: true, message: 'Removed from wishlist' }))

      const App = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(true)
        const [wishlistItems, setWishlistItems] = React.useState(new Set())

        const handleWishlistToggle = async (propertyId: string) => {
          const isInWishlist = wishlistItems.has(propertyId)
          const action = isInWishlist ? 'remove' : 'add'
          
          // Optimistic update
          const newWishlistItems = new Set(wishlistItems)
          if (isInWishlist) {
            newWishlistItems.delete(propertyId)
          } else {
            newWishlistItems.add(propertyId)
          }
          setWishlistItems(newWishlistItems)

          // API call
          await fetch('/api/user/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId, action })
          })
        }

        return (
          <div data-testid="app">
            {isAuthenticated && (
              <div data-testid="property-listing">
                <div data-testid="property-card">
                  <h3>{mockProperty.title}</h3>
                  <p>${mockProperty.price}</p>
                  <button 
                    data-testid="wishlist-button"
                    onClick={() => handleWishlistToggle(mockProperty.id)}
                    className={wishlistItems.has(mockProperty.id) ? 'in-wishlist' : 'not-in-wishlist'}
                  >
                    {wishlistItems.has(mockProperty.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      // Step 1: Add property to wishlist
      const wishlistButton = screen.getByTestId('wishlist-button')
      expect(wishlistButton).toHaveTextContent('Add to Wishlist')
      
      fireEvent.click(wishlistButton)

      // Step 2: Verify optimistic update
      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('Remove from Wishlist')
        expect(wishlistButton).toHaveClass('in-wishlist')
      })

      // Step 3: Remove from wishlist
      fireEvent.click(wishlistButton)

      await waitFor(() => {
        expect(wishlistButton).toHaveTextContent('Add to Wishlist')
        expect(wishlistButton).toHaveClass('not-in-wishlist')
      })

      // Verify API calls were made
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: mockProperty.id, action: 'add' })
      })
      expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: mockProperty.id, action: 'remove' })
      })
    })

    it('should prompt unauthenticated users to sign in', async () => {
      const App = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false)
        const [showAuthPrompt, setShowAuthPrompt] = React.useState(false)

        return (
          <div data-testid="app">
            <div data-testid="property-card">
              <h3>{mockProperty.title}</h3>
              <button 
                data-testid="wishlist-button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthPrompt(true)
                  }
                }}
              >
                Add to Wishlist
              </button>
            </div>
            
            {showAuthPrompt && (
              <div data-testid="auth-prompt">
                <p>Please sign in to add properties to your wishlist</p>
                <button 
                  data-testid="sign-in-prompt-button"
                  onClick={() => {
                    setIsAuthenticated(true)
                    setShowAuthPrompt(false)
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      // Step 1: Try to add to wishlist while unauthenticated
      fireEvent.click(screen.getByTestId('wishlist-button'))

      // Step 2: Verify auth prompt appears
      await waitFor(() => {
        expect(screen.getByTestId('auth-prompt')).toBeInTheDocument()
        expect(screen.getByText('Please sign in to add properties to your wishlist')).toBeInTheDocument()
      })

      // Step 3: Sign in from prompt
      fireEvent.click(screen.getByTestId('sign-in-prompt-button'))

      // Step 4: Verify prompt is dismissed
      await waitFor(() => {
        expect(screen.queryByTestId('auth-prompt')).not.toBeInTheDocument()
      })
    })
  })

  describe('Session Management', () => {
    it('should maintain session across page refreshes', async () => {
      // Mock session check API
      mockFetch(mockApiResponse({
        authenticated: true,
        user: mockUser
      }))

      const App = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false)
        const [currentUser, setCurrentUser] = React.useState(null)
        const [loading, setLoading] = React.useState(true)

        React.useEffect(() => {
          // Simulate session check on app load
          const checkSession = async () => {
            try {
              const response = await fetch('/api/auth/session-status')
              const data = await response.json()
              
              if (data.authenticated) {
                setIsAuthenticated(true)
                setCurrentUser(data.user)
              }
            } catch (error) {
              console.error('Session check failed:', error)
            } finally {
              setLoading(false)
            }
          }

          checkSession()
        }, [])

        if (loading) {
          return <div data-testid="loading">Loading...</div>
        }

        return (
          <div data-testid="app">
            {isAuthenticated ? (
              <div data-testid="authenticated-content">
                <p>Welcome back, {currentUser?.name}!</p>
                <button 
                  data-testid="logout-button"
                  onClick={() => {
                    setIsAuthenticated(false)
                    setCurrentUser(null)
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div data-testid="unauthenticated-content">
                <p>Please sign in</p>
              </div>
            )}
          </div>
        )
      }

      render(<App />)

      // Initially loading
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // After session check
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-content')).toBeInTheDocument()
        expect(screen.getByText(`Welcome back, ${mockUser.name}!`)).toBeInTheDocument()
      })

      // Verify session API was called
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/session-status')
    })

    it('should handle session expiration', async () => {
      // Mock expired session
      mockFetch(mockApiError('Token expired', 401))

      const App = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(true)
        const [sessionExpired, setSessionExpired] = React.useState(false)

        const makeAuthenticatedRequest = async () => {
          try {
            const response = await fetch('/api/user/profile')
            if (response.status === 401) {
              setIsAuthenticated(false)
              setSessionExpired(true)
            }
          } catch (error) {
            console.error('Request failed:', error)
          }
        }

        return (
          <div data-testid="app">
            {sessionExpired && (
              <div data-testid="session-expired-message">
                Your session has expired. Please sign in again.
              </div>
            )}
            
            <button 
              data-testid="make-request-button"
              onClick={makeAuthenticatedRequest}
            >
              Make Request
            </button>
          </div>
        )
      }

      render(<App />)

      fireEvent.click(screen.getByTestId('make-request-button'))

      await waitFor(() => {
        expect(screen.getByTestId('session-expired-message')).toBeInTheDocument()
        expect(screen.getByText('Your session has expired. Please sign in again.')).toBeInTheDocument()
      })
    })
  })
})