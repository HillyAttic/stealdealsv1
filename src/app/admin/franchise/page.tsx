"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrash, FaEye, FaSearch, FaPencilAlt, FaTimes, FaCheck, FaBuilding } from 'react-icons/fa';
import { FranchiseModal } from '@/components/franchise';
import {
  AdminFranchise,
  getFieldFromFranchise,
  getInvestmentFromFranchise,
  getFranchiseDisplayName,
  matchesFranchiseSearch,
} from '@/lib/admin/franchiseHelpers';
import { useAdminData, useAdminMutation } from '@/hooks/useAdminData';

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
  franchiseDetails?: AdminFranchise['franchiseDetails'];
}

const SHELL = 'cobalt-page';

export default function FranchiseContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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
    setIsDeleting(true);
    const result = await deleteFranchise(`/api/franchises/${id}`, { method: 'DELETE' });
    setIsDeleting(false);
    if (result !== null) {
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        setDeleteConfirm(null);
      }, 1200);
    }
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

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteConfirm(null);
    setDeleteSuccess(false);
  };

  return (
    <>
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <h1 className="page-title">Franchise Inventory</h1>
            <p className="page-sub">Manage franchise opportunities</p>
          </div>
          <Link href="/admin/franchise/new" className="btn btn--primary">
            <FaPlus aria-hidden="true" />
            Add new franchise
          </Link>
        </header>

        {/* Search */}
        <section className="panel panel--filters">
          <div className="field">
            <label htmlFor="franchise-search" className="field-label">Search</label>
            <div className="search">
              <FaSearch className="search-icon" aria-hidden="true" />
              <input
                id="franchise-search"
                type="text"
                placeholder="Search franchises by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="cobalt-error">{error.message}</div>
        )}

        {isLoading ? (
          <div className="panel">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="admin-skeleton h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="page-count">
              Showing <strong>{filteredFranchises.length}</strong> of <strong>{franchises.length}</strong> franchises
            </p>

            {filteredFranchises.length === 0 ? (
              <section className="panel">
                <div className="empty">
                  <FaBuilding size={24} aria-hidden="true" />
                  <p className="empty-title">
                    {franchises.length === 0 ? 'No franchises found' : 'No matching franchises'}
                  </p>
                  <p className="empty-hint">
                    {franchises.length === 0
                      ? 'Create your first franchise opportunity'
                      : 'Try adjusting your search criteria'}
                  </p>
                </div>
              </section>
            ) : (
              <section className="panel panel--flush">
                <div className="table-scroll">
                  <table className="data-table data-table--compact">
                    <thead>
                      <tr>
                        <th className="w-16">FID</th>
                        <th className="w-40">Brand</th>
                        <th className="hidden lg:table-cell">Industry</th>
                        <th className="hidden xl:table-cell">Location</th>
                        <th className="hidden md:table-cell">Status</th>
                        <th>Investment</th>
                        <th className="hidden xl:table-cell">Royalty</th>
                        <th className="is-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFranchises.map((franchise, index) => (
                        <tr key={franchise.id}>
                          <td>
                            <span className="fid">
                              F{String(filteredFranchises.length - index).padStart(3, '0')}
                            </span>
                          </td>
                          <td>
                            <div className="brand-cell">
                              <span
                                className="identity-name truncate"
                                title={getFranchiseDisplayName(franchise)}
                              >
                                {getFranchiseDisplayName(franchise)}
                              </span>
                              {franchise.image && (
                                <img
                                  src={franchise.image}
                                  alt=""
                                  className="brand-thumb"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell">
                            <p>{getFieldFromFranchise(franchise, 'industry')}</p>
                            {getFieldFromFranchise(franchise, 'segment') && (
                              <p className="muted-note">{getFieldFromFranchise(franchise, 'segment')}</p>
                            )}
                          </td>
                          <td className="hidden xl:table-cell muted-note">
                            {getFieldFromFranchise(franchise, 'headquarter')}
                          </td>
                          <td className="hidden md:table-cell">
                            <span className={franchise.status === 'Active' ? 'badge badge--accent' : 'badge'}>
                              {franchise.status === 'Active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <span className="cell-value">
                              {getInvestmentFromFranchise(franchise, 'max') && getInvestmentFromFranchise(franchise, 'max') !== getInvestmentFromFranchise(franchise, 'min')
                                ? `${formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'min')) || 0)} - ${formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'max')) || 0)}`
                                : formatCurrency(parseFloat(getInvestmentFromFranchise(franchise, 'min')) || 0)
                              }
                            </span>
                          </td>
                          <td className="hidden xl:table-cell muted-note">
                            {getFieldFromFranchise(franchise, 'royalty') || 'Contact'}
                          </td>
                          <td className="is-right">
                            <div className="row-actions">
                              <button
                                onClick={() => handleViewFranchise(franchise)}
                                className="icon-btn icon-btn--accent"
                                title="View"
                                aria-label={`View ${getFranchiseDisplayName(franchise)}`}
                              >
                                <FaEye />
                              </button>
                              <Link
                                href={`/admin/franchise/edit/${franchise.id}`}
                                className="icon-btn icon-btn--warn"
                                title="Edit"
                                aria-label={`Edit ${getFranchiseDisplayName(franchise)}`}
                              >
                                <FaPencilAlt />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(franchise.id || null)}
                                className="icon-btn icon-btn--danger"
                                title="Delete"
                                aria-label={`Delete ${getFranchiseDisplayName(franchise)}`}
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
              </section>
            )}
          </>
        )}

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="modal-backdrop">
            <div className="modal-backdrop-shade" onClick={closeDeleteModal} />
            <div className="modal modal--sm" role="dialog" aria-modal="true" aria-label="Confirm delete">
              <div className="modal-head">
                <h2 className="modal-title">Confirm delete</h2>
                <button onClick={closeDeleteModal} className="modal-close" aria-label="Close">
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {deleteSuccess ? (
                  <div className="confirm">
                    <div className="confirm-icon confirm-icon--ok">
                      <FaCheck aria-hidden="true" />
                    </div>
                    <div>
                      <p className="confirm-title">Franchise deleted</p>
                      <p className="confirm-text">The record has been removed successfully.</p>
                    </div>
                  </div>
                ) : (
                  <div className="confirm">
                    <div className="confirm-icon">
                      <FaTrash aria-hidden="true" />
                    </div>
                    <p className="confirm-text">
                      Are you sure you want to delete this franchise? This action cannot be undone.
                    </p>
                    <div className="modal-actions">
                      <button onClick={closeDeleteModal} disabled={isDeleting} className="btn">
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(deleteConfirm!)}
                        disabled={isDeleting}
                        className="btn btn--danger"
                      >
                        {isDeleting ? (
                          <><span className="spin" aria-hidden="true" /><span>Deleting…</span></>
                        ) : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <FranchiseModal
        franchise={selectedFranchise}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedFranchise(null); }}
      />
    </>
  );
}
