'use client';

import { UserAnalytics } from '@/components/dashboard/UserAnalytics';
import { RealTimeAnalytics } from '@/components/dashboard/RealTimeAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Comprehensive Analytics Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Real-time insights into your property browsing behavior, market trends, and preferences
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live data updated every 5 minutes
                </div>
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
          
          {/* Real-time comprehensive analytics */}
          <div className="mb-8">
            <RealTimeAnalytics />
          </div>

          {/* Legacy analytics for historical comparison */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Historical Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Traditional analytics view for reference and comparison</p>
            </div>
            <div className="p-6">
              <UserAnalytics />
            </div>
          </div>
        </div>
      </div>
  );
}