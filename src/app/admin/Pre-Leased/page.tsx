"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

// Temporary interface for Pre-Leased Property
interface PreLeasedProperty {
  id: number;
  tenant: string;
  category: string;
  location: string;
  rent: number;
  askingPrice: number;
  roi: string;
  remainingLease: string;
}

export default function PreLeasedPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PreLeasedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for pre-leased properties
  const sampleProperties: PreLeasedProperty[] = [
    {
      id: 1,
      tenant: 'HDFC Bank',
      category: 'Bank',
      location: 'South Delhi',
      rent: 250000,
      askingPrice: 45000000,
      roi: '7.5%',
      remainingLease: '8 years'
    },
    {
      id: 2,
      tenant: 'McDonald\'s',
      category: 'F&B Brand',
      location: 'Noida',
      rent: 180000,
      askingPrice: 32000000,
      roi: '6.8%',
      remainingLease: '5 years'
    },
    {
      id: 3,
      tenant: 'PVR Cinemas',
      category: 'Multiplex',
      location: 'Gurgaon',
      rent: 650000,
      askingPrice: 120000000,
      roi: '6.5%',
      remainingLease: '12 years'
    }
  ];

  // Check authentication and load properties
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      // In a real app, you would fetch from API
      // For now, use sample data
      setProperties(sampleProperties);
      setIsLoading(false);
    }
  }, [router]);

  // Filter properties based on search term
  const filteredProperties = properties.filter(property => {
    const searchStr = searchTerm.toLowerCase();
    return (
      property.tenant.toLowerCase().includes(searchStr) ||
      property.location.toLowerCase().includes(searchStr) ||
      property.category.toLowerCase().includes(searchStr)
    );
  });

  // Handle property deletion
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      // In a real app, you would make an API call
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pre-Leased Properties</h1>
        <Link
          href="/admin/Pre-Leased/new"
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Pre-Leased Property
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative w-full sm:w-1/4">
          <select className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            <option value="Bank">Bank</option>
            <option value="F&B Brand">F&B Brand</option>
            <option value="Retail Space">Retail Space</option>
            <option value="Multiplex">Multiplex</option>
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
                    Tenant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asking Price (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Lease
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{property.tenant}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{property.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{property.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">₹{property.rent.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">₹{property.askingPrice.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {property.roi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{property.remainingLease}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/Pre-Leased/edit/${property.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaPencilAlt />
                          </button>
                          <button 
                            onClick={() => handleDelete(property.id)}
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