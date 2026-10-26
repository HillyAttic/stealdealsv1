'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaUser, FaCalendar, FaEye, FaCheck, FaTimes, FaExternalLinkAlt, FaUserCheck, FaBan, FaLock, FaHeart, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import Link from 'next/link';

interface FirebaseUser {
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
  lastWishlistActivity?: string | null;
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

const SHELL = 'cobalt-page';

const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google',
  oauth_github: 'GitHub',
  oauth_facebook: 'Facebook',
  email: 'Email',
};

export function UserManagement() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
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
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // Enhanced filtering and sorting
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'wishlistCount' | 'lastLoginAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [wishlistFilter, setWishlistFilter] = useState<'all' | 'with_wishlist' | 'without_wishlist'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');

  // Fetch users data from Firebase Auth
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

      console.log('[UserManagement] API Response:', {
        ok: response.ok,
        status: response.status,
        success: data.success,
        error: data.error,
        details: data.details,
        userCount: data.users?.length
      });

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.details || 'Failed to fetch users from Firebase';
        console.error('[UserManagement] Fetch failed:', errorMessage);
        throw new Error(errorMessage);
      }

      setUsers(data.users);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching Firebase users:', err);
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

  // Handle sorting
  const handleSort = (column: 'name' | 'email' | 'createdAt' | 'wishlistCount' | 'lastLoginAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get sorted and filtered users
  const getSortedAndFilteredUsers = () => {
    let filteredUsers = [...users];

    // Apply wishlist filter
    if (wishlistFilter === 'with_wishlist') {
      filteredUsers = filteredUsers.filter(user => user.wishlistCount > 0);
    } else if (wishlistFilter === 'without_wishlist') {
      filteredUsers = filteredUsers.filter(user => user.wishlistCount === 0);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filteredUsers = filteredUsers.filter(user => user.isActive);
    } else if (statusFilter === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !user.isActive && !user.banned);
    } else if (statusFilter === 'banned') {
      filteredUsers = filteredUsers.filter(user => user.banned);
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'wishlistCount':
          aValue = a.wishlistCount;
          bValue = b.wishlistCount;
          break;
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredUsers;
  };

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <FaSort className="sort-icon" aria-hidden="true" />;
    return sortOrder === 'asc'
      ? <FaSortUp className="sort-icon is-on" aria-hidden="true" />
      : <FaSortDown className="sort-icon is-on" aria-hidden="true" />;
  };

  const ariaSort = (column: string) =>
    sortBy === column ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

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

  // Get provider display name
  const providerName = (provider: string) => PROVIDER_NAMES[provider] || provider || 'Unknown';

  // Get user status
  const getUserStatus = (user: FirebaseUser) => {
    if (user.banned) return { status: 'Banned', tone: 'error', icon: FaBan };
    if (user.locked) return { status: 'Locked', tone: 'warn', icon: FaLock };
    if (user.isActive) return { status: 'Active', tone: 'ok', icon: FaCheck };
    return { status: 'Inactive', tone: 'muted', icon: FaTimes };
  };

  // Handle image load error - mark as broken to show fallback
  const handleImageError = useCallback((userId: string) => {
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  const pctOf = (n: number) =>
    statistics?.totalUsers ? `${Math.round((n / statistics.totalUsers) * 100)}% of users` : 'No users yet';

  if (isLoading && users.length === 0) {
    return (
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <div className="admin-skeleton h-7 w-40 mb-2" />
            <div className="admin-skeleton h-4 w-72" />
          </div>
        </header>
        <div className="stat-grid stat-grid--six">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel stat">
              <div className="admin-skeleton h-3 w-24 mb-4" />
              <div className="admin-skeleton h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="admin-skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    // Check if this is a Firebase configuration error
    const isFirebaseConfigError = error.includes('Firebase configuration') || error.includes('FIREBASE_SERVICE_ACCOUNT_KEY');

    return (
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-sub">Manage and monitor Firebase authenticated users</p>
          </div>
        </header>

        {isFirebaseConfigError ? (
          <section className="panel panel--error">
            <header className="panel-head">
              <FaBan className="panel-icon" size={18} aria-hidden="true" />
              <div>
                <h2 className="panel-title">Firebase configuration required</h2>
                <p className="panel-sub">{error}</p>
              </div>
            </header>

            <p className="muted-note">To fix this issue:</p>
            <ol className="error-list">
              <li>Open the <a className="link" href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
              <li>Go to Project Settings {'>'} Service Accounts</li>
              <li>Generate a new private key (downloads a JSON file)</li>
              <li>Set the entire JSON content as the environment variable</li>
              <li>Or place the file as <code className="code">service-account.json</code> in the project root</li>
            </ol>
            <pre className="code code--block">FIREBASE_SERVICE_ACCOUNT_KEY=&#123;...json content...&#125;</pre>

            <div className="panel-actions">
              <button
                onClick={() => fetchUsers()}
                className="btn btn--primary"
              >
                Retry connection
              </button>
              <a
                href="/api/admin/health"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                <FaExternalLinkAlt aria-hidden="true" />
                System health
              </a>
            </div>
          </section>
        ) : (
          <section className="panel">
            <div className="empty">
              <FaBan size={24} aria-hidden="true" />
              <p className="empty-title">Could not load users</p>
              <p className="empty-hint">{error}</p>
              <button onClick={() => fetchUsers()} className="btn btn--primary">
                Try again
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  const visibleUsers = getSortedAndFilteredUsers();

  return (
    <div data-theme="cobalt" className={SHELL}>
      <header className="page-head">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Manage and monitor Firebase authenticated users</p>
        </div>
        <p className="page-head-meta">
          <FaLock aria-hidden="true" />
          Authenticated via Firebase
        </p>
      </header>

      {/* Statistics */}
      {statistics && (
        <div className="stat-grid stat-grid--six">
          <div className="panel stat">
            <p className="stat-label"><FaUser size={14} aria-hidden="true" /> Total Users</p>
            <p className="stat-value">{statistics.totalUsers}</p>
            <p className="stat-foot">All accounts</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaCheck size={14} aria-hidden="true" /> Active</p>
            <p className="stat-value">{statistics.activeUsers}</p>
            <p className="stat-foot">{pctOf(statistics.activeUsers)}</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaUserCheck size={14} aria-hidden="true" /> Verified</p>
            <p className="stat-value">{statistics.verifiedUsers}</p>
            <p className="stat-foot">{pctOf(statistics.verifiedUsers)}</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaCalendar size={14} aria-hidden="true" /> New This Month</p>
            <p className="stat-value">{statistics.newUsersThisMonth}</p>
            <p className="stat-foot">Last 30 days</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaLock size={14} aria-hidden="true" /> 2FA Enabled</p>
            <p className="stat-value">{statistics.users2FAEnabled}</p>
            <p className="stat-foot">{pctOf(statistics.users2FAEnabled)}</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaBan size={14} aria-hidden="true" /> Banned</p>
            <p className="stat-value">{statistics.bannedUsers}</p>
            <p className="stat-foot">{pctOf(statistics.bannedUsers)}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <section className="panel panel--filters">
        <form onSubmit={handleSearch} className="filters">
          <div className="field field--grow">
            <label htmlFor="user-search" className="field-label">Search</label>
            <div className="search">
              <FaSearch className="search-icon" aria-hidden="true" />
              <input
                id="user-search"
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn--primary"
          >
            {isLoading ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div className="filters filters--secondary">
          <span className="filters-label">
            <FaFilter aria-hidden="true" />
            Filters
          </span>

          <div className="field">
            <label htmlFor="status-filter" className="field-label">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="wishlist-filter" className="field-label">Wishlist</label>
            <select
              id="wishlist-filter"
              value={wishlistFilter}
              onChange={(e) => setWishlistFilter(e.target.value as any)}
              className="select"
            >
              <option value="all">All Users</option>
              <option value="with_wishlist">With Wishlist</option>
              <option value="without_wishlist">No Wishlist</option>
            </select>
          </div>

          {(statusFilter !== 'all' || wishlistFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setWishlistFilter('all');
              }}
              className="btn btn--quiet"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Users Table */}
      <section className="panel panel--flush">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th aria-sort={ariaSort('name')}>
                  <button type="button" className="sort" onClick={() => handleSort('name')}>
                    User
                    {getSortIcon('name')}
                  </button>
                </th>
                <th>Status</th>
                <th aria-sort={ariaSort('wishlistCount')}>
                  <button type="button" className="sort" onClick={() => handleSort('wishlistCount')}>
                    <FaHeart className="heart" aria-hidden="true" />
                    Wishlist
                    {getSortIcon('wishlistCount')}
                  </button>
                </th>
                <th>Provider</th>
                <th>Security</th>
                <th aria-sort={ariaSort('lastLoginAt')}>
                  <button type="button" className="sort" onClick={() => handleSort('lastLoginAt')}>
                    Last Active
                    {getSortIcon('lastLoginAt')}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const userStatus = getUserStatus(user);
                const StatusIcon = userStatus.icon;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="identity">
                        {user.imageUrl && !brokenImages.has(user.id) ? (
                          <img
                            className="avatar-img"
                            src={user.imageUrl}
                            alt={user.name}
                            onError={() => handleImageError(user.id)}
                          />
                        ) : (
                          <div className="avatar-img avatar-img--fallback">
                            <FaUser aria-hidden="true" />
                          </div>
                        )}
                        <div className="identity-text">
                          <p className="identity-name">{user.name}</p>
                          <p className="identity-mail">{user.email}</p>
                          <p className="identity-id">ID: {user.id.substring(0, 12)}…</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <p className={`status status--${userStatus.tone}`}>
                        <StatusIcon aria-hidden="true" />
                        {userStatus.status}
                      </p>
                      <div className="badge-row">
                        {user.emailVerified ? (
                          <span className="badge badge--accent"><FaCheck aria-hidden="true" /> Verified</span>
                        ) : (
                          <span className="badge badge--error"><FaTimes aria-hidden="true" /> Unverified</span>
                        )}
                        <span className="badge">{user.role}</span>
                      </div>
                    </td>

                    <td>
                      <div className="wishlist-cell">
                        <span className="num">{user.wishlistCount}</span>
                        {user.wishlistCount > 0 && (
                          <Link href={`/admin/users/${user.id}?tab=wishlist`} className="link">
                            View
                          </Link>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="badge">{providerName(user.provider)}</span>
                      {user.externalAccounts.length > 1 && (
                        <p className="muted-note">+{user.externalAccounts.length - 1} more</p>
                      )}
                    </td>

                    <td>
                      <div className="badge-row">
                        {user.twoFactorEnabled && (
                          <span className="badge badge--accent"><FaLock aria-hidden="true" /> 2FA</span>
                        )}
                      </div>
                      {user.phoneNumber && <p className="muted-note">Phone verified</p>}
                    </td>

                    <td>
                      <p className="identity-name">{formatDate(user.lastActiveAt)}</p>
                      <p className="muted-note">Joined: {formatDate(user.createdAt)}</p>
                    </td>

                    <td>
                      <div className="row-actions">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="icon-link"
                          title="View details"
                          aria-label={`View details for ${user.name}`}
                        >
                          <FaEye />
                        </Link>
                        <a
                          href="https://dashboard.clerk.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                          title="View in Clerk dashboard"
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

        {visibleUsers.length === 0 && !isLoading && (
          <div className="empty">
            <FaUser size={24} aria-hidden="true" />
            <p className="empty-title">No users found</p>
            <p className="empty-hint">
              {searchTerm || statusFilter !== 'all' || wishlistFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'No users have signed up yet.'}
            </p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <p className="pager-info">
            Showing{' '}
            <strong>{(pagination.page - 1) * pagination.limit + 1}</strong>
            {' '}to{' '}
            <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong>
            {' '}of <strong>{pagination.total}</strong> users
          </p>
          <div className="pager-controls">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="btn"
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
                  aria-current={pageNumber === pagination.page ? 'page' : undefined}
                  className={`btn pager-page ${pageNumber === pagination.page ? 'is-current' : ''}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="btn"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
