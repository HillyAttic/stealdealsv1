'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface DashboardStatsData {
  wishlistCount: number;
  viewedProperties: number;
  savedSearches: number;
  recentActivity: number;
}

export function DashboardStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStatsData>({
    wishlistCount: 0,
    viewedProperties: 0,
    savedSearches: 0,
    recentActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch comprehensive dashboard metrics
        const metricsResponse = await fetch('/api/dashboard/metrics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          if (metricsData.success && metricsData.data.user) {
            const userMetrics = metricsData.data.user;
            
            // Count recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentActivity = userMetrics.activityTrends
              .filter((day: any) => new Date(day.date) >= sevenDaysAgo)
              .reduce((sum: number, day: any) => 
                sum + (day.views || 0) + (day.searches || 0) + (day.actions || 0), 0);

            // Count total searches from trends
            const savedSearches = userMetrics.activityTrends
              .reduce((sum: number, day: any) => sum + (day.searches || 0), 0);
            
            setStats({
              wishlistCount: userMetrics.wishlistCount,
              viewedProperties: userMetrics.totalViews,
              savedSearches,
              recentActivity
            });
          }
        } else {
          // Fallback to individual API calls if the comprehensive endpoint fails
          const [wishlistResponse, analyticsResponse] = await Promise.all([
            fetch('/api/user/wishlist', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            }),
            fetch('/api/user/analytics', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            })
          ]);

          let wishlistCount = 0;
          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            wishlistCount = wishlistData.wishlist?.length || 0;
          }

          let viewedProperties = 0;
          let savedSearches = 0;
          let recentActivity = 0;

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            if (analyticsData.success && analyticsData.analytics) {
              const analytics = analyticsData.analytics;
              viewedProperties = analytics.totalViews || 0;
              
              if (analytics.activityByDay) {
                savedSearches = analytics.activityByDay.reduce((sum: number, day: any) => 
                  sum + (day.searches || 0), 0);
                  
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                recentActivity = analytics.activityByDay
                  .filter((day: any) => new Date(day.date) >= sevenDaysAgo)
                  .reduce((sum: number, day: any) => 
                    sum + (day.views || 0) + (day.searches || 0) + (day.wishlistActions || 0), 0);
              }
            }
          }

          setStats({
            wishlistCount,
            viewedProperties,
            savedSearches,
            recentActivity
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          wishlistCount: 0,
          viewedProperties: 0,
          savedSearches: 0,
          recentActivity: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const statItems = [
    {
      name: 'Wishlist Items',
      value: stats.wishlistCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'text-red-600 bg-red-50',
      href: '/dashboard/wishlist'
    },
    {
      name: 'Properties Viewed',
      value: stats.viewedProperties,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
      href: '/dashboard/activity'
    },
    {
      name: 'Saved Searches',
      value: stats.savedSearches,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'text-green-600 bg-green-50',
      href: '/dashboard/searches'
    },
    {
      name: 'Recent Activity',
      value: stats.recentActivity,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-50',
      href: '/dashboard/activity'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${item.color}`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
          
          {item.value === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {item.name === 'Wishlist Items' && 'Start adding properties to your wishlist'}
                {item.name === 'Properties Viewed' && 'Browse properties to see your viewing history'}
                {item.name === 'Saved Searches' && 'Save your searches for quick access'}
                {item.name === 'Recent Activity' && 'Your recent activity will appear here'}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}