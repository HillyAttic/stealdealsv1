"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth, useUser } from '@clerk/nextjs';

interface AuthButtonProps {
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ className }) => {
  const { isSignedIn, signOut, isLoaded } = useAuth();
  const { user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleAuthClick = () => {
    if (isSignedIn && user) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDashboard = () => {
    setIsDropdownOpen(false);
    router.push('/wishlist');
  };


  if (!isLoaded) {
    return (
      <div className={`flex items-center space-x-2 px-4 py-2 ${className || ''}`}>
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className || ''}`}>
        {isSignedIn && user ? (
          // Authenticated user dropdown
          <div className="relative">
            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || user.firstName || 'User'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="https://cdn-icons-png.flaticon.com/512/17468/17468741.png"
                    alt="User"
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                {user.fullName || user.firstName || 'User'}
              </span>
              <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || user.firstName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <button
                  onClick={handleDashboard}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  My Wishlist
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Unauthenticated user button - redirect to sign-in page
          <button
            onClick={() => router.push('/sign-in')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Sign in"
          >
            <Image
              src="https://cdn-icons-png.flaticon.com/512/17468/17468741.png"
              alt="User"
              width={20}
              height={20}
              className="filter brightness-0 invert"
            />
            <span className="hidden md:block text-sm font-medium">Sign In</span>
          </button>
        )}

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

    </>
  );
};

export default AuthButton;