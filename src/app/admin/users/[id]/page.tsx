'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserWishlistView } from '@/components/admin/UserWishlistView';
import { FaUser, FaHeart, FaEye, FaCheck, FaTimes, FaExternalLinkAlt, FaBan } from 'react-icons/fa';

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
}

const SHELL = 'cobalt-page';

const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google',
  oauth_github: 'GitHub',
  oauth_facebook: 'Facebook',
  email: 'Email',
};

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<FirebaseUser | null>(null);
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

      // Fetch user from the dedicated user details API
      const response = await fetch(`/api/admin/users/${userId}`, {
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

      setUser(data.user);
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

  // Get provider display name
  const providerName = (provider: string) => PROVIDER_NAMES[provider] || provider || 'Unknown';

  // Get user status
  const getUserStatus = (user: FirebaseUser) => {
    if (user.banned) return { status: 'Banned', tone: 'error', icon: FaTimes };
    if (user.locked) return { status: 'Locked', tone: 'warn', icon: FaTimes };
    if (user.isActive) return { status: 'Active', tone: 'ok', icon: FaCheck };
    return { status: 'Inactive', tone: 'muted', icon: FaTimes };
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
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <div className="admin-skeleton h-7 w-44 mb-2" />
            <div className="admin-skeleton h-4 w-72" />
          </div>
        </header>
        <div className="panel">
          <div className="profile">
            <div className="admin-skeleton profile-avatar" />
            <div className="profile-main">
              <div className="admin-skeleton h-6 w-48 mb-3" />
              <div className="admin-skeleton h-4 w-64 mb-2" />
              <div className="admin-skeleton h-4 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <h1 className="page-title">User Details</h1>
            <p className="page-sub">Comprehensive view of user profile and activity</p>
          </div>
          <button onClick={handleClose} className="btn">
            Back to users
          </button>
        </header>
        <section className="panel">
          <div className="empty">
            <FaBan size={24} aria-hidden="true" />
            <p className="empty-title">User not found</p>
            <p className="empty-hint">{error || 'This user could not be loaded.'}</p>
            <button className="btn btn--primary" onClick={fetchUserDetails}>
              Try again
            </button>
          </div>
        </section>
      </div>
    );
  }

  const userStatus = getUserStatus(user);
  const StatusIcon = userStatus.icon;
  const statusBadge =
    userStatus.tone === 'error' ? 'badge badge--error'
      : userStatus.tone === 'ok' ? 'badge badge--accent'
        : 'badge';

  const daysActive = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div data-theme="cobalt" className={SHELL}>
      <header className="page-head">
        <div>
          <h1 className="page-title">User Details</h1>
          <p className="page-sub">Comprehensive view of user profile and activity</p>
        </div>
        <button onClick={handleClose} className="btn">
          Back to users
        </button>
      </header>

      {/* Profile */}
      <section className="panel">
        <div className="profile">
          {user.imageUrl ? (
            <img className="profile-avatar" src={user.imageUrl} alt={user.name} />
          ) : (
            <div className="profile-avatar profile-avatar--fallback">
              <FaUser aria-hidden="true" />
            </div>
          )}

          <div className="profile-main">
            <div className="profile-top">
              <div>
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-mail">{user.email}</p>
                <p className="profile-id">ID: {user.id}</p>
              </div>
              <div className="profile-badges">
                <span className={statusBadge}>
                  <StatusIcon aria-hidden="true" />
                  {userStatus.status}
                </span>
                {user.emailVerified && (
                  <span className="badge badge--accent">
                    <FaCheck aria-hidden="true" />
                    Verified
                  </span>
                )}
                <span className="badge">{user.role}</span>
              </div>
            </div>

            <div className="quick-stats">
              <div className="quick-stat">
                <p className="quick-stat-value">{user.wishlistCount || 0}</p>
                <p className="quick-stat-label">Wishlist items</p>
              </div>
              <div className="quick-stat">
                <p className="quick-stat-value">{user.totalViews || 0}</p>
                <p className="quick-stat-label">Property views</p>
              </div>
              <div className="quick-stat">
                <p className="quick-stat-value">{daysActive}</p>
                <p className="quick-stat-label">Days active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-col">
            <h3 className="detail-heading">Contact</h3>
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              {user.phoneNumber && (
                <div className="detail-row">
                  <dt>Phone</dt>
                  <dd>{user.phoneNumber}</dd>
                </div>
              )}
              <div className="detail-row">
                <dt>Provider</dt>
                <dd>{providerName(user.provider)}</dd>
              </div>
            </dl>
          </div>

          <div className="detail-col">
            <h3 className="detail-heading">Account</h3>
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Role</dt>
                <dd>{user.role}</dd>
              </div>
              <div className="detail-row">
                <dt>Created</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div className="detail-row">
                <dt>Last login</dt>
                <dd>{formatDate(user.lastLoginAt)}</dd>
              </div>
              <div className="detail-row">
                <dt>Last active</dt>
                <dd>{formatDate(user.lastActiveAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="detail-col">
            <h3 className="detail-heading">Security</h3>
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Email verified</dt>
                <dd className={user.emailVerified ? 'val-ok' : 'val-error'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </dd>
              </div>
              <div className="detail-row">
                <dt>2FA enabled</dt>
                <dd className={user.twoFactorEnabled ? 'val-ok' : ''}>
                  {user.twoFactorEnabled ? 'Yes' : 'No'}
                </dd>
              </div>
              {user.externalAccounts.length > 1 && (
                <div className="detail-row">
                  <dt>Connected accounts</dt>
                  <dd>{user.externalAccounts.length}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="detail-foot">
          <a
            href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/authentication/users`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            <FaExternalLinkAlt aria-hidden="true" />
            View in Firebase Console
          </a>
        </div>
      </section>

      {/* Tabs */}
      <section className="panel panel--flush detail-tabs">
        <div className="tabs" role="tablist" aria-label="User details">
          <button
            id="tab-overview"
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="panel-overview"
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          >
            <FaEye aria-hidden="true" />
            Overview
          </button>
          <button
            id="tab-wishlist"
            role="tab"
            aria-selected={activeTab === 'wishlist'}
            aria-controls="panel-wishlist"
            onClick={() => setActiveTab('wishlist')}
            className={`tab ${activeTab === 'wishlist' ? 'is-active' : ''}`}
          >
            <FaHeart aria-hidden="true" />
            Wishlist ({user.wishlistCount || 0})
          </button>
        </div>

        <div
          className="tab-panel"
          role="tabpanel"
          id={activeTab === 'overview' ? 'panel-overview' : 'panel-wishlist'}
          aria-labelledby={activeTab === 'overview' ? 'tab-overview' : 'tab-wishlist'}
        >
          {activeTab === 'overview' ? (
            <div className="empty">
              <FaUser size={24} aria-hidden="true" />
              <p className="empty-title">User overview</p>
              <p className="empty-hint">
                Activity analytics and engagement metrics are coming soon.
              </p>
            </div>
          ) : (
            <UserWishlistView
              userId={user.id}
              userName={user.name}
              userEmail={user.email}
            />
          )}
        </div>
      </section>
    </div>
  );
}
