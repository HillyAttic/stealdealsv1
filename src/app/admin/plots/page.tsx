"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaPencilAlt } from 'react-icons/fa';
import { BsBuilding } from 'react-icons/bs';
import ClientOnly from '@/components/ClientOnly';
import { Plot } from '@/lib/firebase';

export default function PlotsAdmin() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading plots...</p>
          </div>
        }
      >
        <PlotsAdminContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function PlotsAdminContent() {
  const router = useRouter();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check authentication and load plots
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!authResponse.ok) {
          throw new Error('Authentication failed');
        }

        // Load plots
        const plotsResponse = await fetch('/api/plots', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (plotsResponse.ok) {
          const data = await plotsResponse.json();
          setPlots(data.plots || []);
        } else {
          throw new Error('Failed to load plots');
        }
      } catch (err: any) {
        console.error("Error:", err);
        if (err.message.includes('Authentication')) {
          router.push('/admin/login');
        } else {
          setError(err.message || 'Failed to load plots');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndLoadData();
  }, [router]);

  // Filter plots based on search term
  const filteredPlots = plots.filter(plot =>
    plot.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.developerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete plot
  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/plots/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setPlots(plots.filter(plot => plot.id !== id));
        setDeleteConfirm(null);
      } else {
        throw new Error('Failed to delete plot');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete plot');
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Plot Inventory</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/plots/new"
            className="px-3 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center text-sm"
          >
            <FaPlus className="mr-1" />
            <span className="hidden sm:inline">Add New Plot</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>
        
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search plots by project, developer, or location..."
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
                Showing {filteredPlots.length} of {plots.length} plots
              </p>
            </div>
            
            {filteredPlots.length === 0 ? (
              <div className="text-center py-20">
                <BsBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl text-gray-600 mb-2">
                  {plots.length === 0 ? 'No plots found' : 'No matching plots'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {plots.length === 0 ? 'Create your first plot project' : 'Try adjusting your search criteria'}
                </p>
                {plots.length === 0 && (
                  <Link
                    href="/admin/plots/new"
                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                  >
                    Add New Plot
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">PROJECT</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">DEVELOPER</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">LOCATION</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">STATUS</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">PLOT SIZE</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">INVESTMENT</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlots.map((plot, index) => (
                  <tr key={plot.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <span className="font-mono text-xs text-gray-500">
                        P{String(index + 1).padStart(3, '0')}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plot.project}</div>
                      {plot.images && plot.images[0] && (
                        <img 
                          src={plot.images[0]} 
                          alt={plot.project}
                          className="w-12 h-8 object-cover rounded mt-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{plot.developerName}</td>
                    <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{plot.location}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plot.status === 'Ready to Move In' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {plot.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {plot.plotSize?.min}-{plot.plotSize?.max} {plot.plotSize?.unit}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatCurrency(plot.investmentStartsFrom?.amount || 0)} / {plot.investmentStartsFrom?.unit}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/plots/${plot.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          target="_blank"
                          title="View Plot"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/plots/edit/${plot.id}`}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Edit Plot"
                        >
                          <FaPencilAlt />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(plot.id || null)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Plot"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this plot? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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