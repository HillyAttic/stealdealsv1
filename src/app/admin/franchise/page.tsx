"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

// Temporary interface for Franchise
interface Franchise {
  id: number;
  name: string;
  industry: string;
  investment: number;
  location: string;
  status: string;
  roi: string;
}

export default function FranchisePage() {
  const router = useRouter();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for franchises
  const sampleFranchises: Franchise[] = [
    {
      id: 1,
      name: 'Burger King',
      industry: 'Food & Beverage',
      investment: 5000000,
      location: 'Pan India',
      status: 'Available',
      roi: '15-20%'
    },
    {
      id: 2,
      name: 'Domino\'s Pizza',
      industry: 'Food & Beverage',
      investment: 3000000,
      location: 'Metropolitan Cities',
      status: 'Available',
      roi: '18-22%'
    },
    {
      id: 3,
      name: 'Kaya Skin Clinic',
      industry: 'Health & Beauty',
      investment: 7500000,
      location: 'Tier 1 Cities',
      status: 'Limited',
      roi: '20-25%'
    },
    {
      id: 4,
      name: 'Baskin Robbins',
      industry: 'Food & Beverage',
      investment: 2000000,
      location: 'Pan India',
      status: 'Available',
      roi: '15-18%'
    }
  ];

  // Check authentication and load franchises
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      // In a real app, you would fetch from API
      // For now, use sample data
      setFranchises(sampleFranchises);
      setIsLoading(false);
    }
  }, [router]);

  // Filter franchises based on search term
  const filteredFranchises = franchises.filter(franchise => {
    const searchStr = searchTerm.toLowerCase();
    return (
      franchise.name.toLowerCase().includes(searchStr) ||
      franchise.industry.toLowerCase().includes(searchStr) ||
      franchise.location.toLowerCase().includes(searchStr)
    );
  });

  // Handle franchise deletion
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this franchise?')) {
      // In a real app, you would make an API call
      setFranchises(franchises.filter(f => f.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Franchise Opportunities</h1>
        <Link
          href="/admin/franchise/new"
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Franchise
        </Link>
      </div>

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
          <select className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Industries</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Health & Beauty">Health & Beauty</option>
            <option value="Retail">Retail</option>
            <option value="Education">Education</option>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Franchise
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFranchises.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      No franchises found
                    </td>
                  </tr>
                ) : (
                  filteredFranchises.map((franchise) => (
                    <tr key={franchise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{franchise.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{franchise.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">₹{franchise.investment.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{franchise.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-900">{franchise.roi}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          franchise.status === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {franchise.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/franchise/edit/${franchise.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaPencilAlt />
                          </button>
                          <button 
                            onClick={() => handleDelete(franchise.id)}
                            className="text-red-600 hover:text-red-900"
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
    </AdminLayout>
  );
} 