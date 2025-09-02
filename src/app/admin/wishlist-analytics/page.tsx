'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import { FaHeart, FaUsers, FaChartBar, FaArrowUp, FaEye, FaDownload, FaClock, FaFire, FaStar, FaBolt, FaMapMarkerAlt, FaUserClock } from 'react-icons/fa';
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
  userEmail?: string;
  action: 'add' | 'remove';
  propertyId: string;
  timestamp: string;
}

interface MostActiveUser {
  userId: string;
  userName?: string;
  userEmail?: string;
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
  activityTrends: {
    totalActivitiesToday: number;
    addActionsToday: number;
    removeActionsToday: number;
    dailyActivityTrend: Array<{
      date: string;
      totalActivities: number;
      adds: number;
      removes: number;
    }>;
    hourlyPattern: Array<{
      hour: number;
      activities: number;
    }>;
  };
  realTimeMetrics: {
    activeUsersLastHour: number;
    propertiesAddedLastHour: number;
    propertiesRemovedLastHour: number;
    popularPropertyTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    locationTrends: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
  };
}

export default function WishlistAnalyticsPage() {
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

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
      setLastUpdated(new Date());
      setError(null); // Clear any previous errors on successful fetch
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
      ['User ID', 'User Name', 'Email', 'Wishlist Count'],
      ...stats.userEngagementMetrics.mostActiveUsers.slice(0, 10).map(user => [
        user.userId,
        user.userName || 'N/A',
        user.userEmail || 'N/A',
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

  // Auto-refresh functionality
  useEffect(() => {
    fetchWishlistStats();

    // Set up auto-refresh interval
    let refreshInterval: NodeJS.Timeout;
    
    if (autoRefreshEnabled) {
      refreshInterval = setInterval(() => {
        fetchWishlistStats(true); // Background refresh
      }, 30000); // Refresh every 30 seconds
    }

    // Cleanup function
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefreshEnabled]);

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  };

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
            <p className="text-gray-600">Real-time insights into user preferences and property popularity</p>
            {lastUpdated && (
              <div className="text-sm text-gray-500 mt-1">
                Last updated: {formatLastUpdated(lastUpdated)}
                {autoRefreshEnabled && (
                  <span className="ml-2 inline-flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </span>
                )}
                {refreshing && !isLoading && (
                  <span className="ml-2 inline-flex items-center text-blue-600">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    Updating...
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefreshEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
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
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {user.userEmail && !user.userEmail.includes('@system.local') 
                              ? user.userEmail 
                              : `${user.userName?.toLowerCase().replace(/\s+/g, '.') || 'user'}@verified.user`
                            }
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">
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

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaBolt className="text-yellow-500" />
                  <h3 className="text-lg font-medium text-gray-900">Today's Activity</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.activityTrends.totalActivitiesToday}</div>
                  <div className="text-sm text-blue-800">Total Activities</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.activityTrends.addActionsToday}</div>
                  <div className="text-sm text-green-800">Properties Added</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.activityTrends.removeActionsToday}</div>
                  <div className="text-sm text-red-800">Properties Removed</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Last Hour Activity</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">{stats.realTimeMetrics.activeUsersLastHour}</div>
                    <div className="text-xs text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{stats.realTimeMetrics.propertiesAddedLastHour}</div>
                    <div className="text-xs text-gray-600">Added</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{stats.realTimeMetrics.propertiesRemovedLastHour}</div>
                    <div className="text-xs text-gray-600">Removed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Property Types */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Popular Property Types</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.realTimeMetrics.popularPropertyTypes.slice(0, 6).map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{type.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">{type.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Trends and Daily Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Trends */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Top Locations</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.realTimeMetrics.locationTrends.slice(0, 6).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{location.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Activity Trend */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">7-Day Activity Trend</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.activityTrends.dailyActivityTrend.map((day) => (
                  <div key={day.date} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 w-20">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">{day.adds}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">{day.removes}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{day.totalActivities}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Added</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Removed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaUserClock className="text-blue-500" />
                  <h3 className="text-lg font-medium text-gray-900">Recent Wishlist Activity</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Real-time</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-500">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                        activity.action === 'add' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        <span className="text-xs font-bold">{activity.action === 'add' ? '+' : '−'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {activity.userName || 'Anonymous User'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {activity.action === 'add' ? 'added a property to wishlist' : 'removed a property from wishlist'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-blue-600 bg-white px-2 py-1 rounded border">
                            {activity.userEmail && !activity.userEmail.includes('@system.local') 
                              ? activity.userEmail 
                              : `${activity.userName?.toLowerCase().replace(/\s+/g, '.') || 'user'}@verified.user`
                            }
                          </span>
                          <span className="text-xs text-gray-400">
                            Property ID: {activity.propertyId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0 ml-4 text-right">
                      <div>{formatDate(activity.timestamp)}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {stats.recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <FaUserClock className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">No recent activity to show</p>
                  <p className="text-xs text-gray-400 mt-1">Activity will appear here as users add or remove properties</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}