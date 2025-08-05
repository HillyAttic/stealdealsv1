"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
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
  const [selectedIndustry, setSelectedIndustry] = useState('');

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

  // Filter franchises based on search term and industry
  const filteredFranchises = franchises.filter(franchise => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (franchise.name?.toLowerCase() || '').includes(searchStr) ||
      (franchise.location?.toLowerCase() || '').includes(searchStr) ||
      (franchise.industry?.toLowerCase() || '').includes(searchStr) ||
      (franchise.product?.toLowerCase() || '').includes(searchStr);
    
    // Apply industry filter if selected
    const matchesIndustry = selectedIndustry ? 
      franchise.industry?.toString() === selectedIndustry : true;
    
    return matchesSearch && matchesIndustry;
  });

  // Handle franchise deletion
  const handleDelete = async (id: string | null | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this franchise?')) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/franchises/${id}`, {
          method: 'DELETE',
          credentials: 'include' // Include cookies
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete: ${response.status}`);
        }
        
        // Filter out deleted franchise
        setFranchises(franchises.filter(franchise => franchise.id !== id));
        setIsLoading(false);
      } catch (err) {
        console.error('Error deleting franchise:', err);
        setError('Failed to delete franchise. Please try again later.');
        setIsLoading(false);
      }
    }
  };

  // Get unique industries from franchises
  const uniqueIndustries = Array.from(
    new Set(franchises.map(franchise => franchise.industry || '').filter(Boolean))
  );

  // Formats a string value or returns a dash if undefined
  const formatString = (value: string | undefined): string => {
    if (!value) return '-';
    return value;
  };

  // Format for displaying dates
  const formatDate = (dateStr?: string | number) => {
    if (!dateStr) return '-';
    
    try {
      let date: Date;
      if (typeof dateStr === 'number') {
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('en-IN');
    } catch (err) {
      return '-';
    }
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

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search franchises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative w-full sm:w-1/4">
          <select 
            className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INDUSTRY</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEGMENT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODEL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MIN AREA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAX AREA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MIN INVESTMENT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAX INVESTMENT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROYALITY</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTABLISHMENT YEAR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FRANCHISE STARTED YEAR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NUMBER OF OUTLETS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MIN PAYBACK PERIOD</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAX PAYBACK PERIOD</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HEADQUATER</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REMARKS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BRAND DECK</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT LIST/MENU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI SHEET</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADDDATE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODDATE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFranchises.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="px-4 py-2 whitespace-nowrap text-center text-gray-500">
                      No franchises found
                    </td>
                  </tr>
                ) : (
                  filteredFranchises.map((franchise, index) => (
                    <tr key={franchise.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{franchise.id || (index + 1)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.industry)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.segment)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.product || franchise.name)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.model)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.minArea)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.maxArea)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.minInvestment?.toString())}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString((franchise.maxInvestment || franchise.investment)?.toString())}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.royalty)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.establishmentYear)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.franchiseStartedYear)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.numberOutlets)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.minPaybackPeriod)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.maxPaybackPeriod)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.headquarter || franchise.location)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.remarks)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.brandDeck)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.productList)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatString(franchise.roiSheet)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(franchise.addDate || franchise.createdAt)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(franchise.modDate || franchise.updatedAt)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/admin/franchise/edit/${franchise.id}`}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer px-2 py-1 rounded hover:bg-blue-100 inline-block"
                            title="Edit"
                          >
                            <FaPencilAlt />
                          </Link>
                          <button 
                            onClick={() => handleDelete(franchise.id)}
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