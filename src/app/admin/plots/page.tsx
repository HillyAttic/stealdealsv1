"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { Plot } from '@/types/property';
import { PlotModal } from '@/components/plots';
import { useAdminData, useAdminMutation } from '@/hooks/useAdminData';
import { AdminCard, AdminButton, AdminModal, AdminEmptyState, SkeletonLoader } from '@/components/admin/ui';

export default function PlotsAdmin() {
  return (
    <AdminLayout>
      <PlotsAdminContent />
    </AdminLayout>
  );
}

function PlotsAdminContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useAdminData('/api/plots');
  const plots: Plot[] = data?.plots || [];

  const { mutate: deletePlot } = useAdminMutation({
    invalidateKeys: ['/api/plots'],
  });

  const handleDelete = async (id: string) => {
    if (!id) return;
    const result = await deletePlot(`/api/plots/${id}`, { method: 'DELETE' });
    if (result !== null) setDeleteConfirm(null);
  };

  const filteredPlots = plots.filter(plot =>
    plot.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.developerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plot Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage plot projects and listings</p>
        </div>
        <AdminButton icon={<FaPlus />}>
          <Link href="/admin/plots/new" className="flex items-center gap-2">
            <span className="hidden sm:inline">Add New Plot</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </AdminButton>
      </div>

      <AdminCard className="mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search plots by project, developer, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-200 text-sm admin-input-focus hover:border-gray-300"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        </div>
      </AdminCard>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">{error.message}</div>
      )}

      {isLoading ? (
        <SkeletonLoader type="table" rows={6} columns={8} />
      ) : (
        <>
          <div className="mb-3">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredPlots.length}</span> of <span className="font-semibold text-gray-700">{plots.length}</span> plots
            </p>
          </div>

          {filteredPlots.length === 0 ? (
            <AdminCard>
              <AdminEmptyState
                icon={<BsBuilding className="text-3xl" />}
                title={plots.length === 0 ? 'No plots found' : 'No matching plots'}
                description={plots.length === 0 ? 'Create your first plot project' : 'Try adjusting your search criteria'}
              />
            </AdminCard>
          ) : (
            <AdminCard padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">PID</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 lg:w-40">Project</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 hidden lg:table-cell">Developer</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 hidden xl:table-cell">Location</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 hidden md:table-cell">Status</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">Plot Size</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Investment</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPlots.map((plot, index) => (
                      <tr key={plot.id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            P{String(filteredPlots.length - index).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{plot.project}</div>
                          {plot.images?.[0] && (
                            <img src={plot.images[0]} alt={plot.project} className="w-10 h-6 object-cover rounded mt-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 truncate hidden lg:table-cell">{plot.developerName}</td>
                        <td className="px-2 py-2 text-xs text-gray-500 truncate hidden xl:table-cell">{plot.location}</td>
                        <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${plot.status === 'Ready to Move In' ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'}`}>
                            {plot.status === 'Ready to Move In' ? 'Ready' : plot.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap hidden lg:table-cell">
                          {plot.plotSize?.min}-{plot.plotSize?.max} {plot.plotSize?.unit}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-900 font-medium">
                          <div className="truncate">{formatCurrency(plot.investmentStartsFrom?.amount || 0)} / {plot.investmentStartsFrom?.unit}</div>
                        </td>
                        <td className="px-2 py-2 text-sm whitespace-nowrap sticky right-0 bg-white">
                          <div className="flex items-center justify-center space-x-1">
                            <button onClick={() => { setSelectedPlot(plot); setIsModalOpen(true); }} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="View"><FaEye className="text-xs" /></button>
                            <Link href={`/admin/plots/edit/${plot.id}`} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors" title="Edit"><FaPencilAlt className="text-xs" /></Link>
                            <button onClick={() => setDeleteConfirm(plot.id || null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete"><FaTrash className="text-xs" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}
        </>
      )}

      <PlotModal plot={selectedPlot} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedPlot(null); }} />

      <AdminModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm"
        footer={<>
          <AdminButton variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
          <AdminButton variant="danger" onClick={() => handleDelete(deleteConfirm!)}>Delete</AdminButton>
        </>}
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this plot? This action cannot be undone.</p>
      </AdminModal>
    </>
  );
}
