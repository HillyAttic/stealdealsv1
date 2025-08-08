// Authentication components
export { default as AuthButton } from './AuthButton';
export { default as AuthModal } from './AuthModal';
export { AuthPrompt } from './AuthPrompt';
export { default as SignInForm } from './SignInForm';
export { default as SignUpForm } from './SignUpForm';
export { AuthProvider } from './AuthProvider';

// Error boundaries
export { AuthErrorBoundary, withAuthErrorBoundary } from '../error-boundaries/AuthErrorBoundary';

// Types
export type { AuthError } from '@/lib/errors/auth-errors';
export { AuthErrorCodes } from '@/types/auth';