import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import UserDashboard from '../UserDashboard'
import { mockUser, mockProperty } from '@/test/utils'

// Mock child components
vi.mock('../WelcomeSection', () => ({
  default: ({ user }: { user: any }) => (
    <div data-testid="welcome-section">Welcome, {user.name}!</div>
  )
}))

vi.mock('../DashboardStats', () => ({
  default: ({ stats }: { stats: any }) => (
    <div data-testid="dashboard-stats">
      <div>Properties viewed: {stats.propertiesViewed}</div>
      <div>Wishlist items: {stats.wishlistItems}</div>
    </div>
  )
}))

vi.mock('../WishlistSection', () => ({
  default: ({ properties }: { properties: any[] }) => (
    <div data-testid="wishlist-section">
      {properties.length > 0 ? (
        properties.map(p => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>No wishlist items</div>
      )}
    </div>
  )
}))

vi.mock('../ActivityHistory', () => ({
  default: ({ activities }: { activities: any[] }) => (
    <div data-testid="activity-history">
      {activities.length > 0 ? (
        activities.map(a => <div key={a.id}>{a.type}</div>)
      ) : (
        <div>No recent activity</div>
      )}
    </div>
  )
}))

vi.mock('../UserAnalytics', () => ({
  default: ({ analytics }: { analytics: any }) => (
    <div data-testid="user-analytics">
      <div>Total views: {analytics.totalViews}</div>
    </div>
  )
}))

vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}))

vi.mock('../ErrorMessage', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  )
}))

// Mock API calls
global.fetch = vi.fn()

