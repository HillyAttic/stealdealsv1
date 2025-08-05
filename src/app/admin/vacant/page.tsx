"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
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
  const [selectedCategory, setSelectedCategory] = useState('');

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
              const property = { 
                id: childSnapshot.key, 
                ...childSnapshot.val() 
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
              const property = childSnapshot.val();
              if (property.propertyType === 'Vacant') {
                legacyProperties.push({
                  id: childSnapshot.key,
                  ...property
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

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(properties.map(p => p.category))).filter(Boolean);

  // Filter properties based on search term and category
  const filteredProperties = properties.filter(property => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (property.location?.toLowerCase().includes(searchStr) || '') ||
      (property.category?.toLowerCase().includes(searchStr) || '') ||
      (property.city?.toLowerCase().includes(searchStr) || '');
      
    const matchesCategory = selectedCategory ? property.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Handle property deletion
  const handleDelete = async (id: string | null | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        // Delete from Firebase using the deleteProperty helper function
        await deleteProperty(id, 'Vacant');
      } catch (err) {
        console.error("Error deleting property:", err);
        setError('Failed to delete property');
      }
    }
  };
  
  // Format string values
  const formatString = (value: string | undefined): string => {
    if (!value) return '-';
    return value;
  };
  
  // Format number values
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('en-IN');
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vacant Properties</h1>
        <Link
          href="/admin/vacant/new"
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Vacant Property
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative w-full sm:w-1/4">
          <select 
            className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-sm">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CITY</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DISTRICT NAME</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUB DISTRICT NAME</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FLOOR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FACING</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUPER AREA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CARPET AREA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPERTY TYPE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LENGTH</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WIDTH</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HEIGHT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RENT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REFERENCE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME & CONTACT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="px-4 py-2 whitespace-nowrap text-center text-gray-500">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatString(property.location)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.state)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.city)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.district)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.subDistrict)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.category)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.floor)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.facing)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.superArea)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.carpetArea)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.propertyType)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.length)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.width)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.height)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {property.rent ? `₹${formatNumber(Number(property.rent))}` : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.reference)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.contactName)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/vacant/edit/${property.id}`}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer px-2 py-1 rounded hover:bg-blue-100 inline-block"
                            title="Edit"
                          >
                            <FaPencilAlt />
                          </Link>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer px-2 py-1 rounded hover:bg-red-100"
                            title="Delete"
                            type="button"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
} 