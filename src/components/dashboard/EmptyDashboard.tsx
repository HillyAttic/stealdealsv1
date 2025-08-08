'use client';

import Link from 'next/link';

export function EmptyDashboard() {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <svg 
          className="w-24 h-24 text-gray-300 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" 
          />
        </svg>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Your Dashboard
        </h2>
        
        <p className="text-gray-600 mb-8">
          Your personalized dashboard is ready! Start exploring properties to see your activity, 
          wishlist, and analytics here.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Properties
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Or explore these features:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link href="/dashboard/profile" className="text-blue-600 hover:text-blue-700">
                Update Profile
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/dashboard/wishlist" className="text-blue-600 hover:text-blue-700">
                View Wishlist
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/dashboard/activity" className="text-blue-600 hover:text-blue-700">
                Activity History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}