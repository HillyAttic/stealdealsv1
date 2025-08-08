'use client';

import { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaEye, 
  FaHeart, 
  FaSearch, 
  FaDownload, 
  FaTimes, 
  FaCheck,
  FaChartLine,
  FaClock,
  FaMapMarkerAlt,
  FaHome,
  FaArrowLeft
} from 'react-icons/fa';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import { 
  User, 
  UserActivity, 
  WishlistProperty, 
  UserAnalytics,
  PropertyView,
  SearchQuery,
  EngagementData
} from '@/types/auth';

interface UserDetailsProps {
  userId: string;
  onClose: () => void;
}

interface UserDetailsData {
  user: User;
  activity: UserActivity[];
  wishlist: WishlistProperty[];
  analytics: UserAnalytics;
  viewHistory: PropertyView[];
  searchHistory: SearchQuery[];
  engagementMetrics: EngagementData;
}

export function UserDetails({ userId, onClose }: UserDetailsProps) {
  const [data, setData] = useState<UserDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'wishlist' | 'analytics'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch user details');
      }

      setData({
        user: result.user,
        activity: result.activity || [],
        wishlist: result.wishlist || [],
        analytics: result.analytics || {
          userId,
          totalViews: 0,
          uniqueProperties: 0,
          averageSessionDuration: 0,
          favoritePropertyTypes: [],
          preferredLocations: [],
          activityByDay: [],
          conversionMetrics: {
            propertyViews: 0,
            wishlistAdds: 0,
            contactInquiries: 0,
            conversionRate: 0
          }
        },
        viewHistory: result.viewHistory || [],
        searchHistory: result.searchHistory || [],
        engagementMetrics: result.engagementMetrics || {
          totalSessions: 0,
          averageSessionDuration: 0,
          pagesPerSession: 0,
          bounceRate: 0
        }
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  // Export user data
  const handleExportData = async () => {
    if (!data) return;
    
    try {
      setIsExporting(true);
      
      // Create export data
      const exportData = {
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          emailVerified: data.user.emailVerified,
          provider: data.user.provider,
          createdAt: data.user.createdAt,
          lastLoginAt: data.user.lastLoginAt,
          preferences: data.user.preferences
        },
        activity: data.activity,
        wishlist: data.wishlist,
        analytics: data.analytics,
        viewHistory: data.viewHistory,
        searchHistory: data.searchHistory,
        engagementMetrics: data.engagementMetrics,
        exportedAt: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-${data.user.id}-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting user data:', err);
      setError('Failed to export user data');
    } finally {
      setIsExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get provider badge color
  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'bg-red-100 text-red-800';
      case 'email':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <LoadingSpinner message="Loading user details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <ErrorMessage 
            message={error}
            onRetry={fetchUserDetails}
          />
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <p className="text-gray-600">{data.user.name} ({data.user.email})</p>
            </div>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FaDownload />
            <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
          </button>
        </div>

        {/* User Overview */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUser className="text-gray-600 text-xl" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(data.user.role)}`}>
                    {data.user.role}
                  </span>
                  {data.user.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <FaCheck className="mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      <FaTimes className="mr-1" />
                      Inactive
                    </span>
                  )}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderBadgeColor(data.user.provider)}`}>
                    {data.user.provider}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Joined</div>
                <div className="text-sm font-medium">{formatDate(data.user.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Login</div>
                <div className="text-sm font-medium">{formatDate(data.user.lastLoginAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'overview', label: 'Overview', icon: <FaUser /> },
            { key: 'activity', label: 'Activity', icon: <FaEye /> },
            { key: 'wishlist', label: 'Wishlist', icon: <FaHeart /> },
            { key: 'analytics', label: 'Analytics', icon: <FaChartLine /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab data={data} formatDate={formatDate} />
          )}
          {activeTab === 'activity' && (
            <ActivityTab data={data} formatDate={formatDate} />
          )}
          {activeTab === 'wishlist' && (
            <WishlistTab data={data} formatDate={formatDate} getPriorityBadgeColor={getPriorityBadgeColor} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab data={data} formatDuration={formatDuration} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data, formatDate }: { data: UserDetailsData; formatDate: (date: string | Date) => string }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaEye className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-xl font-bold text-gray-900">{data.analytics.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaHeart className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Wishlist Items</p>
              <p className="text-xl font-bold text-gray-900">{data.wishlist.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaHome className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Unique Properties</p>
              <p className="text-xl font-bold text-gray-900">{data.analytics.uniqueProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaClock className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(data.analytics.averageSessionDuration)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Property Types</h4>
            <div className="flex flex-wrap gap-2">
              {data.user.preferences.propertyTypes.length > 0 ? (
                data.user.preferences.propertyTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No preferences set</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Locations</h4>
            <div className="flex flex-wrap gap-2">
              {data.user.preferences.locations.length > 0 ? (
                data.user.preferences.locations.map((location, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <FaMapMarkerAlt className="inline mr-1" />
                    {location}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No preferences set</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
            <div className="text-sm text-gray-900">
              ₹{data.user.preferences.priceRange.min.toLocaleString()} - ₹{data.user.preferences.priceRange.max.toLocaleString()}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notifications</h4>
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${data.user.preferences.notifications.email ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Email notifications
              </div>
              <div className="flex items-center text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${data.user.preferences.notifications.newProperties ? 'bg-green-500' : 'bg-red-500'}`}></span>
                New properties
              </div>
              <div className="flex items-center text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${data.user.preferences.notifications.priceAlerts ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Price alerts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Summary</h3>
        <div className="space-y-3">
          {data.activity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'property_view' ? 'bg-blue-100' :
                  activity.type === 'wishlist_add' ? 'bg-red-100' :
                  activity.type === 'search' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'property_view' && <FaEye className="text-blue-600" />}
                  {activity.type === 'wishlist_add' && <FaHeart className="text-red-600" />}
                  {activity.type === 'search' && <FaSearch className="text-green-600" />}
                  {activity.type === 'contact_inquiry' && <FaEnvelope className="text-purple-600" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.propertyId && `Property ID: ${activity.propertyId}`}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(activity.timestamp)}
              </div>
            </div>
          ))}
          {data.activity.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ data, formatDate }: { data: UserDetailsData; formatDate: (date: string | Date) => string }) {
  const [activityFilter, setActivityFilter] = useState<string>('all');
  
  const filteredActivity = data.activity.filter(activity => 
    activityFilter === 'all' || activity.type === activityFilter
  );

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'property_view', label: 'Property Views' },
    { value: 'wishlist_add', label: 'Wishlist Adds' },
    { value: 'wishlist_remove', label: 'Wishlist Removes' },
    { value: 'search', label: 'Searches' },
    { value: 'contact_inquiry', label: 'Contact Inquiries' }
  ];

  return (
    <div className="space-y-6">
      {/* Activity Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by type:</label>
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredActivity.length} activities
        </span>
      </div>

      {/* Activity List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredActivity.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'property_view' ? 'bg-blue-100' :
                        activity.type === 'wishlist_add' ? 'bg-red-100' :
                        activity.type === 'wishlist_remove' ? 'bg-orange-100' :
                        activity.type === 'search' ? 'bg-green-100' :
                        activity.type === 'contact_inquiry' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'property_view' && <FaEye className="text-blue-600" />}
                        {(activity.type === 'wishlist_add' || activity.type === 'wishlist_remove') && <FaHeart className={activity.type === 'wishlist_add' ? 'text-red-600' : 'text-orange-600'} />}
                        {activity.type === 'search' && <FaSearch className="text-green-600" />}
                        {activity.type === 'contact_inquiry' && <FaEnvelope className="text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {activity.propertyId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Property ID: {activity.propertyId}
                          </div>
                        )}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Session: {activity.sessionId} | IP: {activity.ipAddress}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No activity found for the selected filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wishlist Tab Component
function WishlistTab({ 
  data, 
  formatDate, 
  getPriorityBadgeColor 
}: { 
  data: UserDetailsData; 
  formatDate: (date: string | Date) => string;
  getPriorityBadgeColor: (priority: string) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Wishlist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaHeart className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{data.wishlist.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaCalendar className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-gray-900">
                {data.wishlist.filter(item => item.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaHome className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{data.wishlist.length > 0 ? Math.round(data.wishlist.reduce((sum, item) => sum + item.price, 0) / data.wishlist.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {data.wishlist.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {data.wishlist.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaHome className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-semibold text-green-600">
                              ₹{item.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <FaMapMarkerAlt className="mr-1" />
                              {item.location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(item.priority)}`}>
                              {item.priority} priority
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.type}
                            </span>
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Notes:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Added {formatDate(item.addedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FaHeart className="mx-auto text-4xl text-gray-300 mb-4" />
            <p>No items in wishlist</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ 
  data, 
  formatDuration 
}: { 
  data: UserDetailsData; 
  formatDuration: (seconds: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaEye className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-xl font-bold text-gray-900">{data.engagementMetrics.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaClock className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-xl font-bold text-gray-900">
                {formatDuration(data.engagementMetrics.averageSessionDuration)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaChartLine className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pages/Session</p>
              <p className="text-xl font-bold text-gray-900">{data.engagementMetrics.pagesPerSession.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaChartLine className="text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Bounce Rate</p>
              <p className="text-xl font-bold text-gray-900">{(data.engagementMetrics.bounceRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Type Preferences */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Preferences</h3>
        {data.analytics.favoritePropertyTypes.length > 0 ? (
          <div className="space-y-3">
            {data.analytics.favoritePropertyTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-900">{type.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{type.count} views</span>
                  <span className="text-sm font-semibold text-blue-600">{type.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No property type data available
          </div>
        )}
      </div>

      {/* Location Preferences */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Preferences</h3>
        {data.analytics.preferredLocations.length > 0 ? (
          <div className="space-y-3">
            {data.analytics.preferredLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    {location.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{location.count} views</span>
                  <span className="text-sm font-semibold text-green-600">{location.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No location data available
          </div>
        )}
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Property Views</span>
                <span className="text-sm font-semibold">{data.analytics.conversionMetrics.propertyViews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Wishlist Adds</span>
                <span className="text-sm font-semibold">{data.analytics.conversionMetrics.wishlistAdds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contact Inquiries</span>
                <span className="text-sm font-semibold">{data.analytics.conversionMetrics.contactInquiries}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(data.analytics.conversionMetrics.conversionRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}