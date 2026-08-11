"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { Property, migratedPreleasedRef } from '@/lib/firebase';
import { get } from 'firebase/database';
import ClientOnly from '@/components/ClientOnly';
import { sortByNewest } from '@/lib/sort';
import { PreLeasedModal } from '@/components/preleased';

const PAGE_SIZE = 50;

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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadInProgress = useRef(false);

  // Load properties from Firebase - single optimized read
  const loadProperties = useCallback(async () => {
    if (loadInProgress.current) return;
    loadInProgress.current = true;
    
    try {
      setIsLoading(true);
      setError('');

      // Single read from migrated collection only (no legacy fallback needed)
      const snapshot = await get(migratedPreleasedRef);
      
      if (snapshot.exists()) {
        const allProperties: Property[] = [];
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
          
          allProperties.push(property as Property);
        });
        
        const sorted = sortByNewest(allProperties);
        setTotalCount(sorted.length);
        // Only show first page of results
        setProperties(sorted.slice(0, PAGE_SIZE));
      } else {
        setProperties([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
      loadInProgress.current = false;
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

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
    if (!id || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const { deleteProperty } = await import('@/lib/firebase');
      await deleteProperty(id, 'Pre-Leased');
      setDeleteConfirm(null);
      // Refresh the list after deletion
      await loadProperties();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) return 'Contact for Price';
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
              Showing {filteredProperties.length} of {totalCount} properties
            </p>
          </div>
          
          {filteredProperties.length === 0 ? (
            <div className="text-center py-20">
              <BsBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">
                {totalCount === 0 ? 'No properties found' : 'No matching properties'}
              </h3>
              <p className="text-gray-500 mb-4">
                {totalCount === 0 ? 'Add your first pre-leased property' : 'Try adjusting your search criteria'}
              </p>
              {totalCount === 0 && (
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
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setIsModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="View Property"
                            >
                              <FaEye />
                            </button>
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
                              disabled={!property.id || isDeleting}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    loadProperties();
                  }}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);
                    loadProperties();
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Pre-Leased Property Detail Modal */}
      <PreLeasedModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
      />

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
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 backdrop-blur-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
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