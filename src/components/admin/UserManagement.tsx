'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaEnvelope, FaCalendar, FaEye, FaEdit, FaCheck, FaTimes, FaExternalLinkAlt, FaUserCheck, FaBan, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';
import { UserDetails } from './UserDetails';

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

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  providerStats: Record<string, number>;
  bannedUsers: number;
  lockedUsers: number;
  users2FAEnabled: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch users data from Clerk
  const fetchUsers = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch users from Clerk');
      }

      setUsers(data.users);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching Clerk users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm);
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

  // Get provider badge color and display name
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

  // Get user status
  const getUserStatus = (user: ClerkUser) => {
    if (user.banned) return { status: 'Banned', color: 'text-red-600', icon: FaBan };
    if (user.locked) return { status: 'Locked', color: 'text-orange-600', icon: FaLock };
    if (user.isActive) return { status: 'Active', color: 'text-green-600', icon: FaCheck };
    return { status: 'Inactive', color: 'text-gray-600', icon: FaTimes };
  };

  if (isLoading && users.length === 0) {
    return <LoadingSpinner message="Loading Clerk users..." />;
  }

  if (error && users.length === 0) {
    // Check if this is a Clerk configuration error
    const isClerkConfigError = error.includes('Clerk configuration') || error.includes('CLERK_SECRET_KEY');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clerk User Management</h1>
            <p className="text-gray-600">Manage and monitor Clerk authenticated users</p>
          </div>
        </div>
        
        {isClerkConfigError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaBan className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Clerk Configuration Required
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-3">{error}</p>
                  <div className="bg-red-100 p-3 rounded border">
                    <h4 className="font-medium mb-2">To Fix This Issue:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-red-800 underline font-medium">Clerk Dashboard</a></li>
                      <li>Navigate to API Keys section</li>
                      <li>Copy your <strong>Secret key</strong> (starts with sk_live_...)</li>
                      <li>Copy your <strong>Publishable key</strong> (starts with pk_live_...)</li>
                      <li>Set these in your production environment variables:</li>
                    </ol>
                    <div className="mt-2 p-2 bg-red-200 rounded font-mono text-xs">
                      CLERK_SECRET_KEY=sk_live_your_actual_key<br/>
                      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => fetchUsers()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry Connection
                  </button>
                  <a
                    href="/api/admin/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-red-200 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaExternalLinkAlt className="mr-1" />
                    Check System Health
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ErrorMessage 
            message={error}
            onRetry={() => fetchUsers()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clerk User Management</h1>
          <p className="text-gray-600">Manage and monitor Clerk authenticated users</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FaLock />
          <span>Admin authenticated via Firebase</span>
          <span>•</span>
          <span>Users from Clerk</span>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUser className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheck className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUserCheck className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.verifiedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaCalendar className="text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.newUsersThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaLock className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">2FA Enabled</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.users2FAEnabled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaBan className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Banned</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.bannedUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const providerInfo = getProviderInfo(user.provider);
                const userStatus = getUserStatus(user);
                const StatusIcon = userStatus.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.imageUrl}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">ID: {user.id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <StatusIcon className={`mr-2 ${userStatus.color}`} />
                          <span className={`text-sm ${userStatus.color}`}>
                            {userStatus.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <FaCheck className="mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <FaTimes className="mr-1" /> Unverified
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${providerInfo.color}`}>
                        {providerInfo.name}
                      </span>
                      {user.externalAccounts.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{user.externalAccounts.length - 1} more
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {user.twoFactorEnabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FaLock className="mr-1" /> 2FA
                          </span>
                        )}
                        {user.phoneNumber && (
                          <span className="text-xs text-gray-500">
                            Phone verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-sm">{formatDate(user.lastActiveAt)}</div>
                        <div className="text-xs text-gray-500">
                          Joined: {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <a
                          href={`https://dashboard.clerk.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                          title="View in Clerk Dashboard"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <FaUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No users have signed up yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}