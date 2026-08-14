"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { Property } from '@/types/property';
import { useAdminData, useAdminMutation, invalidateCacheByPrefix } from '@/hooks/useAdminData';
import { sortByNewest } from '@/lib/sort';
import { VacantModal } from '@/components/vacant';
import { AdminCard, AdminButton, AdminModal, AdminEmptyState, SkeletonLoader } from '@/components/admin/ui';

const PAGE_SIZE = 50;

export default function VacantPropertiesPage() {
  return (
    <AdminLayout>
      <VacantPropertiesContent />
    </AdminLayout>
  );
}

function VacantPropertiesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch using cached hook — no redundant auth check
  const { data, isLoading, error, refetch } = useAdminData('/api/properties?propertyType=Vacant');

  const allProperties: Property[] = data?.properties
    ? sortByNewest(data.properties)
    : [];

  const totalCount = allProperties.length;
  const pagedProperties = allProperties.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Delete mutation with cache invalidation
  const { mutate: deleteProperty, isLoading: isDeleting } = useAdminMutation({
    invalidateKeys: ['/api/properties?propertyType=Vacant'],
  });

  const handleDelete = async (id: string) => {
    if (!id) return;
    const result = await deleteProperty(`/api/properties/${id}?propertyType=Vacant`, {
      method: 'DELETE',
    });
    if (result !== null) {
      setDeleteConfirm(null);
    }
  };

  // Client-side search filter
  const filteredProperties = pagedProperties.filter(property =>
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) return 'Contact for Price';
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacant Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your vacant property listings</p>
        </div>
        <Link href="/admin/vacant/new">
          <AdminButton icon={<FaPlus />}>
            <span className="hidden sm:inline">Add New Property</span>
            <span className="sm:hidden">Add</span>
          </AdminButton>
        </Link>
      </div>

      {/* Search */}
      <AdminCard className="mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by location, category, city, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-200 text-sm admin-input-focus hover:border-gray-300"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        </div>
      </AdminCard>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
          {error.message || 'Failed to load properties'}
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader type="table" rows={8} columns={8} />
      ) : (
        <>
          <div className="mb-3">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredProperties.length}</span> of <span className="font-semibold text-gray-700">{totalCount}</span> properties
            </p>
          </div>

          {filteredProperties.length === 0 ? (
            <AdminCard>
              <AdminEmptyState
                icon={<BsBuilding className="text-3xl" />}
                title={totalCount === 0 ? 'No properties found' : 'No matching properties'}
                description={totalCount === 0 ? 'Add your first vacant property' : 'Try adjusting your search criteria'}
                action={totalCount === 0 ? (
                  <AdminButton icon={<FaPlus />} onClick={() => window.location.href = '/admin/vacant/new'}>
                    Add New Property
                  </AdminButton>
                ) : undefined}
              />
            </AdminCard>
          ) : (
            <AdminCard padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PID</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">Location</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">Area</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">Rent</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">Contact</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProperties.map((property, index) => (
                      <tr key={property.id || `idx-${index}`} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            V{String(filteredProperties.length - ((currentPage - 1) * PAGE_SIZE + index)).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{property.location || property.city || '-'}</div>
                          <div className="text-xs text-gray-400">{property.state}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-50 text-primary-700">
                            {property.category || 'General'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          <div>{property.superArea || property.carpetArea || '-'}</div>
                          {property.floor && <div className="text-xs text-gray-400">Floor: {property.floor}</div>}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{property.propertyType || 'Vacant'}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">{formatCurrency(property.rent || 0)}</td>
                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                          <div>{property.contactName || '-'}</div>
                          {property.reference && <div className="text-xs text-gray-400">Ref: {property.reference}</div>}
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          <div className="flex space-x-1.5">
                            <button onClick={() => { setSelectedProperty(property); setIsModalOpen(true); }} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="View"><FaEye className="text-xs" /></button>
                            {property.id ? (
                              <Link href={`/admin/vacant/edit/${property.id}`} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors" title="Edit"><FaPencilAlt className="text-xs" /></Link>
                            ) : (
                              <span className="p-1.5 text-amber-300 cursor-not-allowed" title="Cannot edit"><FaPencilAlt className="text-xs" /></span>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(property.id || null)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                              disabled={!property.id || isDeleting}
                              title="Delete"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <VacantModal
        vacant={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProperty(null); }}
      />

      {/* Delete confirmation */}
      <AdminModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" loading={isDeleting} onClick={() => handleDelete(deleteConfirm!)}>Delete</AdminButton>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this property? This action cannot be undone.
        </p>
      </AdminModal>
    </>
  );
}
