'use client';

import React from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { WishlistTestComponent } from '@/components/wishlist/WishlistTestComponent';
import { AuthProvider } from '@/components/auth/AuthProvider';

export function WishlistDemo() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Wishlist System Demo</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wishlist Buttons</h3>
            <div className="flex gap-4">
              <WishlistButton propertyId="demo-1" showText size="sm" />
              <WishlistButton propertyId="demo-2" showText size="md" />
              <WishlistButton propertyId="demo-3" showText size="lg" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wishlist State</h3>
            <WishlistTestComponent propertyId="demo-1" />
          </div>
        </div>
      </WishlistProvider>
    </AuthProvider>
  );
}