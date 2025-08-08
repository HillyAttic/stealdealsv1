'use client';

import { useState, useEffect } from 'react';
import { UserAnalytics as UserAnalyticsType } from '@/types/auth';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalyticsMetrics } from './AnalyticsMetrics';

export function AnalyticsPreview() {
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/analytics?timeframe=30d', {
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
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-500 mb-2">Analytics unavailable</div>
        <p className="text-sm text-gray-400">
          Start browsing properties to see your analytics
        </p>
      </div>
    );
  }

  return <AnalyticsMetrics analytics={analytics} />;
}