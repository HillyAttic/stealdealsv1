'use client';

import { useState, useEffect } from 'react';
import { UserStatistics } from '@/types/auth';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdminUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  userGrowth: Array<{ date: string; users: number; }>;
  topUsers: Array<{ id: string; name: string; email: string; activityCount: number; }>;
}

export function UserAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AdminUserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/admin/users', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        // Transform the data for analytics
        const analyticsData: AdminUserAnalytics = {
          totalUsers: data.statistics.totalUsers,
          activeUsers: data.statistics.activeUsers,
          newUsersThisMonth: data.statistics.newUsersThisMonth,
          totalActivities: data.statistics.totalActivities,
          activitiesByType: data.statistics.activitiesByType || {},
          userGrowth: [], // Would be calculated from user creation dates
          topUsers: data.users.slice(0, 5).map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            activityCount: user.totalViews || 0
          }))
        };

        setAnalytics(analyticsData);
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
    return <LoadingSpinner message="Loading user analytics..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No analytics data available</div>
      </div>
    );
  }

  // Prepare activity types chart data
  const activityTypesData = {
    labels: Object.keys(analytics.activitiesByType),
    datasets: [
      {
        data: Object.values(analytics.activitiesByType),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive insights into user behavior and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analytics.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{analytics.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{analytics.newUsersThisMonth}</div>
            <div className="text-sm text-gray-600">New This Month</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{analytics.totalActivities}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Types</h3>
          {Object.keys(analytics.activitiesByType).length > 0 ? (
            <div className="h-64">
              <Doughnut data={activityTypesData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div>No activity data yet</div>
              </div>
            </div>
          )}
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
          {analytics.topUsers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {user.activityCount} activities
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">👥</div>
                <div>No user activity data yet</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Engagement Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalUsers > 0 ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-blue-700">Active User Rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analytics.totalUsers > 0 ? (analytics.totalActivities / analytics.totalUsers).toFixed(1) : 0}
            </div>
            <div className="text-sm text-green-700">Avg Activities per User</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.totalUsers > 0 ? ((analytics.newUsersThisMonth / analytics.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-purple-700">Growth Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}