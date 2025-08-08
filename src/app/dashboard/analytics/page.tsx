'use client';

import { UserProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserAnalytics } from '@/components/dashboard/UserAnalytics';

export default function AnalyticsPage() {
  return (
    <UserProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Insights into your property browsing behavior and preferences
                </p>
              </div>
              {process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/user/analytics/seed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      const data = await response.json();
                      if (data.success) {
                        window.location.reload();
                      } else {
                        alert('Failed to seed data: ' + data.error);
                      }
                    } catch (error) {
                      alert('Error seeding data');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Seed Test Data
                </button>
              )}
            </div>
          </div>
          
          <UserAnalytics />
        </div>
      </div>
    </UserProtectedRoute>
  );
}