'use client';

import { useState, useEffect } from 'react';
import { UserDashboardMetrics, RealTimeMetrics } from '@/lib/analytics/real-time-analytics';
import { LoadingSpinner } from './LoadingSpinner';

interface RealTimeAnalyticsProps {
  className?: string;
}

export function RealTimeAnalytics({ className = '' }: RealTimeAnalyticsProps) {
  const [metrics, setMetrics] = useState<{
    user: UserDashboardMetrics | null;
    system: RealTimeMetrics | null;
  }>({
    user: null,
    system: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/metrics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch metrics');
        }

        setMetrics({
          user: data.data.user,
          system: data.data.system
        });
      } catch (err) {
        console.error('Error fetching real-time metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <LoadingSpinner message="Loading real-time analytics..." />
      </div>
    );
  }

  if (error || !metrics.user || !metrics.system) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Analytics Unavailable</div>
          <p className="text-sm text-gray-500">
            Unable to load analytics data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { user, system } = metrics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personal Analytics Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{user.totalViews}</div>
            <div className="text-sm text-blue-600">Properties Viewed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{user.uniqueProperties}</div>
            <div className="text-sm text-green-600">Unique Properties</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{user.wishlistCount}</div>
            <div className="text-sm text-purple-600">Saved Properties</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{user.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-orange-600">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Market Overview - Separated Verticals */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview - Property Verticals</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{system.vacantProperties.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Vacant Properties</div>
            <div className="text-xs text-blue-600 mt-1">
              {system.propertyBreakdown.vacant.percentage.toFixed(1)}% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{system.preleasedProperties.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Pre-leased Properties</div>
            <div className="text-xs text-green-600 mt-1">
              {system.propertyBreakdown.preleased.percentage.toFixed(1)}% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">{system.totalFranchises.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Franchise Opportunities</div>
            <div className="text-xs text-teal-600 mt-1">
              {system.propertyBreakdown.franchises.percentage.toFixed(1)}% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{system.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Active Users</div>
            <div className="text-xs text-purple-600 mt-1">Platform Users</div>
          </div>
        </div>
        
        {/* Property Breakdown Visualization */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Property Distribution</h4>
          <div className="flex items-center space-x-1 mb-2">
            <div 
              className="h-4 bg-blue-500 rounded-l"
              style={{ width: `${system.propertyBreakdown.vacant.percentage}%` }}
            ></div>
            <div 
              className="h-4 bg-green-500"
              style={{ width: `${system.propertyBreakdown.preleased.percentage}%` }}
            ></div>
            <div 
              className="h-4 bg-teal-500 rounded-r"
              style={{ width: `${system.propertyBreakdown.franchises.percentage}%` }}
            ></div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>Vacant ({system.vacantProperties})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>Pre-leased ({system.preleasedProperties})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded mr-2"></div>
              <span>Franchises ({system.totalFranchises})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Preferences */}
      {user.favoriteCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Property Preferences</h3>
          <div className="space-y-3">
            {user.favoriteCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 min-w-[3rem]">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Locations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {system.locationStats.slice(0, 8).map((location, index) => (
            <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-900">{location.location}</div>
              </div>
              <div className="flex items-center">
                <div className="text-sm text-gray-600 mr-2">{location.count} properties</div>
                <div className="text-xs text-gray-500">({location.percentage.toFixed(1)}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range Distribution</h3>
        <div className="space-y-3">
          {system.priceRangeStats.map((range, index) => (
            <div key={range.range} className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 min-w-[8rem]">{range.range}</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(range.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 min-w-[4rem] text-right">
                {range.count} ({range.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity Trends (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-between space-x-1">
          {user.activityTrends.slice(-14).map((day, index) => {
            const totalActivity = day.views + day.searches + day.actions;
            const maxActivity = Math.max(...user.activityTrends.map(d => d.views + d.searches + d.actions));
            const height = maxActivity > 0 ? (totalActivity / maxActivity) * 200 : 0;
            
            return (
              <div key={day.date} className="flex flex-col items-center">
                <div className="relative group">
                  <div 
                    className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString()}<br/>
                    Views: {day.views}<br/>
                    Searches: {day.searches}<br/>
                    Actions: {day.actions}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 transform rotate-45 w-8">
                  {new Date(day.date).getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}