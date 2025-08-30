import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import SignUpForm from '../SignUpForm'
import { mockToast } from '@/test/utils'

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  default: mockToast
}))

const mockOnSuccess = jest.fn()
const mockOnSwitchToSignIn = jest.fn()

// Mock fetch for API calls
global.fetch = jest.fn()

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(global.fetch).mockClear()
  })

  it('should render sign up form with all fields', () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByText(/sign up with google/i)).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should validate password strength', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should validate password confirmation', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { 
          id: '1', 
          email: 'test@example.com', 
          name: 'Test User' 
        },
        token: 'jwt-token'
      })
    } as Response)
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePassword123!'
        })
      })
    })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle registration error', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Email already exists',
        field: 'email'
      })
    } as Response)
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Email already exists')
    })
  })

  it('should show loading state during submission', async () => {
    jest.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should switch to sign in form when link is clicked', () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const signInLink = screen.getByText(/sign in/i)
    fireEvent.click(signInLink)
    
    expect(mockOnSwitchToSignIn).toHaveBeenCalled()
  })

  it('should handle Google sign up', async () => {
    // Mock Google OAuth success
    const mockGoogleSignUp = jest.fn().mockResolvedValue({
      user: { id: 'google-id', email: 'google@example.com', name: 'Google User' },
      token: 'google-jwt-token',
      isNewUser: true
    })
    
    jest.mock('../GoogleAuthButton', () => ({
      default: ({ onSuccess }: { onSuccess: (result: any) => void }) => (
        <button onClick={() => onSuccess(mockGoogleSignUp())}>
          Sign up with Google
        </button>
      )
    }))
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const googleButton = screen.getByText(/sign up with google/i)
    fireEvent.click(googleButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle network errors', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.'
      )
    })
  })

  it('should clear form errors when user starts typing', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    
    await waitFor(() => {
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
    })
  })

  it('should show password strength indicator', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const passwordInput = screen.getByLabelText(/^password/i)
    
    // Weak password
    fireEvent.change(passwordInput, { target: { value: '123' } })
    await waitFor(() => {
      expect(screen.getByText(/weak/i)).toBeInTheDocument()
    })
    
    // Medium password
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    await waitFor(() => {
      expect(screen.getByText(/medium/i)).toBeInTheDocument()
    })
    
    // Strong password
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument()
    })
  })

  it('should handle form submission with Enter key', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'jwt-token'
      })
    } as Response)
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } })
    fireEvent.keyDown(confirmPasswordInput, { key: 'Enter' })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should validate name length', async () => {
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'A' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('should handle validation errors from server', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Validation failed',
        details: [
          { path: ['email'], message: 'Invalid email format' },
          { path: ['password'], message: 'Password too weak' }
        ]
      })
    } as Response)
    
    render(
      <SignUpForm 
        onSuccess={mockOnSuccess} 
        onSwitchToSignIn={mockOnSwitchToSignIn} 
      />
    )
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'invalid@email' } })
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      expect(screen.getByText(/password too weak/i)).toBeInTheDocument()
    })
  })
})