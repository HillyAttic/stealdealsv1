"use client";

import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/contexts/ToastContext';
import { useAuthContext } from './AuthProvider';

interface SignUpFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToSignIn?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { showError, showSuccess } = useToast();
  const { register, isLoading } = useAuthContext();

  const {
    values: formData,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    setError,
    clearAllErrors
  } = useFormValidation<RegisterFormData>(
    { name: '', email: '', password: '' },
    { schema: registerSchema, validateOnChange: true, validateOnBlur: true }
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
      const result = await register(formData.name, formData.email, formData.password);

      if (result.success) {
        showSuccess('Welcome!', 'Your account has been created successfully.');
        onSuccess?.(result.user);
      } else {
        // Check for specific field errors
        if (result.error?.includes('email')) {
          setError('email', result.error);
        } else if (result.error?.includes('password')) {
          setError('password', result.error);
        } else if (result.error?.includes('name')) {
          setError('name', result.error);
        } else {
          showError('Registration Failed', result.error || 'An unexpected error occurred.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Registration Failed', 'An unexpected error occurred. Please try again.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200
                ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your full name"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

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
              placeholder="Create a strong password"
              disabled={isLoading}
              autoComplete="new-password"
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
          <p className="mt-1 text-xs text-gray-500">
            Password must contain at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 underline"
            onClick={() => {
              // Terms of service link - will be implemented later
              console.log('Terms of service clicked');
            }}
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 underline"
            onClick={() => {
              // Privacy policy link - will be implemented later
              console.log('Privacy policy clicked');
            }}
          >
            Privacy Policy
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
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            disabled={isLoading}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;