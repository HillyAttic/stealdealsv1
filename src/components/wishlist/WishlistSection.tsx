'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaMapMarkerAlt, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { WishlistProperty } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedWishlistContext } from '@/contexts/EnhancedWishlistContext';

interface WishlistSectionProps {
  className?: string;
  showAll?: boolean;
}

export function WishlistSection({ className = '', showAll = false }: WishlistSectionProps) {
  const { user } = useAuth();
  const { wishlistCount, removeFromWishlist } = useEnhancedWishlistContext();
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());

  // Single optimized fetch - runs on mount and when wishlistCount changes (add/remove elsewhere)
  useEffect(() => {
    const controller = new AbortController();

    const fetchWishlist = async () => {
      if (!user?.uid) {
        setWishlistProperties([]);
        setLocalLoading(false);
        return;
      }

      try {
        setLocalLoading(true);
        setError(null);

        const response = await fetch('/api/user/wishlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          credentials: 'include',
          cache: 'default', // Enable browser caching for fast subsequent loads
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load wishlist');
        }

        setWishlistProperties(data.properties || []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[WishlistSection] Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wishlist');
        setWishlistProperties([]);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchWishlist();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, wishlistCount]); // wishlistCount triggers refetch after add/remove

  // Remove property from wishlist with optimistic update
  const handleRemove = useCallback(async (propertyId: string) => {
    if (isDeleting.has(propertyId)) return;

    try {
      setIsDeleting(prev => new Set([...prev, propertyId]));

      // Optimistic UI update
      setWishlistProperties(prev => prev.filter(p => p.id !== propertyId));

      // Remove via context (handles API call)
      const success = await removeFromWishlist(propertyId);

      if (!success) {
        // Revert on failure - refetch will be triggered by wishlistCount change
        setError('Failed to remove property. Please try again.');
      }
    } catch (err) {
      console.error('[WishlistSection] Remove error:', err);
    } finally {
      setIsDeleting(prev => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }
  }, [removeFromWishlist, isDeleting]);

  // Update wishlist item notes/priority
  const handleUpdate = useCallback(async (propertyId: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/user/wishlist/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          notes: editNotes.trim() || undefined,
          priority: editPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Update failed');
      }

      // Update local state
      setWishlistProperties(prev =>
        prev.map(p =>
          p.id === propertyId
            ? { ...p, notes: editNotes.trim() || undefined, priority: editPriority }
            : p
        )
      );

      setEditingItem(null);
      setEditNotes('');
      setEditPriority('medium');
    } catch (err) {
      console.error('[WishlistSection] Update error:', err);
    }
  }, [user?.uid, editNotes, editPriority]);

  // Format currency to LACS/CRORES format
  const formatCurrency = useCallback((value: number | string | undefined): string => {
    if (!value) return '₹0';

    if (typeof value === 'string' && value.includes('-')) {
      return value;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '₹0';

    if (numValue >= 10000000) {
      return `₹${Math.round(numValue / 10000000)} CRORES`;
    } else if (numValue >= 100000) {
      return `₹${Math.round(numValue / 100000)} LACS`;
    } else {
      return `₹${numValue.toLocaleString('en-IN')}`;
    }
  }, []);

  const getPriorityColor = useCallback((priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  if (localLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaHeart className="mr-2 text-red-500" />
            My Wishlist
          </h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && wishlistProperties.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaHeart className="mr-2 text-red-500" />
            My Wishlist
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FaHeart className="mr-2 text-red-500" />
          My Wishlist
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {wishlistProperties.length}
          </span>
        </h2>
        {!showAll && wishlistProperties.length > 0 && (
          <Link
            href="/wishlist"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        )}
      </div>

      {wishlistProperties.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Start browsing properties and save the ones you like</p>
          <Link
            href="/vacant"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaEye className="mr-2" />
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className={`${showAll ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
          {(showAll ? wishlistProperties : wishlistProperties.slice(0, 3)).map((property) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                    <Image
                      src={property.images[0] || '/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        <Link
                          href={`/vacant/${property.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {property.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        {property.location}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">
                          {property.priceDisplay || formatCurrency(property.price)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {property.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(property.priority)}`}>
                          {property.priority} priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(property.id);
                          setEditNotes(property.notes || '');
                          setEditPriority(property.priority);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit notes and priority"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleRemove(property.id)}
                        disabled={isDeleting.has(property.id)}
                        className={`p-2 transition-colors ${
                          isDeleting.has(property.id)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={isDeleting.has(property.id) ? 'Removing...' : 'Remove from wishlist'}
                      >
                        {isDeleting.has(property.id) ? (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>

                  {property.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {property.notes}
                    </div>
                  )}

                  {editingItem === property.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add your notes about this property..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(property.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditNotes('');
                              setEditPriority('medium');
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!showAll && wishlistProperties.length > 3 && (
            <div className="text-center pt-4">
              <Link
                href="/wishlist"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View {wishlistProperties.length - 3} more properties &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
