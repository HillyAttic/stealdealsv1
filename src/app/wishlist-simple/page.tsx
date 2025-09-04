'use client';

import { useEnhancedWishlistContext } from '@/contexts/EnhancedWishlistContext';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function SimpleWishlistPage() {
  const { wishlistItems, isLoading } = useEnhancedWishlistContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading Wishlist...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Wishlist Debug</h1>
          <p className="text-gray-600 mt-2">Debug route - minimal dependencies</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Wishlist Status</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </div>
            
            <div>
              <strong>Items Count:</strong> {wishlistItems.size}
            </div>
            
            <div>
              <strong>Items:</strong>
              {wishlistItems.size > 0 ? (
                <ul className="mt-2 space-y-2">
                  {Array.from(wishlistItems).map(itemId => (
                    <li key={itemId} className="bg-gray-100 p-2 rounded">
                      Property ID: {itemId}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No items in wishlist</p>
              )}
            </div>
            
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
            
            <div>
              <strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) + '...' : 'Server'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}