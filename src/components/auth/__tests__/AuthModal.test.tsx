import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import AuthModal from '../AuthModal'

// Mock child components
vi.mock('../SignInForm', () => ({
  default: ({ onSuccess, onSwitchToSignUp }: any) => (
    <div data-testid="sign-in-form">
      <button onClick={onSuccess}>Sign In Success</button>
      <button onClick={onSwitchToSignUp}>Switch to Sign Up</button>
    </div>
  )
}))

vi.mock('../SignUpForm', () => ({
  default: ({ onSuccess, onSwitchToSignIn }: any) => (
    <div data-testid="sign-up-form">
      <button onClick={onSuccess}>Sign Up Success</button>
      <button onClick={onSwitchToSignIn}>Switch to Sign In</button>
    </div>
  )
}))

describe('AuthModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render sign in form by default when open', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    expect(screen.queryByTestId('sign-up-form')).not.toBeInTheDocument()
  })

  it('should render modal with proper accessibility attributes', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby')
  })

  it('should close modal when close button is clicked', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when overlay is clicked', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const overlay = screen.getByTestId('modal-overlay')
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should not close modal when modal content is clicked', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const modalContent = screen.getByTestId('modal-content')
    fireEvent.click(modalContent)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should close modal when Escape key is pressed', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should switch to sign up form when switch button is clicked', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    
    const switchButton = screen.getByText('Switch to Sign Up')
    fireEvent.click(switchButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
      expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument()
    })
  })

  it('should switch back to sign in form from sign up', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    // Switch to sign up
    const switchToSignUp = screen.getByText('Switch to Sign Up')
    fireEvent.click(switchToSignUp)
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
    })
    
    // Switch back to sign in
    const switchToSignIn = screen.getByText('Switch to Sign In')
    fireEvent.click(switchToSignIn)
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
      expect(screen.queryByTestId('sign-up-form')).not.toBeInTheDocument()
    })
  })

  it('should close modal on successful sign in', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const signInSuccess = screen.getByText('Sign In Success')
    fireEvent.click(signInSuccess)
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should close modal on successful sign up', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    // Switch to sign up form first
    const switchToSignUp = screen.getByText('Switch to Sign Up')
    fireEvent.click(switchToSignUp)
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
    })
    
    const signUpSuccess = screen.getByText('Sign Up Success')
    fireEvent.click(signUpSuccess)
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should trap focus within modal', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const modal = screen.getByRole('dialog')
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    expect(focusableElements.length).toBeGreaterThan(0)
    
    // First focusable element should be focused
    expect(document.activeElement).toBe(focusableElements[0])
  })

  it('should prevent body scroll when modal is open', () => {
    const { rerender } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    )
    
    expect(document.body.style.overflow).toBe('')
    
    rerender(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<AuthModal isOpen={false} onClose={mockOnClose} />)
    
    expect(document.body.style.overflow).toBe('')
  })

  it('should display correct title for sign in mode', () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should display correct title for sign up mode', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    const switchToSignUp = screen.getByText('Switch to Sign Up')
    fireEvent.click(switchToSignUp)
    
    await waitFor(() => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })
  })

  it('should handle rapid open/close operations', async () => {
    const { rerender } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    )
    
    // Rapidly toggle modal
    rerender(<AuthModal isOpen={true} onClose={mockOnClose} />)
    rerender(<AuthModal isOpen={false} onClose={mockOnClose} />)
    rerender(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should maintain form state when switching between forms', async () => {
    render(
      <AuthModal isOpen={true} onClose={mockOnClose} />
    )
    
    // Start with sign in form
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    
    // Switch to sign up
    fireEvent.click(screen.getByText('Switch to Sign Up'))
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
    })
    
    // Switch back to sign in
    fireEvent.click(screen.getByText('Switch to Sign In'))
    
    await waitFor(() => {
      expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    })
  })
})