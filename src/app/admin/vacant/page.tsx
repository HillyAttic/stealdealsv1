"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { database, Property, vacantPropertiesRef, migratedVacantRef, deleteProperty } from '@/lib/firebase';
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
        
        const allProperties = new Map<string, Property>();
        
        // Set up listener for migrated vacant properties (primary source)
        const migratedListener = onValue(migratedVacantRef, (snapshot) => {
          console.log('Migrated vacant properties updated');
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              let property = { 
                ...propertyData,
                id: childSnapshot.key || propertyData.id || '',
                source: 'migrated'
              };
              
              // Handle nested structure from migration
              if (propertyData.vacantDetails) {
                const details = propertyData.vacantDetails;
                property = {
                  ...property,
                  category: details.category || propertyData.category || 'Vacant',
                  city: details.city || propertyData.city || '',
                  state: details.state || propertyData.state || '',
                  district: details.district || propertyData.district || '',
                  floor: details.floor || propertyData.floor || '',
                  facing: details.facing || propertyData.facing || '',
                  carpetArea: details.carpetArea || propertyData.carpetArea || '',
                  superArea: details.superArea || propertyData.superArea || '',
                  rent: details.rent || propertyData.rent || propertyData.price || 0,
                  contactName: details.contactName || propertyData.contactName || '',
                  contactNumber: details.contactNumber || propertyData.contactNumber || '',
                  reference: details.reference || propertyData.reference || '',
                  propertyType: details.propertyType || propertyData.propertyType || 'Vacant'
                };
              }
              
              allProperties.set(property.id, property as Property);
            });
          }
          updatePropertiesList();
        }, (error) => {
          console.error("Error fetching migrated properties:", error);
          setError('Failed to load migrated properties. Please try again later.');
          setIsLoading(false);
        });
        
        // Set up listener for legacy vacant properties (fallback source)
        const legacyVacantListener = onValue(vacantPropertiesRef, (snapshot) => {
          console.log('Legacy vacant properties updated');
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              const property = { 
                ...propertyData,
                id: childSnapshot.key || propertyData.id || '',
                source: 'legacy'
              };
              
              // Only add if not already present from migrated collection
              if (!allProperties.has(property.id)) {
                allProperties.set(property.id, property as Property);
              }
            });
          }
          updatePropertiesList();
        }, (error) => {
          console.error("Error fetching legacy vacant properties:", error);
        });
        
        // Set up listener for general legacy properties
        const legacyPropertiesRef = ref(database, 'properties');
        const generalLegacyListener = onValue(legacyPropertiesRef, (snapshot) => {
          console.log('General legacy properties updated');
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              if (propertyData.propertyType === 'Vacant') {
                const property = {
                  ...propertyData,
                  id: childSnapshot.key || propertyData.id || '',
                  source: 'legacy-general'
                };
                
                // Only add if not already present
                if (!allProperties.has(property.id)) {
                  allProperties.set(property.id, property as Property);
                }
              }
            });
          }
          updatePropertiesList();
        }, (error) => {
          console.error("Error fetching general legacy properties:", error);
        });
        
        // Function to update the properties list from the combined map
        function updatePropertiesList() {
          const propertiesList = Array.from(allProperties.values());
          console.log(`Updated properties list with ${propertiesList.length} items`);
          setProperties(propertiesList);
          setIsLoading(false);
        }
        
        // Return a cleanup function
        return () => {
          // Properly unsubscribe from the Firebase listeners
          migratedListener();
          legacyVacantListener();
          generalLegacyListener();
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Vacant Properties</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/vacant/new"
            className="px-3 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center text-sm"
          >
            <FaPlus className="mr-1" />
            <span className="hidden sm:inline">Add New Property</span>
            <span className="sm:hidden">Add</span>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PID</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">LOCATION</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CATEGORY</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">AREA</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">TYPE</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">RENT</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">CONTACT</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property, index) => (
                      <tr key={property.id ? `property-${property.id}` : `index-${index}`} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-500">
                            V{String(index + 1).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {property.location || property.city || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.state}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {property.category || 'General'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          <div>{property.superArea || property.carpetArea || '-'}</div>
                          {property.floor && (
                            <div key={`floor-${property.id || index}`} className="text-xs text-gray-400">
                              Floor: {property.floor}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {property.propertyType || 'Vacant'}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatCurrency(property.rent || 0)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          <div>{property.contactName || '-'}</div>
                          {property.reference && (
                            <div key={`ref-${property.id || index}`} className="text-xs text-gray-400">
                              Ref: {property.reference}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Link
                              href={`/vacant/${property.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              target="_blank"
                              title="View Property"
                            >
                              <FaEye />
                            </Link>
                            {property.id ? (
                              <Link
                                href={`/admin/vacant/edit/${property.id}`}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Edit Property"
                              >
                                <FaPencilAlt />
                              </Link>
                            ) : (
                              <span
                                className="text-yellow-600 opacity-50 p-1 cursor-not-allowed"
                                title="Cannot edit: Missing property ID"
                              >
                                <FaPencilAlt />
                              </span>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(property.id || null)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title={property.id ? "Delete Property" : "Cannot delete: Missing ID"}
                              disabled={!property.id}
                            >
                              <FaTrash className={!property.id ? 'opacity-50' : ''} />
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