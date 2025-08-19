'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaMapMarkerAlt, FaRulerCombined, FaTrash, FaEdit, FaStar, FaEye } from 'react-icons/fa';
import { WishlistProperty } from '@/types/auth';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useWishlistContext } from '@/contexts/WishlistContext';

interface WishlistSectionProps {
  className?: string;
}

export function WishlistSection({ className = '' }: WishlistSectionProps) {
  const { isAuthenticated, user } = useAuthContext();
  const { wishlistItems, wishlistCount, isLoading, refreshWishlist, removeFromWishlist } = useWishlistContext();
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Fetch detailed wishlist data when wishlist items change
  useEffect(() => {
    const fetchDetailedWishlist = async () => {
      try {
        setError(null);
        console.log(`[WishlistSection] Fetching details for ${wishlistItems.size} items: [${Array.from(wishlistItems).join(', ')}]`);
        
        if (wishlistItems.size === 0) {
          console.log(`[WishlistSection] No items in wishlist, clearing display`);
          setWishlistProperties([]);
          return;
        }

        // Use the same API endpoint as the context for consistency
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Add mock auth headers for development consistency
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && user) {
          headers['x-mock-user-id'] = user.id;
          headers['x-mock-user-email'] = user.email;
        }

        const response = await fetch('/api/user/wishlist', {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        const data = await response.json();

        console.log(`[WishlistSection] Server response:`, {
          ok: response.ok,
          status: response.status,
          success: data.success,
          propertiesCount: data.properties?.length || 0,
          contextCount: wishlistItems.size
        });

        if (!response.ok || !data.success) {
          console.warn('Failed to fetch detailed wishlist:', data.error);
          setError(`Failed to load wishlist: ${data.error || 'Server error'}`);
          // Don't show mock data - show the error state instead
          setWishlistProperties([]);
          return;
        }

        const properties = data.properties || [];
        setWishlistProperties(properties);
        console.log(`[WishlistSection] ✅ Loaded ${properties.length} detailed properties`);
        
        // Verify context sync
        const serverIds = new Set(properties.map((p: any) => p.id));
        const contextIds = wishlistItems;
        const inContextNotServer = Array.from(contextIds).filter(id => !serverIds.has(id));
        const inServerNotContext = Array.from(serverIds).filter(id => !contextIds.has(id as string));
        
        if (inContextNotServer.length > 0 || inServerNotContext.length > 0) {
          console.warn(`[WishlistSection] ⚠️ Context/Server mismatch:`, {
            inContextNotServer,
            inServerNotContext,
            contextIds: Array.from(contextIds),
            serverIds: Array.from(serverIds)
          });
          // Trigger context refresh to fix the mismatch
          setTimeout(() => refreshWishlist(), 500);
        }
      } catch (err) {
        console.error('Error fetching detailed wishlist:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wishlist details');
        setWishlistProperties([]);
      }
    };

    fetchDetailedWishlist();
  }, [wishlistItems, user, refreshWishlist]);

  // Remove property from wishlist
  const handleRemove = async (propertyId: string) => {
    try {
      await removeFromWishlist(propertyId);
      // The context will handle the API call and state updates
      // The useEffect will refresh the detailed properties
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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

  // Remove the authentication check since we now support guest wishlist via localStorage

  if (isLoading) {
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

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaHeart className="mr-2 text-red-500" />
            My Wishlist
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error loading wishlist: {error}</div>
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
            {wishlistCount}
          </span>
        </h2>
        {wishlistProperties.length > 0 && (
          <Link 
            href="/dashboard/wishlist"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        )}
      </div>

      {wishlistCount === 0 ? (
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
        <div className="space-y-4">
          {wishlistProperties.slice(0, 3).map((property) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Property Image */}
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

                {/* Property Details */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
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
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(property.price)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {property.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(property.priority)}`}>
                          {property.priority} priority
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(property)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit notes and priority"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleRemove(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from wishlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  {property.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
              </div>
            </div>
          ))}

          {wishlistProperties.length > 3 && (
            <div className="text-center pt-4">
              <Link 
                href="/dashboard/wishlist"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View {wishlistProperties.length - 3} more properties →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}