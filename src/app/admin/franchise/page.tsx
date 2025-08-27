"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import ClientOnly from '@/components/ClientOnly';

// Franchise interface
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
  investment: number;  // Legacy field
  location: string;    // Legacy field
  status: string;
  roi: string;         // Legacy field
  addUser?: string;
  addDate?: string;
  modUser?: string;
  modDate?: string;
  description?: string; // Legacy field
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function FranchisePage() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading franchise listings...</p>
          </div>
        }
      >
        <FranchiseContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function FranchiseContent() {
  const router = useRouter();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load franchises from API
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

        // Fetch franchises
        setIsLoading(true);
        const response = await fetch('/api/franchises', {
          credentials: 'include' // Include cookies
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch franchises: ${response.status}`);
        }
        
        const data = await response.json();
        setFranchises(data.franchises || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading franchises:", err);
        setError('Failed to load franchises. Please try again later.');
        setIsLoading(false);
      }
    };
    
    checkAuthAndLoadData();
  }, [router]);

  // Filter franchises based on search term
  const filteredFranchises = franchises.filter(franchise =>
    franchise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.headquarter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle franchise deletion
  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/franchises/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setFranchises(franchises.filter(franchise => franchise.id !== id));
        setDeleteConfirm(null);
      } else {
        throw new Error('Failed to delete franchise');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete franchise');
    }
  };

  // Format currency similar to plots page
  const formatCurrency = (amount: number | string): string => {
    if (!amount) return 'Not specified';
    if (typeof amount === 'string' && isNaN(Number(amount))) {
      return amount; // Return formatted string like "20 LACS"
    }
    const numAmount = typeof amount === 'string' ? Number(amount) : amount;
    if (isNaN(numAmount)) return 'Not specified';
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };



  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Franchise Inventory List</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/franchise/new"
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add New Franchise
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search franchises by name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredFranchises.length} of {franchises.length} franchises
            </p>
          </div>
          
          {filteredFranchises.length === 0 ? (
            <div className="text-center py-20">
              <BsBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">
                {franchises.length === 0 ? 'No franchises found' : 'No matching franchises'}
              </h3>
              <p className="text-gray-500 mb-4">
                {franchises.length === 0 ? 'Create your first franchise opportunity' : 'Try adjusting your search criteria'}
              </p>
              {franchises.length === 0 && (
                <Link
                  href="/admin/franchise/new"
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                  Add New Franchise
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-hidden">
                <table className="w-full divide-y divide-gray-200 table-fixed">
                  <thead className="table-light">
                    <tr>
                      <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FID</th>
                      <th className="w-1/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BRAND/NAME</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INDUSTRY</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                      <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="w-1/6 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INVESTMENT</th>
                      <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROYALTY</th>
                      <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFranchises.map((franchise, index) => (
                      <tr key={franchise.id} className="hover:bg-gray-50">
                        <td className="w-12 px-2 py-2 text-sm text-gray-900">
                          <span className="font-mono text-xs text-gray-500">
                            F{String(index + 1).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="w-1/4 px-2 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate" title={franchise.name || franchise.product}>
                            {franchise.name || franchise.product}
                          </div>
                          {franchise.image && (
                            <img 
                              src={franchise.image} 
                              alt={franchise.name}
                              className="w-10 h-6 object-cover rounded mt-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </td>
                        <td className="w-1/6 px-2 py-2">
                          <div className="text-sm text-gray-900 truncate" title={franchise.industry}>{franchise.industry}</div>
                          {franchise.segment && (
                            <div className="text-xs text-gray-500 truncate" title={franchise.segment}>{franchise.segment}</div>
                          )}
                        </td>
                        <td className="w-1/6 px-2 py-2 text-sm text-gray-500">
                          <div className="truncate" title={franchise.headquarter || franchise.location}>
                            {franchise.headquarter || franchise.location}
                          </div>
                        </td>
                        <td className="w-16 px-2 py-2">
                          <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                            franchise.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(franchise.status || 'Active').substring(0, 6)}
                          </span>
                        </td>
                        <td className="w-1/6 px-2 py-2 text-sm text-gray-900">
                          <div className="truncate" title={
                            franchise.maxInvestment && franchise.maxInvestment !== franchise.minInvestment
                              ? `${formatCurrency(franchise.minInvestment || 0)} - ${formatCurrency(franchise.maxInvestment || 0)}`
                              : formatCurrency(franchise.minInvestment || franchise.investment || 0)
                          }>
                            {franchise.maxInvestment && franchise.maxInvestment !== franchise.minInvestment
                              ? `${formatCurrency(franchise.minInvestment || 0)} - ${formatCurrency(franchise.maxInvestment || 0)}`
                              : formatCurrency(franchise.minInvestment || franchise.investment || 0)
                            }
                          </div>
                        </td>
                        <td className="w-20 px-2 py-2 text-sm text-gray-500">
                          <div className="truncate" title={franchise.royalty || franchise.roi || 'Contact for details'}>
                            {(franchise.royalty || franchise.roi || 'Contact').substring(0, 10)}
                          </div>
                        </td>
                        <td className="w-20 px-2 py-2 text-sm font-medium">
                          <div className="flex space-x-0.5">
                            <Link
                              href={`/franchise/${franchise.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-0.5"
                              target="_blank"
                              title="View Franchise"
                            >
                              <FaEye className="text-xs" />
                            </Link>
                            <Link
                              href={`/admin/franchise/edit/${franchise.id}`}
                              className="text-yellow-600 hover:text-yellow-900 p-0.5"
                              title="Edit Franchise"
                            >
                              <FaPencilAlt className="text-xs" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(franchise.id || null)}
                              className="text-red-600 hover:text-red-900 p-0.5"
                              title="Delete Franchise"
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
              Are you sure you want to delete this franchise? This action cannot be undone.
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