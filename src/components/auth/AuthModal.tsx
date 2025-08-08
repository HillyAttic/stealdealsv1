"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes } from 'react-icons/fa';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
  onSuccess?: () => void;
  redirectPath?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'signin',
  onSuccess,
  redirectPath
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const router = useRouter();

  // Reset to default tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAuthSuccess = (user: any) => {
    // Handle successful authentication
    console.log('Authentication successful:', user);
    onClose();
    onSuccess?.();
    
    // Redirect to the original requested path
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Modal content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Stealdeals
              </h2>
              <p className="text-gray-600">
                {activeTab === 'signin' 
                  ? 'Sign in to access your personalized dashboard' 
                  : 'Create an account to start saving your favorite properties'
                }
              </p>
            </div>

            {/* Tab navigation */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form content */}
            <div className="transition-all duration-300">
              <AuthErrorBoundary>
                {activeTab === 'signin' ? (
                  <SignInForm 
                    onSuccess={handleAuthSuccess}
                    onSwitchToSignUp={() => setActiveTab('signup')}
                  />
                ) : (
                  <SignUpForm 
                    onSuccess={handleAuthSuccess}
                    onSwitchToSignIn={() => setActiveTab('signin')}
                  />
                )}
              </AuthErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;