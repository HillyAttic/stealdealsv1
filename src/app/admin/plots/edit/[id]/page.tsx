"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';
import dynamic from 'next/dynamic';

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new').then((mod) => {
    // Import CSS dynamically when component loads
    if (typeof window !== 'undefined') {
      import('react-quill-new/dist/quill.snow.css');
    }
    return mod;
  }), 
  { 
    ssr: false,
    loading: () => <p>Loading editor...</p>
  }
);

// Status options
const STATUS_OPTIONS = [
  'Ready to Move In',
  'Future Delivery'
];

// Unit options
const UNIT_OPTIONS = [
  'sq.yds',
  'sq.mt', 
  'sq.ft'
];

// Main component that receives params as props
export default function EditPlot({ params }: { params: Promise<{ id: string }> }) {
  const [plotId, setPlotId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Extract params in Next.js 15 compatible way
  useEffect(() => {
    const extractParams = async () => {
      try {
        const resolvedParams = await params;
        setPlotId(resolvedParams.id);
        setMounted(true);
      } catch (error) {
        console.error('Error extracting params:', error);
        setMounted(true);
      }
    };
    extractParams();
  }, [params]);

  // Show loading while extracting params
  if (!mounted) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="ml-2">Loading plot form...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <EditPlotContent plotId={plotId} />
    </AdminLayout>
  );
}

