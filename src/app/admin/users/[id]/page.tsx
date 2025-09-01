'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useParams, useRouter } from 'next/navigation';
import { UserWishlistView } from '@/components/admin/UserWishlistView';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import { FaUser, FaEnvelope, FaCalendar, FaHeart, FaEye, FaPhone, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

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
  totalViews: number;
  wishlistCount: number;
}

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<ClerkUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist'>('overview');

  const handleClose = () => {
    router.push('/admin/users');
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user from the users list API with search by ID
      const response = await fetch(`/api/admin/users?search=${userId}&limit=1`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user details');
      }

      // Find the user in the response
      const foundUser = data.users.find((u: ClerkUser) => u.id === userId);
      if (!foundUser) {
        throw new Error('User not found');
      }

      setUser(foundUser);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Get provider badge styling
  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'google':
        return { color: 'bg-red-100 text-red-800', name: 'Google' };
      case 'oauth_github':
        return { color: 'bg-gray-100 text-gray-800', name: 'GitHub' };
      case 'oauth_facebook':
        return { color: 'bg-blue-100 text-blue-800', name: 'Facebook' };
      case 'email':
        return { color: 'bg-green-100 text-green-800', name: 'Email' };
      default:
        return { color: 'bg-gray-100 text-gray-800', name: provider || 'Unknown' };
    }
  };

  // Get user status
  const getUserStatus = (user: ClerkUser) => {
    if (user.banned) return { status: 'Banned', color: 'text-red-600', bgColor: 'bg-red-100', icon: FaTimes };
    if (user.locked) return { status: 'Locked', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: FaTimes };
    if (user.isActive) return { status: 'Active', color: 'text-green-600', bgColor: 'bg-green-100', icon: FaCheck };
    return { status: 'Inactive', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FaTimes };
  };

  useEffect(() => {
    fetchUserDetails();
    
    // Check for tab parameter in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'wishlist') {
        setActiveTab('wishlist');
      }
    }
  }, [userId]);

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Loading user details..." />
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <button
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Users
            </button>
          </div>
          <ErrorMessage 
            message={error || 'User not found'}
            onRetry={fetchUserDetails}
          />
        </div>
      </AdminLayout>
    );
  }

  const providerInfo = getProviderInfo(user.provider);
  const userStatus = getUserStatus(user);
  const StatusIcon = userStatus.icon;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">Comprehensive view of user profile and activity</p>
          </div>
          <button
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Users
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.imageUrl ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={user.imageUrl}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <FaUser className="text-gray-600 text-2xl" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {user.id}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userStatus.color} ${userStatus.bgColor}`}>
                      <StatusIcon className="mr-1" />
                      {userStatus.status}
                    </span>
                    {user.emailVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaCheck className="mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user.wishlistCount || 0}</div>
                    <div className="text-sm text-blue-800">Wishlist Items</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user.totalViews || 0}</div>
                    <div className="text-sm text-green-800">Property Views</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-purple-800">Days Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="border-t bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${providerInfo.color}`}>
                      {providerInfo.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Role:</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Login:</span>
                    <span>{formatDate(user.lastLoginAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Active:</span>
                    <span>{formatDate(user.lastActiveAt)}</span>
                  </div>
                </div>
              </div>

              {/* Security & Verification */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Security</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Email Verified:</span>
                    <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2FA Enabled:</span>
                    <span className={user.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}>
                      {user.twoFactorEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {user.externalAccounts.length > 1 && (
                    <div className="flex items-center justify-between">
                      <span>Connected Accounts:</span>
                      <span>{user.externalAccounts.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="mt-6 pt-6 border-t">
              <a
                href={`https://dashboard.clerk.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                <FaExternalLinkAlt className="mr-2" />
                View in Clerk Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaEye className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'wishlist'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaHeart className="inline mr-2" />
                Wishlist ({user.wishlistCount || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">User Overview</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    User activity overview, analytics, and engagement metrics coming soon.
                  </p>
                </div>
              </div>
            ) : (
              <UserWishlistView 
                userId={user.id}
                userName={user.name}
                userEmail={user.email}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}