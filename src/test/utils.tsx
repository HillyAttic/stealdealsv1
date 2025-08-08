import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user' as const,
  provider: 'email' as const,
  isActive: true,
  emailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-01-01'),
  preferences: {
    propertyTypes: ['apartment', 'house'],
    priceRange: { min: 100000, max: 500000 },
    locations: ['New York', 'Los Angeles'],
    notifications: {
      email: true,
      push: false,
      newProperties: true,
      priceAlerts: true
    }
  }
}

export const mockAdmin = {
  ...mockUser,
  id: 'admin-user-id',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const
}

// Mock property data
export const mockProperty = {
  id: 'test-property-id',
  title: 'Test Property',
  price: 250000,
  location: 'Test City',
  type: 'apartment',
  images: ['test-image.jpg'],
  description: 'Test property description',
  bedrooms: 2,
  bathrooms: 1,
  area: 1000
}

// Mock wishlist item
export const mockWishlistItem = {
  id: 'wishlist-item-id',
  userId: mockUser.id,
  propertyId: mockProperty.id,
  addedAt: new Date('2024-01-01'),
  notes: 'Test notes',
  priority: 'medium' as const
}

// Mock activity
export const mockActivity = {
  id: 'activity-id',
  userId: mockUser.id,
  type: 'property_view' as const,
  propertyId: mockProperty.id,
  metadata: { source: 'search' },
  timestamp: new Date('2024-01-01'),
  sessionId: 'test-session-id',
  ipAddress: '127.0.0.1',
  userAgent: 'test-user-agent'
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

export const mockApiError = (message: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message })),
  } as Response)
}

// Mock fetch for API testing
export const mockFetch = (response: any) => {
  global.fetch = vi.fn().mockResolvedValue(response)
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    })
  }
}

// Mock toast notifications
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn()
}