function EditPlotContent({ plotId }: { plotId: string }) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    developerName: '',
    project: '',
    description: '',
    status: '',
    plotSizeMin: '',
    plotSizeMax: '',
    plotSizeUnit: 'sq.yds',
    location: '',
    investmentAmount: '',
    investmentUnit: 'sq.yds',
    investorDiscoveryKitUrl: '',
    images: ['', '', '', '', ''] // 5 image URL slots
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check authentication and load plot data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Validate plotId
        if (!plotId) {
          setError('Plot ID is required');
          setIsLoadingData(false);
          return;
        }

        // Check authentication
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!authResponse.ok) {
          throw new Error('Authentication failed');
        }
        
        // Load plot data
        const plotResponse = await fetch(`/api/plots/${plotId}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!plotResponse.ok) {
          const errorData = await plotResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load plot data (${plotResponse.status})`);
        }
        
        const responseData = await plotResponse.json();
        const { plot } = responseData;
        
        if (!plot) {
          throw new Error('Plot data not found');
        }
        
        // Populate form with existing data
        setFormData({
          developerName: plot.developerName || '',
          project: plot.project || '',
          description: plot.description || '',
          status: plot.status || '',
          plotSizeMin: plot.plotSize?.min?.toString() || '',
          plotSizeMax: plot.plotSize?.max?.toString() || '',
          plotSizeUnit: plot.plotSize?.unit || 'sq.yds',
          location: plot.location || '',
          investmentAmount: plot.investmentStartsFrom?.amount?.toString() || '',
          investmentUnit: plot.investmentStartsFrom?.unit || 'sq.yds',
          investorDiscoveryKitUrl: plot.investorDiscoveryKit?.url || '',
          images: [
            ...(plot.images || []),
            ...Array(Math.max(0, 5 - (plot.images?.length || 0))).fill('')
          ].slice(0, 5)
        });
        
      } catch (err: any) {
        console.error("Error:", err);
        if (err.message.includes('Authentication')) {
          router.push('/admin/login');
        } else {
          setError(err.message || 'Failed to load plot data');
        }
      } finally {
        setIsLoadingData(false);
      }
    };
    
    if (plotId) {
      checkAuthAndLoadData();
    }
  }, [router, plotId]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle description change (ReactQuill)
  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
    
    if (errors.description) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  };
  
  // Handle image URL changes
  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.developerName.trim()) {
      newErrors.developerName = 'Developer Name is required';
    }
    
    if (!formData.project.trim()) {
      newErrors.project = 'Project name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    // Validate plot size
    const minSize = parseFloat(formData.plotSizeMin);
    const maxSize = parseFloat(formData.plotSizeMax);
    
    if (!formData.plotSizeMin || isNaN(minSize) || minSize <= 0) {
      newErrors.plotSizeMin = 'Valid minimum plot size is required';
    }
    
    if (!formData.plotSizeMax || isNaN(maxSize) || maxSize <= 0) {
      newErrors.plotSizeMax = 'Valid maximum plot size is required';
    }
    
    if (!isNaN(minSize) && !isNaN(maxSize) && minSize > maxSize) {
      newErrors.plotSizeMax = 'Maximum size must be greater than minimum size';
    }
    
    // Validate investment amount
    const investmentAmount = parseFloat(formData.investmentAmount);
    if (!formData.investmentAmount || isNaN(investmentAmount) || investmentAmount <= 0) {
      newErrors.investmentAmount = 'Valid investment amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare the data payload
      const plotData = {
        developerName: formData.developerName.trim(),
        project: formData.project.trim(),
        description: formData.description,
        status: formData.status,
        plotSize: {
          min: parseFloat(formData.plotSizeMin),
          max: parseFloat(formData.plotSizeMax),
          unit: formData.plotSizeUnit
        },
        location: formData.location.trim(),
        investmentStartsFrom: {
          amount: parseFloat(formData.investmentAmount),
          unit: formData.investmentUnit
        },
        investorDiscoveryKit: {
          title: 'Investor Discovery Kit',
          url: formData.investorDiscoveryKitUrl.trim(),
          description: 'Contains brochure, payment plan, and promotional video'
        },
        images: formData.images.filter(img => img.trim() !== '')
      };
      
      const response = await fetch(`/api/plots/${plotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(plotData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Plot updated successfully!');
        setTimeout(() => {
          router.push('/admin/plots');
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to update plot');
      }
    } catch (err: any) {
      console.error('Error updating plot:', err);
      setError(err.message || 'Failed to update plot');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
        <p className="ml-4">Loading plot data...</p>
      </div>
    );
  }

  // Show error state if data failed to load
  if (error && !isLoadingData) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Plot Data</h2>
            <p className="mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
              <button
                onClick={() => router.push('/admin/plots')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Plots
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <BsMenuUp className="text-2xl text-blue-900 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Edit Plot Project</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Developer Name */}
            <div>
              <label htmlFor="developerName" className="block text-sm font-medium text-gray-700 mb-2">
                Developer Name *
              </label>
              <input
                type="text"
                id="developerName"
                name="developerName"
                value={formData.developerName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.developerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter developer name"
              />
              {errors.developerName && (
                <p className="text-red-500 text-xs mt-1">{errors.developerName}</p>
              )}
            </div>
            
            {/* Project Name */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.project ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.project && (
                <p className="text-red-500 text-xs mt-1">{errors.project}</p>
              )}
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
            
            {/* Plot Size Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Size Range *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    name="plotSizeMin"
                    value={formData.plotSizeMin}
                    onChange={handleChange}
                    placeholder="Min size"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.plotSizeMin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.plotSizeMin && (
                    <p className="text-red-500 text-xs mt-1">{errors.plotSizeMin}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    name="plotSizeMax"
                    value={formData.plotSizeMax}
                    onChange={handleChange}
                    placeholder="Max size"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.plotSizeMax ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.plotSizeMax && (
                    <p className="text-red-500 text-xs mt-1">{errors.plotSizeMax}</p>
                  )}
                </div>
                <div>
                  <select
                    name="plotSizeUnit"
                    value={formData.plotSizeUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Investment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Starts From *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.investmentAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.investmentAmount && (
                    <p className="text-red-500 text-xs mt-1">{errors.investmentAmount}</p>
                  )}
                </div>
                <div>
                  <select
                    name="investmentUnit"
                    value={formData.investmentUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>per {unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Investor Discovery Kit URL */}
            <div>
              <label htmlFor="investorDiscoveryKitUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Investor Discovery Kit URL
              </label>
              <input
                type="url"
                id="investorDiscoveryKitUrl"
                name="investorDiscoveryKitUrl"
                value={formData.investorDiscoveryKitUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <ReactQuill
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Enter project description..."
              className="bg-white"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
          
          {/* Image URLs */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Images (URLs)
            </label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index}>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`Image ${index + 1} URL`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/plots')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Updating...' : 'Update Plot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}