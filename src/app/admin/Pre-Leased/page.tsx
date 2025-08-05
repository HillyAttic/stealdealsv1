"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { database, Property, deleteProperty, preleasedPropertiesRef } from '@/lib/firebase';
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
  const [selectedCategory, setSelectedCategory] = useState('');

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
        
        // Reference to preleased properties
        const propertiesRef = preleasedPropertiesRef;
        
        // Set up listener for real-time updates
        const unsubscribe = onValue(propertiesRef, (snapshot) => {
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
            // Also check legacy properties for Pre-Leased type
            const legacyRef = ref(database, 'properties');
            onValue(legacyRef, (legacySnapshot) => {
              if (legacySnapshot.exists()) {
                const legacyProperties: Property[] = [];
                legacySnapshot.forEach((childSnapshot) => {
                  const property = childSnapshot.val();
                  if (property.propertyType === 'Pre-Leased') {
                    legacyProperties.push({
                      id: childSnapshot.key,
                      ...property
                    } as Property);
                  }
                });
                setProperties(legacyProperties);
              } else {
                setProperties([]);
              }
              setIsLoading(false);
            });
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching properties:", error);
          setError('Failed to load properties. Please try again later.');
          setIsLoading(false);
        });
        
        // Clean up the listener on unmount
        return () => {
          setProperties([]);
        };
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/admin/login');
      }
    };
    
    checkAuthAndLoadData();
  }, [router]);

  // Filter properties based on search term and category
  const filteredProperties = properties.filter(property => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (property.tenant?.toLowerCase().includes(searchStr) || false) ||
      (property.location?.toLowerCase().includes(searchStr) || false) ||
      (property.category?.toLowerCase().includes(searchStr) || false) ||
      (property.buildingName?.toLowerCase().includes(searchStr) || false);
    
    // Apply category filter if selected
    const matchesCategory = selectedCategory ? 
      property.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Handle property deletion
  const handleDelete = async (id: string | null | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        setIsLoading(true);
        await deleteProperty(id, 'Pre-Leased');
        // No need to refresh properties as we're using real-time listener
      } catch (err) {
        console.error('Error deleting property:', err);
        setError('Failed to delete property. Please try again later.');
        setIsLoading(false);
      }
    }
  };

  // Get unique categories from properties
  const uniqueCategories = Array.from(
    new Set(properties.map(property => property.category).filter(Boolean))
  );

  // Formats a number value or returns a dash if undefined
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('en-IN');
  };

  // Formats a string value or returns a dash if undefined
  const formatString = (value: string | undefined): string => {
    if (!value) return '-';
    return value;
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pre-Leased Properties</h1>
        <Link
          href="/admin/Pre-Leased/new"
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Pre-Leased Property
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
            {uniqueCategories.map((category) => (
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TENANT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPERTY STATUS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BUILDING NAME</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DISTRICT NAME</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUB DISTRICT NAME</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FLOOR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL AREA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AREA ON SALE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LEASE TERM</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REMAINING LEASE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCK-IN</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESCALATION</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RENTAL TYPE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RENT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASKING PRICE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SECURITY DEPOSIT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADVANCE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REFERENCE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CHANNEL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPERTY TYPE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={24} className="px-4 py-2 whitespace-nowrap text-center text-gray-500">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatString(property.tenant)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.category)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.propertyStatus)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.buildingName)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.location)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.district)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.subDistrict)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.floor)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.totalArea)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.areaOnSale)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.leaseTerm)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.remainingLease)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.lockIn)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.escalation)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.rentalType)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{formatNumber(property.rent)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{formatNumber(property.askingPrice)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.securityDeposit)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.roi)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.advance)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.reference)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.channel)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(property.propertyType)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/admin/Pre-Leased/edit/${property.id}`}
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