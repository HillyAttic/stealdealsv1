'use client';

import { useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { WishlistButton } from './WishlistButton';

export function WishlistTest() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, error, addToWishlist, removeFromWishlist } = useWishlist();
  const [testPropertyId] = useState('test-property-123');

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to test wishlist functionality</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Wishlist Test Component</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Test Wishlist Button:</h4>
          <WishlistButton 
            propertyId={testPropertyId}
            size="md"
            showText={true}
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Wishlist Stats:</h4>
          <div className="text-sm text-gray-600">
            <p>Total properties: {items.length}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Manual Actions:</h4>
          <div className="space-x-2">
            <button
              onClick={() => addToWishlist(testPropertyId)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Add Test Property
            </button>
            <button
              onClick={() => removeFromWishlist(testPropertyId)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Remove Test Property
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Current Wishlist:</h4>
            <div className="space-y-2">
              {items.map((property: any) => (
                <div key={property.id} className="p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium">{property.title}</p>
                  <p className="text-gray-600">{property.location} - {property.priority} priority</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}