'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaMapMarkerAlt, FaRupeeSign, FaTrash, FaFilter, FaStar, FaEye, FaDownload } from 'react-icons/fa';

interface WishlistProperty {
  id: string;
  title: string;
  price: number;
  priceDisplay?: string;
  location: string;
  images: string[];
  type: string;
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  developer?: string;
  plotSize?: string;
  category?: string;
  segment?: string;
  description?: string;
}

interface WishlistStats {
  total: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

interface UserWishlistViewProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  onClose?: () => void;
}

export function UserWishlistView({ userId, userName, userEmail, onClose }: UserWishlistViewProps) {
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([]);
  const [wishlistStats, setWishlistStats] = useState<WishlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 12;

  // Fetch user's wishlist
  const fetchUserWishlist = async (page: number = 1, priority: string = 'all', bypassCache: boolean = false) => {
    try {
      setIsLoading(page === 1);
      setError(null);

      const params = new URLSearchParams({
        includeStats: 'true',
        limit: itemsPerPage.toString(),
        offset: ((page - 1) * itemsPerPage).toString()
      });

      if (priority !== 'all') {
        params.append('priority', priority);
      }
      
      // ALWAYS bypass cache for admin operations to ensure consistency
      params.append('bypassCache', 'true');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/api/admin/users/${userId}/wishlist?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user wishlist');
      }

      const properties = data.wishlist.properties.map((prop: any) => ({
        ...prop,
        addedAt: new Date(prop.addedAt)
      }));

      if (page === 1) {
        setWishlistProperties(properties);
      } else {
        setWishlistProperties(prev => [...prev, ...properties]);
      }

      setHasMore(data.wishlist.pagination.hasMore);
      setWishlistStats(data.wishlist.stats);
    } catch (err) {
      console.error('Error fetching user wishlist:', err);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Wishlist request timed out. The server took too long to respond. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load user wishlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove property from user's wishlist
  const removeFromWishlist = async (propertyId: string) => {
    try {
      setRemoveLoading(propertyId);

      const response = await fetch(`/api/admin/users/${userId}/wishlist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'remove',
          propertyId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove property from wishlist');
      }

      // Remove from local state
      setWishlistProperties(prev => prev.filter(prop => prop.id !== propertyId));
      
      // Update stats if available
      if (wishlistStats) {
        setWishlistStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }
      
      // Force refresh to ensure cache consistency - ALWAYS bypass cache
      setTimeout(() => {
        fetchUserWishlist(1, priorityFilter, true); // Always bypass cache on remove
      }, 500);

    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove property');
    } finally {
      setRemoveLoading(null);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!confirm('Are you sure you want to clear this user\'s entire wishlist? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/admin/users/${userId}/wishlist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear_all'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to clear wishlist');
      }

      setWishlistProperties([]);
      setWishlistStats({ total: 0, byPriority: {}, byType: {} });
      
      // Force refresh to ensure cache consistency - ALWAYS bypass cache
      setTimeout(() => {
        fetchUserWishlist(1, 'all', true); // Always bypass cache after clear
      }, 500);
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Export wishlist data
  const exportWishlist = () => {
    const csvData = wishlistProperties.map(prop => ({
      'Property Title': prop.title,
      'Price': prop.priceDisplay || `₹${prop.price.toLocaleString('en-IN')}`,
      'Location': prop.location,
      'Type': prop.type,
      'Priority': prop.priority,
      'Added Date': prop.addedAt.toLocaleDateString('en-IN'),
      'Notes': prop.notes || '',
      'Developer': prop.developer || '',
      'Plot Size': prop.plotSize || ''
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName || userId}_wishlist_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (newPriority: 'all' | 'low' | 'medium' | 'high') => {
    setPriorityFilter(newPriority);
    setCurrentPage(1);
    fetchUserWishlist(1, newPriority);
  };

  // Load more items
  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchUserWishlist(nextPage, priorityFilter);
    }
  };

  // Format price display
  const formatPrice = (property: WishlistProperty) => {
    if (property.priceDisplay) {
      return property.priceDisplay;
    }
    return property.price > 0 ? `₹${property.price.toLocaleString('en-IN')}` : 'Price on request';
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') =>
    priority === 'high' ? 'badge badge--error'
      : priority === 'medium' ? 'badge badge--accent'
        : 'badge';

  const pctOf = (n: number) =>
    wishlistStats?.total ? `${Math.round((n / wishlistStats.total) * 100)}% of items` : 'No items yet';

  // Initial load
  useEffect(() => {
    fetchUserWishlist();
  }, [userId]);

  if (isLoading && wishlistProperties.length === 0) {
    return (
      <div className="wishlist-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel">
            <div className="admin-skeleton h-40 w-full mb-4" />
            <div className="admin-skeleton h-4 w-3/4 mb-2" />
            <div className="admin-skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error && wishlistProperties.length === 0) {
    return (
      <div className="panel">
        <div className="empty">
          <FaHeart size={24} aria-hidden="true" />
          <p className="empty-title">Could not load wishlist</p>
          <p className="empty-hint">{error}</p>
          <button className="btn btn--primary" onClick={() => fetchUserWishlist()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="wishlist-head">
        <div>
          <h2 className="panel-title">
            {userName ? `${userName}'s wishlist` : 'User wishlist'}
          </h2>
          <p className="panel-sub">{userEmail || `User ID: ${userId}`}</p>
        </div>
        <div className="wishlist-actions">
          {wishlistProperties.length > 0 && (
            <>
              <button onClick={exportWishlist} className="btn">
                <FaDownload aria-hidden="true" />
                Export CSV
              </button>
              <button onClick={clearWishlist} className="btn btn--danger">
                <FaTrash aria-hidden="true" />
                Clear all
              </button>
            </>
          )}
          {onClose && (
            <button onClick={onClose} className="btn">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {wishlistStats && (
        <div className="stat-grid">
          <div className="panel stat">
            <p className="stat-label"><FaHeart size={14} aria-hidden="true" /> Total items</p>
            <p className="stat-value">{wishlistStats.total}</p>
            <p className="stat-foot">Saved properties</p>
          </div>
          <div className="panel stat">
            <p className="stat-label"><FaStar size={14} aria-hidden="true" /> High priority</p>
            <p className="stat-value">{wishlistStats.byPriority.high || 0}</p>
            <p className="stat-foot">{pctOf(wishlistStats.byPriority.high || 0)}</p>
          </div>
          <div className="panel stat">
            <p className="stat-label">
              <span className="dot dot--soft" aria-hidden="true" />
              Medium priority
            </p>
            <p className="stat-value">{wishlistStats.byPriority.medium || 0}</p>
            <p className="stat-foot">{pctOf(wishlistStats.byPriority.medium || 0)}</p>
          </div>
          <div className="panel stat">
            <p className="stat-label">
              <span className="dot dot--quiet" aria-hidden="true" />
              Low priority
            </p>
            <p className="stat-value">{wishlistStats.byPriority.low || 0}</p>
            <p className="stat-foot">{pctOf(wishlistStats.byPriority.low || 0)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="panel panel--filters">
        <div className="filters">
          <span className="filters-label">
            <FaFilter aria-hidden="true" />
            Priority
          </span>
          <div className="chip-row">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityFilterChange(priority as any)}
                className={`chip ${priorityFilter === priority ? 'is-active' : ''}`}
              >
                {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wishlist Properties */}
      {wishlistProperties.length === 0 ? (
        <div className="panel">
          <div className="empty">
            <FaHeart size={24} aria-hidden="true" />
            <p className="empty-title">No wishlist items</p>
            <p className="empty-hint">
              {priorityFilter !== 'all'
                ? `No properties with ${priorityFilter} priority found.`
                : 'This user hasn\'t added any properties to their wishlist yet.'
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlistProperties.map((property) => (
              <article key={property.id} className="wishlist-card">
                {/* Property Image */}
                <div className="wishlist-media">
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="wishlist-img"
                    />
                  ) : (
                    <div className="wishlist-media--empty">
                      <FaMapMarkerAlt size={22} aria-hidden="true" />
                      <p>No image</p>
                    </div>
                  )}

                  <span className={`wishlist-priority ${getPriorityBadge(property.priority)}`}>
                    {property.priority}
                  </span>

                  <button
                    onClick={() => removeFromWishlist(property.id)}
                    disabled={removeLoading === property.id}
                    className="media-action"
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    {removeLoading === property.id ? (
                      <span className="spin" aria-hidden="true" />
                    ) : (
                      <FaTrash aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Property Details */}
                <div className="wishlist-body">
                  <h3 className="wishlist-title">{property.title}</h3>

                  <p className="wishlist-meta">
                    <FaMapMarkerAlt aria-hidden="true" />
                    {property.location}
                  </p>

                  <p className="wishlist-price">
                    <FaRupeeSign aria-hidden="true" />
                    {formatPrice(property)}
                  </p>

                  <div className="wishlist-sub">
                    <span>{property.type}</span>
                    <span>{property.addedAt.toLocaleDateString('en-IN')}</span>
                  </div>

                  {property.notes && (
                    <p className="wishlist-notes">
                      <strong>Notes:</strong> {property.notes}
                    </p>
                  )}

                  {(property.developer || property.plotSize) && (
                    <dl className="wishlist-facts">
                      {property.developer && (
                        <div><dt>Developer</dt><dd>{property.developer}</dd></div>
                      )}
                      {property.plotSize && (
                        <div><dt>Plot size</dt><dd>{property.plotSize}</dd></div>
                      )}
                    </dl>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="load-more">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="btn"
              >
                {isLoading ? (
                  <>
                    <span className="spin" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  <>
                    <FaEye aria-hidden="true" />
                    Load more properties
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {error && wishlistProperties.length > 0 && (
        <div className="cobalt-error">{error}</div>
      )}
    </div>
  );
}