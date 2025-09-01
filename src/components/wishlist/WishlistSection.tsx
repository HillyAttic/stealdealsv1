'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaMapMarkerAlt, FaRulerCombined, FaTrash, FaEdit, FaStar, FaEye } from 'react-icons/fa';
import { WishlistProperty } from '@/types/auth';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEnhancedWishlistContext } from '@/contexts/EnhancedWishlistContext';

interface WishlistSectionProps {
  className?: string;
  showAll?: boolean;
}

export function WishlistSection({ className = '', showAll = false }: WishlistSectionProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { wishlistItems, wishlistCount, isLoading, refreshWishlist, removeFromWishlist } = useEnhancedWishlistContext();
  const [wishlistProperties, setWishlistProperties] = useState<WishlistProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());

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
        
        // Add user identification headers
        if (typeof window !== 'undefined' && user?.id) {
          headers['x-user-id'] = user.id;
          if (process.env.NODE_ENV === 'development') {
            headers['x-mock-user-id'] = user.id;
            headers['x-mock-user-email'] = user.primaryEmailAddress?.emailAddress || '';
          }
        } else if (!isSignedIn && typeof window !== 'undefined') {
          // For non-authenticated users, try to get from localStorage
          const stored = localStorage.getItem('stealdeals_wishlist_temp');
          if (stored) {
            try {
              const items = JSON.parse(stored);
              // For now, just show empty state for localStorage items as we can't fetch details without server
              setWishlistProperties([]);
              return;
            } catch (e) {
              console.warn('Failed to parse localStorage wishlist:', e);
            }
          }
        }

        console.log(`[WishlistSection] Making API request with headers:`, {
          hasUserId: !!headers['x-user-id'],
          hasMockUserId: !!headers['x-mock-user-id'],
          isSignedIn,
          userId: user?.id
        });

        // Add cache-busting parameter to prevent browser caching
        const response = await fetch(`/api/user/wishlist?_t=${Date.now()}&limit=1000`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log(`[WishlistSection] Server response:`, {
          success: data.success,
          propertiesCount: data.properties?.length || 0,
          contextCount: wishlistItems.size
        });

        if (!data.success) {
          throw new Error(data.error || 'Server returned unsuccessful response');
        }

        const properties = data.properties || [];
        setWishlistProperties(properties);
        console.log(`[WishlistSection] ✅ Loaded ${properties.length} detailed properties`);
        
      } catch (err) {
        console.error('Error fetching detailed wishlist:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load wishlist details';
        setError(errorMessage);
        setWishlistProperties([]);
      }
    };

    // Only fetch if we have items and user is signed in
    if (wishlistItems.size > 0 && isSignedIn && user?.id) {
      fetchDetailedWishlist();
    } else if (wishlistItems.size === 0) {
      setWishlistProperties([]);
    }
  }, [wishlistItems, user?.id, isSignedIn]);

  // Remove property from wishlist with immediate UI update
  const handleRemove = useCallback(async (propertyId: string) => {
    if (isDeleting.has(propertyId)) return; // Prevent double-clicks
    
    try {
      // Add to deleting set to show loading state
      setIsDeleting(prev => new Set([...prev, propertyId]));
      
      // Immediately update UI for better user experience
      setWishlistProperties(prev => prev.filter(p => p.id !== propertyId));
      
      // Then remove from context (which handles API call)
      const success = await removeFromWishlist(propertyId);
      
      if (!success) {
        // If removal failed, restore the property
        setTimeout(() => refreshWishlist(), 100);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // On error, refresh to show correct state
      setTimeout(() => refreshWishlist(), 100);
    } finally {
      // Remove from deleting set
      setIsDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  }, [removeFromWishlist, refreshWishlist, isDeleting]);

  // Update wishlist item
  const handleUpdate = async (propertyId: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add user identification headers
      if (typeof window !== 'undefined' && user?.id) {
        headers['x-user-id'] = user.id;
        if (process.env.NODE_ENV === 'development') {
          headers['x-mock-user-id'] = user.id;
          headers['x-mock-user-email'] = user.primaryEmailAddress?.emailAddress || '';
        }
      }

      const response = await fetch(`/api/user/wishlist/${propertyId}`, {
        method: 'PUT',
        headers,
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

  // Format currency to show LACS format for large numbers (matching franchise display format)
  const formatCurrency = (value: number | string | undefined): string => {
    if (!value) return '₹0';
    
    // Handle range strings like "₹35,00,000 - ₹40,00,000"
    if (typeof value === 'string' && value.includes('-')) {
      // Extract numbers from range string
      const numbers = value.match(/[\d,]+/g);
      if (numbers && numbers.length >= 2) {
        const minVal = parseFloat(numbers[0].replace(/,/g, ''));
        const maxVal = parseFloat(numbers[1].replace(/,/g, ''));
        
        if (!isNaN(minVal) && !isNaN(maxVal)) {
          // Convert to LACS format (matching your desired format)
          const formatInvestment = (amount: number) => {
            if (amount >= 10000000) {
              return `₹${Math.round(amount / 10000000)} CRORES`;
            } else if (amount >= 100000) {
              return `₹${Math.round(amount / 100000)} LACS`;
            } else {
              return `₹${amount.toLocaleString()}`;
            }
          };
          
          return `${formatInvestment(minVal)} - ${formatInvestment(maxVal)}`;
        }
      }
      return value; // Return original if parsing fails
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '₹0';
    
    // Convert to LACS format for large numbers (matching your desired format)
    if (numValue >= 10000000) {
      return `₹${Math.round(numValue / 10000000)} CRORES`;
    } else if (numValue >= 100000) {
      return `₹${Math.round(numValue / 100000)} LACS`;
    } else {
      // For smaller amounts, show full amount with proper Indian number formatting
      return `₹${numValue.toLocaleString('en-IN')}`;
    }
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
        {!showAll && wishlistProperties.length > 0 && (
          <Link 
            href="/wishlist"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        )}
      </div>

      {wishlistProperties.length === 0 && !isLoading ? (
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

                    {/* Actions - moved to be more responsive */}
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
                View {wishlistProperties.length - 3} more properties →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}