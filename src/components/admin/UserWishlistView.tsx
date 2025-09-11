'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaMapMarkerAlt, FaRupeeSign, FaCalendarAlt, FaTrash, FaExternalLinkAlt, FaFilter, FaStar, FaEye, FaDownload } from 'react-icons/fa';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';

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

      const response = await fetch(`/api/admin/users/${userId}/wishlist?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

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
      setError(err instanceof Error ? err.message : 'Failed to load user wishlist');
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
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return styles[priority] || styles.medium;
  };

  // Get priority icon
  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    return priority === 'high' ? '🔥' : priority === 'medium' ? '⭐' : '📍';
  };

  // Initial load
  useEffect(() => {
    fetchUserWishlist();
  }, [userId]);

  if (isLoading && wishlistProperties.length === 0) {
    return <LoadingSpinner message={`Loading ${userName || 'user'}'s wishlist...`} />;
  }

  if (error && wishlistProperties.length === 0) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => fetchUserWishlist()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userName ? `${userName}'s Wishlist` : `User Wishlist`}
          </h2>
          {userEmail && (
            <p className="text-gray-600">{userEmail}</p>
          )}
          <p className="text-sm text-gray-500">User ID: {userId}</p>
        </div>
        <div className="flex space-x-2">
          {wishlistProperties.length > 0 && (
            <>
              <button
                onClick={exportWishlist}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaDownload className="mr-2" />
                Export CSV
              </button>
              <button
                onClick={clearWishlist}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {wishlistStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaHeart className="text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaStar className="text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistStats.byPriority.high || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistStats.byPriority.medium || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm text-gray-600">Low Priority</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistStats.byPriority.low || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Priority:</span>
          </div>
          <div className="flex space-x-2">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityFilterChange(priority as any)}
                className={`px-3 py-1 text-sm rounded-full ${
                  priorityFilter === priority
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wishlist Properties */}
      {wishlistProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FaHeart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No wishlist items</h3>
          <p className="mt-1 text-sm text-gray-500">
            {priorityFilter !== 'all' 
              ? `No properties with ${priorityFilter} priority found.`
              : 'This user hasn\'t added any properties to their wishlist yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48">
                {property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">🏠</div>
                      <p className="text-sm text-gray-500">No Image</p>
                    </div>
                  </div>
                )}
                
                {/* Priority Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(property.priority)}`}>
                    {getPriorityIcon(property.priority)} {property.priority}
                  </span>
                </div>

                {/* Remove Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => removeFromWishlist(property.id)}
                    disabled={removeLoading === property.id}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    {removeLoading === property.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mr-1 text-sm" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-center text-green-600 font-semibold mb-2">
                  <FaRupeeSign className="mr-1 text-sm" />
                  <span>{formatPrice(property)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{property.type}</span>
                  <span>{property.addedAt.toLocaleDateString('en-IN')}</span>
                </div>
                
                {property.notes && (
                  <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-3">
                    <strong>Notes:</strong> {property.notes}
                  </div>
                )}
                
                {(property.developer || property.plotSize) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {property.developer && <div>Developer: {property.developer}</div>}
                    {property.plotSize && <div>Plot Size: {property.plotSize}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <FaEye className="mr-2" />
                Load More Properties
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && wishlistProperties.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}