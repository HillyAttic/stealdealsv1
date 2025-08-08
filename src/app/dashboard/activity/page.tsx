'use client';

import { UserProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ActivityHistory } from '@/components/dashboard';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function ActivityPage() {
  return (
    <UserProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity History</h1>
                <p className="text-gray-600 mt-1">
                  View your complete property browsing and search history
                </p>
              </div>
            </div>
          </div>

          {/* Activity History Component */}
          <ActivityHistory />
        </div>
      </div>
    </UserProtectedRoute>
  );
}