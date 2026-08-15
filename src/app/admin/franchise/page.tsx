"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import { FranchiseModal } from '@/components/franchise';
import {
  AdminFranchise,
  getFieldFromFranchise,
  getInvestmentFromFranchise,
  getFranchiseDisplayName,
  matchesFranchiseSearch,
} from '@/lib/admin/franchiseHelpers';
import { useAdminData, useAdminMutation } from '@/hooks/useAdminData';
import { AdminCard, AdminButton, AdminModal, AdminEmptyState, SkeletonLoader } from '@/components/admin/ui';

interface Franchise {
  id?: string | null;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number;
  maxInvestment?: number;
  royalty?: string;
  establishmentYear?: string;
  franchiseStartedYear?: string;
  numberOutlets?: string;
  minPaybackPeriod?: string;
  maxPaybackPeriod?: string;
  headquarter?: string;
  remarks?: string;
  brandDeck?: string;
  productList?: string;
  roiSheet?: string;
  investorDiscoveryKitUrl?: string;
  investment: number;
  location: string;
  status: string;
  roi: string;
  addUser?: string;
  addDate?: string;
  modUser?: string;
  modDate?: string;
  description?: string;
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function FranchisePage() {
  return (
    <AdminLayout>
      <FranchiseContent />
    </AdminLayout>
  );
}

function FranchiseContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useAdminData('/api/franchises');
  const franchises: AdminFranchise[] = data?.franchises || [];

  const { mutate: deleteFranchise } = useAdminMutation({
    invalidateKeys: ['/api/franchises'],
  });

  const filteredFranchises = franchises.filter(f => matchesFranchiseSearch(f, searchTerm));

  const handleViewFranchise = (af: AdminFranchise) => {
    const franchise: Franchise = {
      id: af.id,
      name: getFieldFromFranchise(af, 'name'),
      industry: getFieldFromFranchise(af, 'industry'),
      segment: getFieldFromFranchise(af, 'segment'),
      product: getFieldFromFranchise(af, 'product'),
      model: getFieldFromFranchise(af, 'model'),
      minArea: getFieldFromFranchise(af, 'minArea'),
      maxArea: getFieldFromFranchise(af, 'maxArea'),
      minInvestment: parseFloat(getInvestmentFromFranchise(af, 'min')) || undefined,
      maxInvestment: parseFloat(getInvestmentFromFranchise(af, 'max')) || undefined,
      royalty: getFieldFromFranchise(af, 'royalty'),
      establishmentYear: getFieldFromFranchise(af, 'establishmentYear'),
      franchiseStartedYear: getFieldFromFranchise(af, 'franchiseStartedYear'),
      numberOutlets: getFieldFromFranchise(af, 'numberOfOutlets') || af.numberOutlets,
      minPaybackPeriod: getFieldFromFranchise(af, 'minPaybackPeriod'),
      maxPaybackPeriod: getFieldFromFranchise(af, 'maxPaybackPeriod'),
      headquarter: getFieldFromFranchise(af, 'headquarter'),
      remarks: getFieldFromFranchise(af, 'remarks'),
      brandDeck: getFieldFromFranchise(af, 'brandDeck'),
      productList: getFieldFromFranchise(af, 'productList'),
      roiSheet: getFieldFromFranchise(af, 'roiSheet'),
      investorDiscoveryKitUrl: getFieldFromFranchise(af, 'investorDiscoveryKitUrl'),
      investment: parseFloat(getInvestmentFromFranchise(af, 'min')) || 0,
      location: getFieldFromFranchise(af, 'headquarter') || af.location || '',
      status: af.status || 'Active',
      roi: getFieldFromFranchise(af, 'royalty'),
      image: af.images?.[0] || af.image,
      franchiseDetails: af.franchiseDetails,
    };
    setSelectedFranchise(franchise);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    const result = await deleteFranchise(`/api/franchises/${id}`, { method: 'DELETE' });
    if (result !== null) setDeleteConfirm(null);
  };

