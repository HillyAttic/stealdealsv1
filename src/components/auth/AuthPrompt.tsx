'use client';

import { useState } from 'react';
import { FaHeart, FaTimes, FaUser } from 'react-icons/fa';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
  redirectPath?: string;
  onAuthSuccess?: () => void;
}

export function AuthPrompt({ 
  isOpen, 
  onClose, 
  title = "Sign in required",
  message = "Please sign in to use this feature",
  feature = "wishlist",
  redirectPath,
  onAuthSuccess
}: AuthPromptProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  if (!isOpen) return null;

  const getFeatureIcon = () => {
    switch (feature) {
      case 'wishlist':
        return <FaHeart className="text-red-500" />;
      case 'dashboard':
        return <FaUser className="text-blue-500" />;
      case 'contact':
        return <FaUser className="text-green-500" />;
      default:
        return <FaUser className="text-blue-500" />;
    }
  };

  const getFeatureMessage = () => {
    switch (feature) {
      case 'wishlist':
        return "Sign in to save properties to your wishlist and access them anytime.";
      case 'dashboard':
        return "Sign in to access your personalized dashboard with saved properties and viewing history.";
      case 'contact':
        return "Sign in to track your inquiries and get personalized responses.";
      default:
        return message;
    }
  };

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
    onClose();
    
    // Redirect if path is provided
    if (redirectPath) {
      // Use Next.js router for better navigation
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">
              {getFeatureIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {getFeatureMessage()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'signin'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'signup'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AuthErrorBoundary>
            {activeTab === 'signin' ? (
              <SignInForm onSuccess={handleAuthSuccess} />
            ) : (
              <SignUpForm onSuccess={handleAuthSuccess} />
            )}
          </AuthErrorBoundary>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}