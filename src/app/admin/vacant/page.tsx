"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { Property } from '@/types/property';
import { useAdminData, useAdminMutation } from '@/hooks/useAdminData';
import { sortByNewest } from '@/lib/sort';
import { VacantModal } from '@/components/vacant';
import { AdminCard, AdminButton, AdminModal, AdminEmptyState, SkeletonLoader } from '@/components/admin/ui';

const PAGE_SIZE = 50;

export default function VacantPropertiesContent() {
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

  // Search spans every property, not just the visible page — otherwise a match sitting
  // on page 3 reads as "No matching properties" while you are looking at page 1.
  const needle = searchTerm.trim().toLowerCase();
  const filteredProperties = needle
    ? allProperties.filter(property =>
        property.location?.toLowerCase().includes(needle) ||
        property.category?.toLowerCase().includes(needle) ||
        property.city?.toLowerCase().includes(needle) ||
        property.contactName?.toLowerCase().includes(needle)
      )
    : allProperties;

  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) return 'Contact for Price';
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pagedProperties = filteredProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div data-theme="cobalt" className="cobalt-page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Vacant Properties</h1>
          <p className="page-sub">Manage your vacant property listings</p>
        </div>
        <Link href="/admin/vacant/new" className="btn btn--primary">
          <FaPlus aria-hidden="true" />
          Add new property
        </Link>
      </header>

      {/* Search */}
      <AdminCard className="mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by location, category, city, or contact..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
        <SkeletonLoader type="table" rows={8} columns={9} />
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
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">PID</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 lg:w-40">Location</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden md:table-cell">Category</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">Area</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 hidden xl:table-cell">Type</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Rent</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 hidden lg:table-cell">Contact</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 hidden lg:table-cell">Added By</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedProperties.map((property, index) => (
                      <tr key={property.id || `idx-${index}`} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            V{String(filteredProperties.length - ((page - 1) * PAGE_SIZE + index)).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{property.location || property.city || '-'}</div>
                          <div className="text-xs text-gray-400 truncate">{property.state}</div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary-50 text-primary-700">
                            {property.category || 'General'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 hidden lg:table-cell">
                          <div className="truncate">{property.superArea || property.carpetArea || '-'}</div>
                          {property.floor && <div className="text-xs text-gray-400">Fl: {property.floor}</div>}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap hidden xl:table-cell">{property.propertyType || 'Vacant'}</td>
                        <td className="px-2 py-2 text-xs text-gray-900 font-medium">
                          <div className="truncate">{formatCurrency(property.rent || 0)}</div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 hidden lg:table-cell">
                          <div className="truncate">{property.contactName || '-'}</div>
                          {property.reference && <div className="text-xs text-gray-400 truncate">Ref: {property.reference}</div>}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 hidden lg:table-cell">
                          <div className="truncate" title={property.createdByName || ''}>{property.createdByName || '—'}</div>
                        </td>
                        <td className="px-2 py-2 text-sm whitespace-nowrap sticky right-0 bg-white">
                          <div className="flex items-center justify-center space-x-1">
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
            <div className="mt-4 pb-24 flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
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
    </div>
  );
}
