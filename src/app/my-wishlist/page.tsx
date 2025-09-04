'use client';

import { WishlistSection } from '@/components/wishlist/WishlistSection';
import { WishlistErrorBoundary } from '@/components/wishlist/WishlistErrorBoundary';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function MyWishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Manage your saved properties (Backup Route)</p>
        </div>
        <WishlistErrorBoundary>
          <WishlistSection className="w-full" showAll={true} />
        </WishlistErrorBoundary>
      </div>
    </div>
  );
}