'use client';

import { useState } from 'react';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useAuthContext } from '@/components/auth/AuthProvider';

/**
 * Development helper component to debug wishlist issues
 * Only shows in development mode
 */
export default function WishlistDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const { wishlistItems, wishlistCount, isLoading, isInitialized } = useWishlistContext();
  const { isAuthenticated, user } = useAuthContext();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const enableMockAuth = () => {
    localStorage.setItem('mock_authenticated', 'true');
    localStorage.setItem('mock_user', JSON.stringify({
      id: 'user-1',
      email: 'user-1@stealdeals.com',
      name: 'Test User'
    }));
    window.location.reload();
  };

  const instantFix = () => {
    console.log('🚨 INSTANT WISHLIST FIX ACTIVATED!');
    enableMockAuth();
  };

  const populateLocalStorageWishlist = () => {
    const testItems = ['1', '2', '3', '4', '5', '6'];
    localStorage.setItem('stealdeals_wishlist_temp', JSON.stringify(testItems));
    window.location.reload();
  };

  const clearAll = () => {
    localStorage.removeItem('mock_authenticated');
    localStorage.removeItem('mock_user');
    localStorage.removeItem('stealdeals_wishlist_temp');
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Wishlist Debug
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-3">🛠️ Wishlist Debug</h3>
          
          <div className="space-y-3 mb-4 text-xs">
            <div className="border-b pb-2">
              <strong>Auth State:</strong>
              <div>• isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
              <div>• user: {user ? user.email : 'null'}</div>
            </div>
            
            <div className="border-b pb-2">
              <strong>Wishlist State:</strong>
              <div>• count: {wishlistCount}</div>
              <div>• items: [{Array.from(wishlistItems).join(', ')}]</div>
              <div>• isLoading: {isLoading ? 'true' : 'false'}</div>
              <div>• isInitialized: {isInitialized ? 'true' : 'false'}</div>
            </div>
            
            <div>
              <strong>localStorage:</strong>
              <div>• mock_authenticated: {localStorage.getItem('mock_authenticated') || 'null'}</div>
              <div>• wishlist_temp: {localStorage.getItem('stealdeals_wishlist_temp') || 'null'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={instantFix}
              className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-bold"
            >
              🚨 INSTANT FIX - SHOW MY 6 ITEMS! 🚨
            </button>
            
            <button
              onClick={enableMockAuth}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Enable Mock Auth
            </button>
            
            <button
              onClick={populateLocalStorageWishlist}
              className="w-full bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
            >
              Add 6 Test Items to localStorage
            </button>
            
            <button
              onClick={clearAll}
              className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
            >
              Clear All & Refresh
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            💡 These controls only work in development mode
          </div>
        </div>
      )}
    </div>
  );
}