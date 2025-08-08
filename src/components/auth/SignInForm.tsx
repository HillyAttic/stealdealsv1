"use client";

import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/contexts/ToastContext';
import { useAuthContext } from './AuthProvider';

interface SignInFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToSignUp?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { showError, showSuccess } = useToast();
  const { login, isLoading } = useAuthContext();

  const {
    values: formData,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    setError,
    clearAllErrors
  } = useFormValidation<LoginFormData>(
    { email: '', password: '' },
    { schema: loginSchema, validateOnChange: true, validateOnBlur: true }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate form
    const isFormValid = await validateForm();
    if (!isFormValid) {
      showError('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showSuccess('Welcome back!', 'You have been signed in successfully.');
        onSuccess?.(result.user);
      } else {
        // Check for specific field errors
        if (result.error?.includes('email')) {
          setError('email', result.error);
        } else if (result.error?.includes('password')) {
          setError('password', result.error);
        } else {
          showError('Sign In Failed', result.error || 'An unexpected error occurred.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Sign In Failed', 'An unexpected error occurred. Please try again.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200
                ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`
                block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200
                ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            onClick={() => {
              // Forgot password functionality will be implemented in later tasks
              console.log('Forgot password clicked');
            }}
          >
            Forgot your password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className={`
            w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white
            ${isLoading || !isValid
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            disabled={isLoading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;