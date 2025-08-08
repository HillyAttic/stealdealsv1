/**
 * Example usage of the comprehensive error handling and validation system
 * This file demonstrates how to use the new error handling features
 */

import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AuthErrorBoundary, withAuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { authApi } from '@/lib/api/auth-client';
import { AuthError } from '@/lib/errors/auth-errors';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

// Example 1: Using the toast system
function ToastExample() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleShowToasts = () => {
    showSuccess('Success!', 'Operation completed successfully');
    showError('Error!', 'Something went wrong', {
      action: {
        label: 'Retry',
        onClick: () => console.log('Retrying...')
      }
    });
    showWarning('Warning!', 'Please check your input');
    showInfo('Info', 'This is an informational message');
  };

  return (
    <button onClick={handleShowToasts}>
      Show Toast Examples
    </button>
  );
}

// Example 2: Using form validation hook
function FormValidationExample() {
  const { showError, showSuccess } = useToast();
  
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    setError
  } = useFormValidation<LoginFormData>(
    { email: '', password: '' },
    { 
      schema: loginSchema,
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 300
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateForm();
    if (!isFormValid) {
      showError('Validation Error', 'Please fix the errors below');
      return;
    }

    try {
      const result = await authApi.login(values);
      showSuccess('Success!', 'Logged in successfully');
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.field) {
          setError(error.field as keyof LoginFormData, error.userMessage);
        } else {
          showError('Login Failed', error.userMessage);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit" disabled={!isValid}>
        Login
      </button>
    </form>
  );
}

// Example 3: Using error boundary
function ErrorBoundaryExample() {
  const [shouldError, setShouldError] = React.useState(false);

  if (shouldError) {
    throw new Error('This is a test error');
  }

  return (
    <div>
      <button onClick={() => setShouldError(true)}>
        Trigger Error
      </button>
    </div>
  );
}

// Example 4: Component wrapped with error boundary
const SafeComponent = withAuthErrorBoundary(ErrorBoundaryExample, {
  onError: (error, errorInfo) => {
    console.log('Error caught by boundary:', error, errorInfo);
  }
});

// Example 5: Using the API client with error handling
function ApiClientExample() {
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleApiCall = async () => {
    setIsLoading(true);
    
    try {
      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      showSuccess('Success!', 'API call completed');
      console.log('Result:', result);
    } catch (error) {
      if (error instanceof AuthError) {
        showError('API Error', error.userMessage, {
          action: error.retryable ? {
            label: 'Retry',
            onClick: handleApiCall
          } : undefined
        });
      } else {
        showError('Unexpected Error', 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleApiCall} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Make API Call'}
    </button>
  );
}

// Example 6: Complete example with all features
function ComprehensiveExample() {
  return (
    <AuthErrorBoundary>
      <div className="space-y-4">
        <h2>Error Handling Examples</h2>
        
        <div>
          <h3>Toast Notifications</h3>
          <ToastExample />
        </div>
        
        <div>
          <h3>Form Validation</h3>
          <FormValidationExample />
        </div>
        
        <div>
          <h3>Error Boundary</h3>
          <SafeComponent />
        </div>
        
        <div>
          <h3>API Client</h3>
          <ApiClientExample />
        </div>
      </div>
    </AuthErrorBoundary>
  );
}

export default ComprehensiveExample;

/**
 * Usage Notes:
 * 
 * 1. Toast System:
 *    - Use useToast() hook to show notifications
 *    - Different types: success, error, warning, info
 *    - Support for actions (retry buttons, etc.)
 *    - Auto-dismiss with configurable duration
 * 
 * 2. Form Validation:
 *    - Use useFormValidation() hook with Zod schemas
 *    - Real-time validation with debouncing
 *    - Field-level and form-level validation
 *    - Automatic error clearing on input change
 * 
 * 3. Error Boundaries:
 *    - Wrap components with AuthErrorBoundary
 *    - Use withAuthErrorBoundary HOC for convenience
 *    - Automatic retry for retryable errors
 *    - Custom fallback UI support
 * 
 * 4. API Client:
 *    - Use authApi for authentication calls
 *    - Automatic retry with exponential backoff
 *    - Structured error handling with AuthError
 *    - Rate limiting and timeout support
 * 
 * 5. Error Types:
 *    - AuthError for authentication-specific errors
 *    - Automatic error classification (retryable vs non-retryable)
 *    - User-friendly error messages
 *    - Field-specific error mapping
 */