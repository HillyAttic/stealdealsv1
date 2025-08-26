"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { database, Property, vacantPropertiesRef, deleteProperty } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import ClientOnly from '@/components/ClientOnly';

export default function VacantPropertiesPage() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading vacant properties...</p>
          </div>
        }
      >
        <VacantPropertiesContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function VacantPropertiesContent() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load properties from Firebase
  useEffect(() => {
    // Check authentication via API call
    const checkAuthAndLoadData = async () => {
      try {
        // Verify authentication
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include' // Include cookies
        });

        if (!authResponse.ok) {
          throw new Error('Authentication failed');
        }
        
        // Set up real-time listener
        setIsLoading(true);
        
        // Reference to vacant properties in Realtime Database
        const propertiesRef = vacantPropertiesRef;
        const legacyPropertiesRef = ref(database, 'properties');
        
        // Set up listener for real-time updates
        const vacantListener = onValue(propertiesRef, (snapshot) => {
          if (snapshot.exists()) {
            const propertiesList: Property[] = [];
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              const property = { 
                ...propertyData,
                id: childSnapshot.key || propertyData.id || ''
              };
              propertiesList.push(property as Property);
            });
            setProperties(propertiesList);
          } else {
            setProperties([]);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching properties:", error);
          setError('Failed to load properties. Please try again later.');
          setIsLoading(false);
        });
        
        // Check legacy properties as well for backward compatibility
        // Only set up this listener after the first one completes
        const legacyListener = onValue(legacyPropertiesRef, (snapshot) => {
          if (snapshot.exists()) {
            const legacyProperties: Property[] = [];
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              if (propertyData.propertyType === 'Vacant') {
                legacyProperties.push({
                  ...propertyData,
                  id: childSnapshot.key || propertyData.id || ''
                } as Property);
              }
            });
            
            // Combine with existing properties, avoiding duplicates
            if (legacyProperties.length > 0) {
              setProperties(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newProperties = legacyProperties.filter(p => !existingIds.has(p.id));
                return [...prev, ...newProperties];
              });
            }
          }
        });
        
        // Return a cleanup function
        return () => {
          // Properly unsubscribe from the Firebase listeners
          vacantListener();
          legacyListener();
        };
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/admin/login');
        return () => {}; // Return empty cleanup function for this case
      }
    };
    
    // Setup listeners and store cleanup function
    let cleanup: (() => void) | undefined;
    
    checkAuthAndLoadData().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    // Return a cleanup function for useEffect
    return () => {
      if (cleanup) cleanup();
    };
  }, [router]);

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete property
  const handleDelete = async (id: string) => {
    if (!id) {
      setError('Cannot delete property: Missing property ID');
      setDeleteConfirm(null);
      return;
    }
    
    try {
      // Delete from Firebase using the deleteProperty helper function
      await deleteProperty(id, 'Vacant');
      setDeleteConfirm(null);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete property');
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) return 'Contact for Price';
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vacant Properties List</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/vacant/new"
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add New Property
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search properties by location, category, city, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>
          
          {filteredProperties.length === 0 ? (
            <div className="text-center py-20">
              <BsBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">
                {properties.length === 0 ? 'No properties found' : 'No matching properties'}
              </h3>
              <p className="text-gray-500 mb-4">
                {properties.length === 0 ? 'Add your first vacant property' : 'Try adjusting your search criteria'}
              </p>
              {properties.length === 0 && (
                <Link
                  href="/admin/vacant/new"
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                  Add New Property
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-hidden"> {/* Removed overflow-x-auto to prevent horizontal scroll */}
                <table className="w-full divide-y divide-gray-200 table-fixed"> {/* Changed to table-fixed and w-full */}
                  <thead className="table-light">
                    <tr>
                      <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
                      <th className="w-1/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AREA</th>
                      <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RENT</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                      <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property, index) => (
                      <tr key={property.id ? `property-${property.id}` : `index-${index}`} className="hover:bg-gray-50">
                        <td className="w-12 px-2 py-2 text-sm text-gray-900">
                          <span className="font-mono text-xs text-gray-500">
                            V{String(index + 1).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="w-1/4 px-2 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate" title={property.location || property.city || '-'}>
                            {property.location || property.city || '-'}
                          </div>
                          <div className="text-xs text-gray-500 truncate" title={property.state}>
                            {property.state}
                          </div>
                        </td>
                        <td className="w-1/6 px-2 py-2">
                          <span className="inline-flex px-1 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 truncate">
                            {(property.category || 'General').substring(0, 8)}
                          </span>
                        </td>
                        <td className="w-1/6 px-2 py-2 text-sm text-gray-500">
                          <div className="truncate" title={property.superArea || property.carpetArea || '-'}>
                            {property.superArea || property.carpetArea || '-'}
                          </div>
                          {property.floor && (
                            <div key={`floor-${property.id || index}`} className="text-xs text-gray-400 truncate" title={`Floor: ${property.floor}`}>
                              Floor: {property.floor}
                            </div>
                          )}
                        </td>
                        <td className="w-16 px-2 py-2 text-sm text-gray-500">
                          <div className="truncate" title={property.propertyType || 'Vacant'}>
                            {(property.propertyType || 'Vacant').substring(0, 6)}
                          </div>
                        </td>
                        <td className="w-1/6 px-2 py-2 text-sm text-gray-900">
                          <div className="truncate" title={formatCurrency(property.rent || 0)}>
                            {formatCurrency(property.rent || 0)}
                          </div>
                        </td>
                        <td className="w-1/6 px-2 py-2 text-sm text-gray-500">
                          <div className="truncate" title={property.contactName || '-'}>
                            {property.contactName || '-'}
                          </div>
                          {property.reference && (
                            <div key={`ref-${property.id || index}`} className="text-xs text-gray-400 truncate" title={`Ref: ${property.reference}`}>
                              Ref: {property.reference}
                            </div>
                          )}
                        </td>
                        <td className="w-20 px-2 py-2 text-sm font-medium">
                          <div className="flex space-x-0.5">
                            <Link
                              href={`/vacant/${property.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-0.5"
                              target="_blank"
                              title="View Property"
                            >
                              <FaEye className="text-xs" />
                            </Link>
                            {property.id ? (
                              <Link
                                href={`/admin/vacant/edit/${property.id}`}
                                className="text-yellow-600 hover:text-yellow-900 p-0.5"
                                title="Edit Property"
                              >
                                <FaPencilAlt className="text-xs" />
                              </Link>
                            ) : (
                              <span
                                className="text-yellow-600 opacity-50 p-0.5 cursor-not-allowed"
                                title="Cannot edit: Missing property ID"
                              >
                                <FaPencilAlt className="text-xs" />
                              </span>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(property.id || null)}
                              className="text-red-600 hover:text-red-900 p-0.5"
                              title={property.id ? "Delete Property" : "Cannot delete: Missing ID"}
                              disabled={!property.id}
                            >
                              <FaTrash className={`text-xs ${!property.id ? 'opacity-50' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 p-6 rounded-lg max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 backdrop-blur-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300/90 backdrop-blur-sm text-gray-700 rounded hover:bg-gray-400/90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 