  const formatCurrency = (amount: number | string): string => {
    if (!amount) return 'Not specified';
    if (typeof amount === 'string' && (amount.includes('LACS') || amount.includes('CR') || amount.includes('LAKHS') || amount.includes('CRORE'))) {
      return amount.startsWith('₹') ? amount : `₹${amount}`;
    }
    if (typeof amount === 'string' && isNaN(Number(amount))) return `₹${amount}`;
    const numAmount = typeof amount === 'string' ? Number(amount) : amount;
    if (isNaN(numAmount)) return 'Not specified';
    if (numAmount < 1000) return `₹${numAmount} LACS`;
    if (numAmount >= 10000000) return `₹${(numAmount / 10000000).toFixed(1)} Cr`;
    if (numAmount >= 100000) return `₹${(numAmount / 100000).toFixed(1)} Lakhs`;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchise Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage franchise opportunities</p>
        </div>
        <AdminButton icon={<FaPlus />}>
          <Link href="/admin/franchise/new" className="flex items-center gap-2">
            <span className="hidden sm:inline">Add New Franchise</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </AdminButton>
      </div>

      <AdminCard className="mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search franchises by name, industry, or location..."
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
              Showing <span className="font-semibold text-gray-700">{filteredFranchises.length}</span> of <span className="font-semibold text-gray-700">{franchises.length}</span> franchises
            </p>
          </div>

          {filteredFranchises.length === 0 ? (
            <AdminCard>
              <AdminEmptyState
                icon={<BsBuilding className="text-3xl" />}
                title={franchises.length === 0 ? 'No franchises found' : 'No matching franchises'}
                description={franchises.length === 0 ? 'Create your first franchise opportunity' : 'Try adjusting your search criteria'}
              />
            </AdminCard>
          ) : (
            <AdminCard padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">FID</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 lg:w-40">Brand</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">Industry</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 hidden xl:table-cell">Location</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 hidden md:table-cell">Status</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 lg:w-40">Investment</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 hidden xl:table-cell">Royalty</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredFranchises.map((franchise, index) => (
                      <tr key={franchise.id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            F{String(filteredFranchises.length - index).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate" title={getFranchiseDisplayName(franchise)}>
                            {getFranchiseDisplayName(franchise)}
                          </div>
                          {franchise.image && (
                            <img src={franchise.image} alt={getFranchiseDisplayName(franchise)} className="w-8 h-5 object-cover rounded mt-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                        </td>
                        <td className="px-2 py-2 hidden lg:table-cell">
                          <div className="text-xs text-gray-900 truncate">{getFieldFromFranchise(franchise, 'industry')}</div>
                          {getFieldFromFranchise(franchise, 'segment') && <div className="text-xs text-gray-500 truncate">{getFieldFromFranchise(franchise, 'segment')}</div>}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 truncate hidden xl:table-cell">{getFieldFromFranchise(franchise, 'headquarter')}</td>
                        <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${franchise.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {franchise.status === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-900 font-medium">
                          <div className="truncate">
                            {getInvestmentFromFranchise(franchise, 'max') && getInvestmentFromFranchise(franchise, 'max') !== getInvestmentFromFranchise(franchise, 'min')
                              ? `${formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'min')) || 0)} - ${formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'max')) || 0)}`
                              : formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'min')) || 0)
                            }
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap hidden xl:table-cell">{getFieldFromFranchise(franchise, 'royalty') || 'Contact'}</td>
                        <td className="px-2 py-2 text-sm whitespace-nowrap sticky right-0 bg-white">
                          <div className="flex items-center justify-center space-x-1">
                            <button onClick={() => handleViewFranchise(franchise)} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="View"><FaEye className="text-xs" /></button>
                            <Link href={`/admin/franchise/edit/${franchise.id}`} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors" title="Edit"><FaPencilAlt className="text-xs" /></Link>
                            <button onClick={() => setDeleteConfirm(franchise.id || null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete"><FaTrash className="text-xs" /></button>
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

      <FranchiseModal franchise={selectedFranchise} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedFranchise(null); }} />

      <AdminModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm"
        footer={<>
          <AdminButton variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</AdminButton>
          <AdminButton variant="danger" onClick={() => handleDelete(deleteConfirm!)}>Delete</AdminButton>
        </>}
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this franchise? This action cannot be undone.</p>
      </AdminModal>
    </>
  );
}
