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
  FaArrowLeft,
  FaLock
} from 'react-icons/fa';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';

interface ClerkUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  provider: string;
  createdAt: string;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  imageUrl?: string;
  phoneNumber?: string | null;
  banned: boolean;
  locked: boolean;
  hasImage: boolean;
  twoFactorEnabled: boolean;
  backupCodeEnabled: boolean;
  totpEnabled: boolean;
  externalAccounts: Array<{
    provider: string;
    emailAddress: string;
  }>;
}

interface UserDetailsProps {
  user: ClerkUser;
  onClose: () => void;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface WishlistItem {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  addedAt: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
}

interface UserDetailsData {
  user: ClerkUser;
  activity: ActivityItem[];
  wishlist: WishlistItem[];
  analytics: {
    totalViews: number;
    uniqueProperties: number;
    averageSessionDuration: number;
  };
}

export function UserDetails({ user, onClose }: UserDetailsProps) {
  const [data, setData] = useState<UserDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'wishlist'>('overview');

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/user-details?userId=${user.id}`, {
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
          totalViews: 0,
          uniqueProperties: 0,
          averageSessionDuration: 0
        }
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user.id]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
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
            className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 max-w-4xl w-full mx-4 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/50 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              {data.user.imageUrl ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={data.user.imageUrl}
                  alt={data.user.name}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <FaUser className="text-gray-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.user.name}</h2>
                <p className="text-gray-600">{data.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-white/30">
          {[
            { id: 'overview', label: 'Overview', icon: FaUser },
            { id: 'activity', label: 'Activity', icon: FaChartLine },
            { id: 'wishlist', label: 'Wishlist', icon: FaHeart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/20 rounded-b-xl">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-mono text-sm">{data.user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(data.user.role)}`}>
                        {data.user.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`flex items-center ${
                        data.user.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.user.banned ? (
                          <><FaLock className="mr-1" /> Banned</>
                        ) : data.user.locked ? (
                          <><FaLock className="mr-1" /> Locked</>
                        ) : data.user.isActive ? (
                          <><FaCheck className="mr-1" /> Active</>
                        ) : (
                          <><FaTimes className="mr-1" /> Inactive</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={`flex items-center ${
                        data.user.emailVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.user.emailVerified ? (
                          <><FaCheck className="mr-1" /> Yes</>
                        ) : (
                          <><FaTimes className="mr-1" /> No</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <h3 className="font-semibold text-gray-900 mb-3">Security</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="text-sm">{data.user.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2FA Enabled:</span>
                      <span className={`flex items-center ${
                        data.user.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {data.user.twoFactorEnabled ? (
                          <><FaLock className="mr-1" /> Yes</>
                        ) : (
                          <><FaTimes className="mr-1" /> No</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-sm">
                        {data.user.phoneNumber || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Activity Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{data.analytics.totalViews}</div>
                    <div className="text-sm text-gray-600">Property Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{data.wishlist.length}</div>
                    <div className="text-sm text-gray-600">Wishlist Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{data.activity.length}</div>
                    <div className="text-sm text-gray-600">Total Activities</div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Created:</span>
                    <span className="text-sm font-medium">{formatDate(data.user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="text-sm font-medium">{formatDate(data.user.lastLoginAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Active:</span>
                    <span className="text-sm font-medium">{formatDate(data.user.lastActiveAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              {data.activity.length > 0 ? (
                <div className="space-y-3">
                  {data.activity.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
                  <p className="mt-1 text-sm text-gray-500">User hasn't performed any tracked activities yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Wishlist ({data.wishlist.length} items)</h3>
              {data.wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                      <p className="font-semibold text-blue-600 mb-2">{item.price}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{item.bedrooms} bed, {item.bathrooms} bath</span>
                        <span>{item.area}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Added: {formatDate(item.addedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaHeart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No wishlist items</h3>
                  <p className="mt-1 text-sm text-gray-500">User hasn't added any properties to their wishlist yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}