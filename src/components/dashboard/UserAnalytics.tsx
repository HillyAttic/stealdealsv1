'use client';

import { useState, useEffect } from 'react';
import { UserAnalytics as UserAnalyticsType } from '@/types/auth';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AnalyticsMetrics } from './AnalyticsMetrics';
import { PropertyPreferences } from './PropertyPreferences';

interface UserAnalyticsProps {
  className?: string;
}

export function UserAnalytics({ className = '' }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/user/analytics?timeframe=${timeframe}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <LoadingSpinner message="Loading your analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No analytics data available</div>
          <p className="text-sm text-gray-400">
            Start browsing properties to see your analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with timeframe selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Analytics</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="timeframe" className="text-sm text-gray-600">
              Timeframe:
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <AnalyticsMetrics analytics={analytics} />
      </div>

      {/* Activity Charts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
        <AnalyticsCharts analytics={analytics} />
      </div>

      {/* Property Preferences */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Preferences</h3>
        <PropertyPreferences analytics={analytics} />
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.conversionMetrics.propertyViews}
            </div>
            <div className="text-sm text-blue-700">Properties Viewed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analytics.conversionMetrics.wishlistAdds}
            </div>
            <div className="text-sm text-green-700">Added to Wishlist</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.conversionMetrics.contactInquiries}
            </div>
            <div className="text-sm text-purple-700">Contact Inquiries</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.conversionMetrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-orange-700">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}