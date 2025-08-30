'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaHeart, FaSignInAlt } from 'react-icons/fa';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistNavButtonProps {
  className?: string;
  showText?: boolean;
}

// Authentication Alert Modal Component
interface AuthAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function WishlistAuthModal({ isOpen, onClose }: AuthAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        
        {/* Content */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaHeart className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sign in to view your wishlist
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            Create a free account to save properties and view your personalized wishlist.
          </p>
          
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaSignInAlt className="mr-2" />
                Sign In
              </button>
            </SignInButton>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WishlistNavButton({ className = '', showText = false }: WishlistNavButtonProps) {
  const { isSignedIn, userId } = useAuth();
  const { wishlistCount } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      setShowAuthModal(true);
    }
    // If signed in, Link will handle navigation
  };

  const buttonContent = (
    <>
      <div className="relative">
        <FaHeart className={`${showText ? 'mr-2' : ''} text-lg`} />
        
        {/* Count Badge - only show when signed in and have items */}
        {isSignedIn && wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </span>
        )}
      </div>
      
      {/* Optional Text */}
      {showText && (
        <span className="text-sm font-medium">
          {isSignedIn ? `Wishlist ${wishlistCount > 0 ? `(${wishlistCount})` : ''}` : 'Wishlist'}
        </span>
      )}
    </>
  );

  const baseClassName = `
    relative inline-flex items-center justify-center
    p-2 rounded-full
    text-red-500 border border-gray-200
    hover:bg-red-50 hover:border-red-200
    transition-all duration-200
    ${className}
  `;

  return (
    <>
      {isSignedIn ? (
        <Link
          href="/wishlist"
          className={baseClassName}
          title="View Wishlist"
        >
          {buttonContent}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={baseClassName}
          title="Sign in to view wishlist"
        >
          {buttonContent}
        </button>
      )}
      
      {/* Authentication Modal */}
      <WishlistAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}