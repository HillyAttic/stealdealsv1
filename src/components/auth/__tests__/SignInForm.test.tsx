import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import SignInForm from '../SignInForm'
import { mockToast } from '@/test/utils'

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: mockToast
}))

const mockOnSuccess = vi.fn()
const mockOnSwitchToSignUp = vi.fn()

// Mock fetch for API calls
global.fetch = vi.fn()

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockClear()
  })

  it('should render sign in form with all fields', () => {
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'jwt-token'
      })
    } as Response)
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle login error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Invalid credentials'
      })
    } as Response)
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('should show loading state during submission', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should switch to sign up form when link is clicked', () => {
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const signUpLink = screen.getByText(/sign up/i)
    fireEvent.click(signUpLink)
    
    expect(mockOnSwitchToSignUp).toHaveBeenCalled()
  })

  it('should handle Google sign in', async () => {
    // Mock Google OAuth success
    const mockGoogleSignIn = vi.fn().mockResolvedValue({
      user: { id: 'google-id', email: 'google@example.com', name: 'Google User' },
      token: 'google-jwt-token'
    })
    
    vi.mock('../GoogleAuthButton', () => ({
      default: ({ onSuccess }: { onSuccess: (result: any) => void }) => (
        <button onClick={() => onSuccess(mockGoogleSignIn())}>
          Sign in with Google
        </button>
      )
    }))
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const googleButton = screen.getByText(/sign in with google/i)
    fireEvent.click(googleButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.'
      )
    })
  })

  it('should clear form errors when user starts typing', async () => {
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })

  it('should handle form submission with Enter key', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'jwt-token'
      })
    } as Response)
    
    render(
      <SignInForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignUp={mockOnSwitchToSignUp} 
      />
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.keyDown(passwordInput, { key: 'Enter' })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})