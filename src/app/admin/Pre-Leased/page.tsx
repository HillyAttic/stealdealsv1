"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { database, Property, deleteProperty, preleasedPropertiesRef, migratedPreleasedRef } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import ClientOnly from '@/components/ClientOnly';

export default function PreLeasedPropertiesPage() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading pre-leased properties...</p>
          </div>
        }
      >
        <PreLeasedPropertiesContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function PreLeasedPropertiesContent() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load properties from Firebase with real-time updates
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

        // Set up real-time listener for preleased properties
        setIsLoading(true);
        
        const allProperties = new Map<string, Property>();
        
        // Set up listener for migrated pre-leased properties (primary source)
        const migratedListener = onValue(migratedPreleasedRef, (snapshot) => {
          console.log('Migrated pre-leased properties updated');
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              let property = { 
                ...propertyData,
                id: childSnapshot.key || propertyData.id || '',
                source: 'migrated'
              };
              
              // Handle nested structure from migration
              if (propertyData.preleasedDetails) {
                const details = propertyData.preleasedDetails;
                property = {
                  ...property,
                  tenant: details.tenant || propertyData.tenant || '',
                  category: details.category || propertyData.category || 'Pre-Leased',
                  buildingName: details.buildingName || propertyData.buildingName || '',
                  floor: details.floor || propertyData.floor || '',
                  totalArea: details.totalArea || propertyData.totalArea || '',
                  areaOnSale: details.areaOnSale || propertyData.areaOnSale || '',
                  rent: parseFloat(typeof details.rent === 'string' ? details.rent.replace(/[^0-9.]/g, '') : details.rent || '0') || propertyData.rent || 0,
                  leaseTerm: details.leaseTerm || propertyData.leaseTerm || '',
                  remainingLease: details.remainingLease || propertyData.remainingLease || '',
                  lockIn: details.lockIn || propertyData.lockIn || '',
                  escalation: details.escalation || propertyData.escalation || '',
                  securityDeposit: details.securityDeposit || propertyData.securityDeposit || '',
                  roi: details.roi || propertyData.roi || '',
                  propertyStatus: details.propertyStatus || propertyData.propertyStatus || '',
                  reference: details.reference || propertyData.reference || '',
                  channel: details.channel || propertyData.channel || '',
                  propertyType: details.propertyType || propertyData.propertyType || 'Pre-Leased'
                };
              }
              
              allProperties.set(property.id, property as Property);
            });
          }
          updatePropertiesList();
        }, (error) => {
          console.error("Error fetching migrated pre-leased properties:", error);
          setError('Failed to load migrated properties. Please try again later.');
          setIsLoading(false);
        });
        
        // Set up listener for legacy pre-leased properties (fallback source)
        const legacyPreleasedListener = onValue(preleasedPropertiesRef, (snapshot) => {
          console.log('Legacy pre-leased properties updated');
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
          console.error("Error fetching legacy pre-leased properties:", error);
        });
        
        // Set up listener for general legacy properties
        const legacyPropertiesRef = ref(database, 'properties');
        const generalLegacyListener = onValue(legacyPropertiesRef, (snapshot) => {
          console.log('General legacy properties updated');
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const propertyData = childSnapshot.val();
              if (propertyData.propertyType === 'Pre-Leased') {
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
          console.log(`Updated pre-leased properties list with ${propertiesList.length} items`);
          setProperties(propertiesList);
          setIsLoading(false);
        }
        
        // Return a cleanup function
        return () => {
          // Properly unsubscribe from the Firebase listeners
          migratedListener();
          legacyPreleasedListener();
          generalLegacyListener();
        };
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/admin/login');
      }
    };
    
    checkAuthAndLoadData();
  }, [router]);

  // Filter properties based on search term
  const filteredProperties = properties.filter(property => {
    const searchStr = searchTerm.toLowerCase();
    return (
      property.tenant?.toLowerCase().includes(searchStr) ||
      property.location?.toLowerCase().includes(searchStr) ||
      property.category?.toLowerCase().includes(searchStr) ||
      property.buildingName?.toLowerCase().includes(searchStr) ||
      property.propertyStatus?.toLowerCase().includes(searchStr)
    );
  });

  // Handle delete property
  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await deleteProperty(id, 'Pre-Leased');
      setDeleteConfirm(null);
      // No need to refresh properties as we're using real-time listener
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete property');
      setIsLoading(false);
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pre-Leased Properties</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/Pre-Leased/new"
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
            placeholder="Search properties by tenant, location, category, building, or status..."
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
                {properties.length === 0 ? 'Add your first pre-leased property' : 'Try adjusting your search criteria'}
              </p>
              {properties.length === 0 && (
                <Link
                  href="/admin/Pre-Leased/new"
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
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">TENANT</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">LOCATION</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CATEGORY</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">LEASE INFO</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">RENT</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">ASKING PRICE</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property, index) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-500">
                            P{String(index + 1).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {property.tenant || 'Unknown Tenant'}
                          </div>
                          {property.buildingName && (
                            <div className="text-xs text-gray-500">
                              {property.buildingName}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {property.location || '-'}
                          </div>
                          {property.floor && (
                            <div className="text-xs text-gray-500">
                              Floor: {property.floor}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            property.propertyStatus === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {property.category || 'General'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          <div>{property.leaseTerm ? `Term: ${property.leaseTerm}` : '-'}</div>
                          {property.remainingLease && (
                            <div className="text-xs text-gray-400">
                              Remaining: {property.remainingLease}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          <div>{formatCurrency(property.rent || 0)}</div>
                          {property.rentalType && (
                            <div className="text-xs text-gray-400">
                              {property.rentalType}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          <div>{formatCurrency(property.askingPrice || 0)}</div>
                          {property.roi && (
                            <div className="text-xs text-gray-400">
                              ROI: {property.roi}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Link
                              href={`/Pre-Leased/${property.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              target="_blank"
                              title="View Property"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              href={`/admin/Pre-Leased/edit/${property.id}`}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Edit Property"
                            >
                              <FaPencilAlt />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(property.id || null)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Property"
                            >
                              <FaTrash />
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