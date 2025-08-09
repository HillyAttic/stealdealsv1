'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaMapMarkerAlt, FaTrash, FaEdit, FaEye, FaArrowLeft, FaFilter, FaSort } from 'react-icons/fa';
import { WishlistProperty } from '@/types/auth';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useWishlistContext } from '@/contexts/WishlistContext';

export default function WishlistPage() {
  const { isAuthenticated, user } = useAuthContext();
  const { wishlistItems, wishlistCount, isLoading, removeFromWishlist } = useWishlistContext();
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<WishlistProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Filter and sort states
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch detailed wishlist data based on wishlist items from context
  useEffect(() => {
    const fetchDetailedWishlist = async () => {
      if (wishlistItems.size === 0) {
        setWishlistProperties([]);
        return;
      }

      try {
        setError(null);
        console.log(`[WishlistPage] Fetching details for ${wishlistItems.size} items: [${Array.from(wishlistItems).join(', ')}]`);
        
        // Prepare headers for API call
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Add mock auth headers for development (for consistency with API)
        if (typeof window !== 'undefined' && user) {
          headers['x-mock-user-id'] = user.id;
          headers['x-mock-user-email'] = user.email;
        } else if (typeof window !== 'undefined') {
          // Use fallback user for development/guest mode
          headers['x-mock-user-id'] = 'user-1';
          headers['x-mock-user-email'] = 'guest@stealdeals.com';
        }
        
        const response = await fetch('/api/user/wishlist', {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        const data = await response.json();
        console.log(`[WishlistPage] API response:`, data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch wishlist details');
        }

        setWishlistProperties(data.properties || []);
        console.log(`[WishlistPage] ✅ Loaded ${data.properties?.length || 0} detailed properties`);
      } catch (err) {
        console.error('Error fetching wishlist details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wishlist details');
      }
    };

    fetchDetailedWishlist();
  }, [wishlistItems, user]);

  // Filter and sort properties
  useEffect(() => {
    let filtered = [...wishlistProperties];

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredProperties(filtered);
  }, [wishlistProperties, priorityFilter, typeFilter, sortBy, sortOrder]);

  // Remove property from wishlist using context
  const handleRemove = async (propertyId: string) => {
    try {
      const success = await removeFromWishlist(propertyId);
      if (success) {
        // Remove from local display state
        setWishlistProperties(prev => prev.filter(p => p.id !== propertyId));
        console.log(`[WishlistPage] ✅ Removed property ${propertyId} from wishlist`);
      } else {
        console.warn(`[WishlistPage] ⚠️ Failed to remove property ${propertyId} from wishlist`);
      }
    } catch (error) {
      console.error(`[WishlistPage] ❌ Error removing property ${propertyId}:`, error);
    }
  };

  // Update wishlist item
  const handleUpdate = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: editNotes.trim() || undefined,
          priority: editPriority
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update wishlist item');
      }

      // Update local state
      setWishlistProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, notes: editNotes.trim() || undefined, priority: editPriority }
          : p
      ));

      setEditingItem(null);
      setEditNotes('');
      setEditPriority('medium');
    } catch (error) {
      console.error('Error updating wishlist item:', error);
    }
  };

  // Start editing
  const startEditing = (property: WishlistProperty) => {
    setEditingItem(property.id);
    setEditNotes(property.notes || '');
    setEditPriority(property.priority);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditNotes('');
    setEditPriority('medium');
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Get priority color
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique property types for filter
  const propertyTypes = Array.from(new Set(wishlistProperties.map(p => p.type))).filter(Boolean);

  // Don't block unauthenticated users - they may have localStorage wishlist items
  // Let the WishlistContext handle both authenticated and guest users

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">Error loading wishlist: {error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaHeart className="mr-3 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistCount} {wishlistCount === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
          </div>
        </div>

        {wishlistCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12">
            <div className="text-center">
              <FaHeart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start browsing properties and save the ones you like. They'll appear here for easy access.
              </p>
              <Link 
                href="/vacant"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaEye className="mr-2" />
                Browse Properties
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filters and Sort */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2 ml-auto">
                  <FaSort className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date Added</option>
                    <option value="price">Price</option>
                    <option value="priority">Priority</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* Property Image */}
                  <div className="relative h-48">
                    <Image
                      src={property.images[0] || '/homepage-image.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to a colored background if image fails
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {(!property.images[0]) && (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-sm">Property Image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(property.priority)}`}>
                        {property.priority}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        <Link 
                          href={`/vacant/${property.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {property.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(property)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit notes and priority"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleRemove(property.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove from wishlist"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FaMapMarkerAlt className="mr-1" />
                      {property.location}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-blue-600">
                          {property.price > 0 ? formatCurrency(property.price) : 'Price on Request'}
                        </span>
                        {property.price > 0 && (
                          <span className="text-sm text-gray-500 ml-1">
                            /month
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {property.type}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Added on {new Date(property.addedAt).toLocaleDateString()}
                    </div>

                    {/* Notes */}
                    {property.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                        <strong>Notes:</strong> {property.notes}
                      </div>
                    )}

                    {/* Edit Form */}
                    {editingItem === property.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add your notes about this property..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                            </label>
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
                              onClick={cancelEditing}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View Property Button */}
                    <Link 
                      href={`/vacant/${property.id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-3"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && wishlistProperties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-center">
                  <FaFilter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No properties match your filters</h2>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                  <button
                    onClick={() => {
                      setPriorityFilter('all');
                      setTypeFilter('all');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}