describe('UserDashboard', () => {
  const mockDashboardData = {
    stats: {
      propertiesViewed: 15,
      wishlistItems: 5,
      savedSearches: 3,
      recentViews: 8
    },
    wishlist: [
      {
        id: 'wishlist-1',
        propertyId: 'property-1',
        title: 'Beautiful Apartment',
        price: 250000,
        location: 'New York',
        images: ['image1.jpg'],
        type: 'apartment',
        addedAt: new Date(),
        priority: 'high'
      },
      {
        id: 'wishlist-2',
        propertyId: 'property-2',
        title: 'Cozy House',
        price: 350000,
        location: 'Los Angeles',
        images: ['image2.jpg'],
        type: 'house',
        addedAt: new Date(),
        priority: 'medium'
      }
    ],
    recentActivity: [
      {
        id: 'activity-1',
        type: 'property_view',
        propertyId: 'property-1',
        timestamp: new Date(),
        metadata: { source: 'search' }
      },
      {
        id: 'activity-2',
        type: 'wishlist_add',
        propertyId: 'property-2',
        timestamp: new Date(),
        metadata: { priority: 'high' }
      }
    ],
    analytics: {
      totalViews: 45,
      uniqueProperties: 25,
      averageSessionDuration: 180,
      favoritePropertyTypes: [
        { type: 'apartment', count: 15, percentage: 60 },
        { type: 'house', count: 10, percentage: 40 }
      ],
      preferredLocations: [
        { location: 'New York', count: 12, percentage: 48 },
        { location: 'Los Angeles', count: 8, percentage: 32 }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockClear()
  })

  it('should render loading state initially', () => {
    // Mock pending API call
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    render(<UserDashboard user={mockUser} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should render dashboard with user data', async () => {
    // Mock successful API calls
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          stats: mockDashboardData.stats
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: mockDashboardData.wishlist,
          total: mockDashboardData.wishlist.length
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          activities: mockDashboardData.recentActivity
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          analytics: mockDashboardData.analytics
        })
      } as Response)

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
      expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument()
    expect(screen.getByText('Properties viewed: 15')).toBeInTheDocument()
    expect(screen.getByText('Wishlist items: 5')).toBeInTheDocument()
    
    expect(screen.getByTestId('wishlist-section')).toBeInTheDocument()
    expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument()
    expect(screen.getByText('Cozy House')).toBeInTheDocument()
    
    expect(screen.getByTestId('activity-history')).toBeInTheDocument()
    expect(screen.getByText('property_view')).toBeInTheDocument()
    expect(screen.getByText('wishlist_add')).toBeInTheDocument()
    
    expect(screen.getByTestId('user-analytics')).toBeInTheDocument()
    expect(screen.getByText('Total views: 45')).toBeInTheDocument()
  })

  it('should handle empty dashboard data', async () => {
    // Mock API calls returning empty data
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          stats: {
            propertiesViewed: 0,
            wishlistItems: 0,
            savedSearches: 0,
            recentViews: 0
          }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          properties: [],
          total: 0
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          activities: []
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          analytics: {
            totalViews: 0,
            uniqueProperties: 0,
            averageSessionDuration: 0,
            favoritePropertyTypes: [],
            preferredLocations: []
          }
        })
      } as Response)

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Properties viewed: 0')).toBeInTheDocument()
    expect(screen.getByText('Wishlist items: 0')).toBeInTheDocument()
    expect(screen.getByText('No wishlist items')).toBeInTheDocument()
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
    expect(screen.getByText('Total views: 0')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    vi.mocked(global.fetch).mockRejectedValue(new Error('API Error'))

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument()
    })
  })

  it('should handle partial API failures', async () => {
    // Mock some API calls succeeding and others failing
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          stats: mockDashboardData.stats
        })
      } as Response)
      .mockRejectedValueOnce(new Error('Wishlist API Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          activities: mockDashboardData.recentActivity
        })
      } as Response)
      .mockRejectedValueOnce(new Error('Analytics API Error'))

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    })
    
    // Should show successful data
    expect(screen.getByText('Properties viewed: 15')).toBeInTheDocument()
    expect(screen.getByText('property_view')).toBeInTheDocument()
    
    // Should show fallback for failed sections
    expect(screen.getByText('No wishlist items')).toBeInTheDocument()
    expect(screen.getByText('Total views: 0')).toBeInTheDocument()
  })

  it('should refresh data when user changes', async () => {
    const { rerender } = render(<UserDashboard user={mockUser} />)
    
    // Mock initial API calls
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, stats: mockDashboardData.stats })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, properties: [], total: 0 })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, activities: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, analytics: { totalViews: 0 } })
      } as Response)

    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    })

    // Clear previous calls
    vi.mocked(global.fetch).mockClear()

    // Change user
    const newUser = { ...mockUser, id: 'new-user-id', name: 'New User' }
    
    // Mock new API calls
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, stats: { propertiesViewed: 20 } })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, properties: [], total: 0 })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, activities: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, analytics: { totalViews: 0 } })
      } as Response)

    rerender(<UserDashboard user={newUser} />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome, New User!')).toBeInTheDocument()
    })
    
    // Should have made new API calls
    expect(global.fetch).toHaveBeenCalledTimes(4)
  })

  it('should handle 401 unauthorized errors', async () => {
    // Mock 401 error
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        success: false,
        error: 'Unauthorized'
      })
    } as Response)

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText(/please sign in again/i)).toBeInTheDocument()
    })
  })

  it('should make correct API calls', async () => {
    // Mock successful API calls
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    } as Response)

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4)
    })
    
    expect(global.fetch).toHaveBeenCalledWith('/api/user/dashboard/stats')
    expect(global.fetch).toHaveBeenCalledWith('/api/user/wishlist')
    expect(global.fetch).toHaveBeenCalledWith('/api/user/activity')
    expect(global.fetch).toHaveBeenCalledWith('/api/user/analytics')
  })

  it('should support refresh functionality', async () => {
    // Mock initial API calls
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        stats: mockDashboardData.stats
      })
    } as Response)

    render(<UserDashboard user={mockUser} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    })
    
    // Clear previous calls
    vi.mocked(global.fetch).mockClear()
    
    // Trigger refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4)
    })
  })

  it('should handle responsive layout', () => {
    // Mock successful API calls
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    } as Response)

    render(<UserDashboard user={mockUser} />)
    
    const dashboard = screen.getByTestId('user-dashboard')
    expect(dashboard).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3')
  })
})