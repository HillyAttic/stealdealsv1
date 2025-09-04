import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist - Stealdeals',
  description: 'View your saved properties',
};

// Force static generation to ensure this route always exists
export const dynamic = 'force-static';
export const runtime = 'nodejs';

export default function StaticWishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Your saved properties will load here</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Loading your wishlist...
            </p>
            
            <div className="space-y-4">
              <a 
                href="/my-wishlist" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Full Wishlist
              </a>
              
              <div>
                <a 
                  href="/saved-properties" 
                  className="inline-block text-blue-600 hover:text-blue-800 underline ml-4"
                >
                  Alternative Route
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            Having trouble loading your wishlist?
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            Try these alternative routes:
          </p>
          <div className="space-x-4">
            <a href="/my-wishlist" className="text-blue-600 hover:underline">/my-wishlist</a>
            <a href="/saved-properties" className="text-blue-600 hover:underline">/saved-properties</a>
            <a href="/wishlist-simple" className="text-blue-600 hover:underline">/wishlist-simple</a>
          </div>
        </div>
      </div>
    </div>
  );
}