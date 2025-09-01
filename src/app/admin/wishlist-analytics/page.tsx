'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import { FaHeart, FaUsers, FaChartBar, FaArrowUp, FaEye, FaDownload, FaClock, FaFire, FaStar } from 'react-icons/fa';
import Link from 'next/link';

interface WishlistProperty {
  propertyId: string;
  count: number;
  property?: {
    title: string;
    location: string;
    price: number;
    type: string;
    imageUrl?: string;
  };
}

interface RecentActivity {
  userId: string;
  userName?: string;
  action: 'add' | 'remove';
  propertyId: string;
  timestamp: string;
}

interface MostActiveUser {
  userId: string;
  userName?: string;
  wishlistCount: number;
  lastActivity?: string;
}

interface WishlistStats {
  totalUsers: number;
  usersWithWishlists: number;
  totalWishlistItems: number;
  averageWishlistSize: number;
  topWishlistedProperties: WishlistProperty[];
  wishlistsByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivity: RecentActivity[];
  userEngagementMetrics: {
    mostActiveUsers: MostActiveUser[];
    averageItemsPerUser: number;
    engagementDistribution: {
      '1-5': number;
      '6-10': number;
      '11-20': number;
      '20+': number;
    };
  };
}

export default function WishlistAnalyticsPage() {
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wishlist statistics
  const fetchWishlistStats = async (showRefresh = false) => {
    try {
      setIsLoading(!showRefresh);
      setRefreshing(showRefresh);
      setError(null);

      const response = await fetch('/api/admin/wishlist-stats?includeActivity=true&includeUserDetails=true&topLimit=10&activityLimit=15', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch wishlist statistics');
      }

      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching wishlist statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wishlist analytics');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Price on request';
  };

  // Export analytics data
  const exportAnalytics = () => {
    if (!stats) return;

    const csvData = [
      ['Wishlist Analytics Report', `Generated on ${new Date().toLocaleDateString('en-IN')}`],
      [''],
      ['Overview Metrics'],
      ['Total Users', stats.totalUsers],
      ['Users with Wishlists', stats.usersWithWishlists],
      ['Total Wishlist Items', stats.totalWishlistItems],
      ['Average Wishlist Size', stats.averageWishlistSize],
      [''],
      ['Top Wishlisted Properties'],
      ['Property ID', 'Title', 'Location', 'Type', 'Price', 'Wishlist Count'],
      ...stats.topWishlistedProperties.map(prop => [
        prop.propertyId,
        prop.property?.title || 'N/A',
        prop.property?.location || 'N/A',
        prop.property?.type || 'N/A',
        prop.property?.price ? formatPrice(prop.property.price) : 'N/A',
        prop.count
      ]),
      [''],
      ['Priority Distribution'],
      ['High Priority', stats.wishlistsByPriority.high],
      ['Medium Priority', stats.wishlistsByPriority.medium],
      ['Low Priority', stats.wishlistsByPriority.low],
      [''],
      ['Most Active Users'],
      ['User ID', 'User Name', 'Wishlist Count'],
      ...stats.userEngagementMetrics.mostActiveUsers.slice(0, 10).map(user => [
        user.userId,
        user.userName || 'N/A',
        user.wishlistCount
      ])
    ];

    const csvContent = csvData.map(row => 
      Array.isArray(row) ? row.map(cell => `"${cell || ''}"`).join(',') : `"${row}"`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wishlist_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get engagement color
  const getEngagementColor = (range: string) => {
    const colors = {
      '1-5': 'bg-yellow-100 text-yellow-800',
      '6-10': 'bg-blue-100 text-blue-800',
      '11-20': 'bg-green-100 text-green-800',
      '20+': 'bg-purple-100 text-purple-800'
    };
    return colors[range as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchWishlistStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Loading wishlist analytics..." />
      </AdminLayout>
    );
  }

  if (error && !stats) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Wishlist Analytics</h1>
          </div>
          <ErrorMessage 
            message={error}
            onRetry={() => fetchWishlistStats()}
          />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later when users start creating wishlists.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wishlist Analytics</h1>
            <p className="text-gray-600">Insights into user preferences and property popularity</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchWishlistStats(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FaClock className="mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={exportAnalytics}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">
                  {stats.usersWithWishlists} with wishlists ({Math.round((stats.usersWithWishlists / stats.totalUsers) * 100)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaHeart className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWishlistItems}</p>
                <p className="text-xs text-gray-500">
                  Avg {stats.averageWishlistSize} per user
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaStar className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">High Priority Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wishlistsByPriority.high}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((stats.wishlistsByPriority.high / stats.totalWishlistItems) * 100)}% of total
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaArrowUp className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.usersWithWishlists / stats.totalUsers) * 100)}%
                </p>
                <p className="text-xs text-gray-500">
                  Users with active wishlists
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Wishlist Priority Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.wishlistsByPriority.high}</div>
              <div className="text-sm text-red-800">High Priority</div>
              <div className="text-xs text-gray-600 mt-1">
                {Math.round((stats.wishlistsByPriority.high / stats.totalWishlistItems) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.wishlistsByPriority.medium}</div>
              <div className="text-sm text-yellow-800">Medium Priority</div>
              <div className="text-xs text-gray-600 mt-1">
                {Math.round((stats.wishlistsByPriority.medium / stats.totalWishlistItems) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.wishlistsByPriority.low}</div>
              <div className="text-sm text-green-800">Low Priority</div>
              <div className="text-xs text-gray-600 mt-1">
                {Math.round((stats.wishlistsByPriority.low / stats.totalWishlistItems) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Top Properties and User Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Wishlisted Properties */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Top Wishlisted Properties</h3>
                <FaFire className="text-orange-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.topWishlistedProperties.slice(0, 5).map((property, index) => (
                  <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {property.property?.title || `Property ${property.propertyId}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {property.property?.location || 'Unknown Location'} • {property.property?.type || 'Property'}
                        </p>
                        {property.property?.price && (
                          <p className="text-xs text-green-600 font-medium">
                            {formatPrice(property.property.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaHeart className="mr-1" />
                        {property.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {stats.topWishlistedProperties.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    And {stats.topWishlistedProperties.length - 5} more properties...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Most Active Users */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Most Active Users</h3>
                <FaStar className="text-yellow-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.userEngagementMetrics.mostActiveUsers.slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {user.userName || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {user.userId.substring(0, 12)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <FaHeart className="mr-1" />
                        {user.wishlistCount}
                      </span>
                      <Link
                        href={`/admin/users/${user.userId}?tab=wishlist`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View User's Wishlist"
                      >
                        <FaEye />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Engagement Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.userEngagementMetrics.engagementDistribution).map(([range, count]) => (
              <div key={range} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{range} items</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getEngagementColor(range)}`}>
                  {Math.round((count / stats.usersWithWishlists) * 100)}% of users
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Wishlist Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activity.action === 'add' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-900">
                        <strong>{activity.userName || 'User'}</strong> {activity.action === 'add' ? 'added' : 'removed'} a property
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}