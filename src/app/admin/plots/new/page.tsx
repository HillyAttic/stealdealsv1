"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';
import ClientOnly from '@/components/ClientOnly';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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

export default function NewPlot() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading plot form...</p>
          </div>
        }
      >
        <NewPlotContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function NewPlotContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Check authentication using HTTP-only cookies
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
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
      newErrors.project = 'Project is required';
    }
    
    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Project Status is required';
    }
    
    if (!formData.plotSizeMin || !formData.plotSizeMax) {
      newErrors.plotSize = 'Plot size range is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.investmentAmount) {
      newErrors.investmentAmount = 'Investment amount is required';
    }
    
    if (!formData.investorDiscoveryKitUrl.trim()) {
      newErrors.investorDiscoveryKitUrl = 'Investor Discovery Kit URL is required';
    }
    
    // At least one image is required
    const hasImages = formData.images.some(img => img.trim() !== '');
    if (!hasImages) {
      newErrors.images = 'At least one project image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Prepare plot data
      const plotData = {
        developerName: formData.developerName,
        project: formData.project,
        description: formData.description,
        status: formData.status,
        plotSize: {
          min: Number(formData.plotSizeMin),
          max: Number(formData.plotSizeMax),
          unit: formData.plotSizeUnit
        },
        location: formData.location,
        investmentStartsFrom: {
          amount: Number(formData.investmentAmount),
          unit: formData.investmentUnit
        },
        investorDiscoveryKit: {
          title: 'Investor Discovery Kit',
          url: formData.investorDiscoveryKitUrl,
          description: 'Contains brochure, payment plan, and promotional video'
        },
        images: formData.images.filter(img => img.trim() !== '') // Remove empty image URLs
      };
      
      // Use the API endpoint with HTTP-only cookie authentication
      const response = await fetch('/api/plots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(plotData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create plot');
      }
      
      setSuccess('Plot added successfully!');
      
      // Reset form or navigate away after short delay
      setTimeout(() => {
        router.push('/admin/plots');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving plot:', err);
      setError(err.message || 'Failed to save plot');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-4 rounded">
        <div className="card-title d-flex align-items-center flex justify-between mb-4">
          <div className="flex items-center">
            <h5 className="mb-0 text-xl font-bold text-blue-900">New Plot Project</h5>
          </div>
          <div>
            <button 
              type="button" 
              onClick={() => router.push('/admin/plots')}
              className="btn btn-outline-danger px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
            >
              <BsMenuUp className="inline mr-1" /> List
            </button>
          </div>
        </div>
        <hr className="mb-4" />
        
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
        
        <form id="plotForm" className="needs-validation" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-6">
            <h6 className="font-bold text-gray-700 mb-4">BASIC INFORMATION</h6>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="developerName" className="block text-gray-700 mb-2">Developer Name *</label>
                <input 
                  type="text"
                  id="developerName"
                  name="developerName"
                  value={formData.developerName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Developer Name"
                />
                {errors.developerName && (
                  <div className="text-red-500 text-sm mt-1">{errors.developerName}</div>
                )}
              </div>
              
              <div>
                <label htmlFor="project" className="block text-gray-700 mb-2">Project *</label>
                <input 
                  type="text"
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Project Name"
                />
                {errors.project && (
                  <div className="text-red-500 text-sm mt-1">{errors.project}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 mb-2">Description *</label>
              <ReactQuill
                value={formData.description}
                onChange={handleDescriptionChange}
                className="bg-white"
                theme="snow"
                placeholder="Enter project description..."
              />
              {errors.description && (
                <div className="text-red-500 text-sm mt-1">{errors.description}</div>
              )}
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-gray-700 mb-2">Project Status *</label>
                <select 
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choose Status...</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && (
                  <div className="text-red-500 text-sm mt-1">{errors.status}</div>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-gray-700 mb-2">Location *</label>
                <input 
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Location"
                />
                {errors.location && (
                  <div className="text-red-500 text-sm mt-1">{errors.location}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Plot Size Range */}
          <div className="mb-6">
            <h6 className="font-bold text-gray-700 mb-4">PLOT SIZE RANGE</h6>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="plotSizeMin" className="block text-gray-700 mb-2">Min Size *</label>
                <input 
                  type="number"
                  id="plotSizeMin"
                  name="plotSizeMin"
                  value={formData.plotSizeMin}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label htmlFor="plotSizeMax" className="block text-gray-700 mb-2">Max Size *</label>
                <input 
                  type="number"
                  id="plotSizeMax"
                  name="plotSizeMax"
                  value={formData.plotSizeMax}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label htmlFor="plotSizeUnit" className="block text-gray-700 mb-2">Unit *</label>
                <select 
                  id="plotSizeUnit"
                  name="plotSizeUnit"
                  value={formData.plotSizeUnit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {errors.plotSize && (
              <div className="text-red-500 text-sm mt-1">{errors.plotSize}</div>
            )}
          </div>
          
          {/* Investment Details */}
          <div className="mb-6">
            <h6 className="font-bold text-gray-700 mb-4">INVESTMENT DETAILS</h6>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="investmentAmount" className="block text-gray-700 mb-2">Investment Starts From (₹) *</label>
                <input 
                  type="number"
                  id="investmentAmount"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="46000"
                />
                {errors.investmentAmount && (
                  <div className="text-red-500 text-sm mt-1">{errors.investmentAmount}</div>
                )}
              </div>
              
              <div>
                <label htmlFor="investmentUnit" className="block text-gray-700 mb-2">Per Unit *</label>
                <select 
                  id="investmentUnit"
                  name="investmentUnit"
                  value={formData.investmentUnit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Investor Discovery Kit */}
          <div className="mb-6">
            <h6 className="font-bold text-gray-700 mb-4">INVESTOR DISCOVERY KIT</h6>
            
            <div className="mb-4">
              <label htmlFor="investorDiscoveryKitUrl" className="block text-gray-700 mb-2">Google Drive URL *</label>
              <input 
                type="url"
                id="investorDiscoveryKitUrl"
                name="investorDiscoveryKitUrl"
                value={formData.investorDiscoveryKitUrl}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link should contain: Brochure PDF + Payment Plan PDF + Video
              </p>
              {errors.investorDiscoveryKitUrl && (
                <div className="text-red-500 text-sm mt-1">{errors.investorDiscoveryKitUrl}</div>
              )}
            </div>
          </div>
          
          {/* Project Images */}
          <div className="mb-6">
            <h6 className="font-bold text-gray-700 mb-4">PROJECT IMAGES (Max 5)</h6>
            
            {formData.images.map((image, index) => (
              <div key={index} className="mb-4">
                <label htmlFor={`image${index}`} className="block text-gray-700 mb-2">
                  Image {index + 1} URL {index === 0 ? '*' : ''}
                </label>
                <input 
                  type="url"
                  id={`image${index}`}
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="https://example.com/image.jpg"
                />
                {image && (
                  <div className="mt-2">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      className="w-32 h-24 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {errors.images && (
              <div className="text-red-500 text-sm mt-1">{errors.images}</div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="mt-6">
            <div className="flex justify-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center w-full"
              >
                <FaSave className="mr-2" />
                {isLoading ? 'Saving...' : 'Save Plot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}