"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';

// Industries options
const INDUSTRIES = [
  'Food & Beverage',
  'Health & Beauty',
  'Retail',
  'Education',
  'Hospitality',
  'Entertainment',
  'Apparel',
  'Technology',
  'Home Services'
];

// Segments options
const SEGMENTS = [
  'Quick Service Restaurant',
  'Fine Dining',
  'Coffee Shop',
  'Bakery',
  'Pizza',
  'Ice Cream',
  'Salon',
  'Spa',
  'Convenience Store',
  'Fashion',
  'Electronics',
  'Fitness',
  'Education'
];

export default function NewFranchise() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    industry: '',
    segment: '',
    brand: '',
    model: '',
    minArea: '',
    maxArea: '',
    minInvestment: '',
    maxInvestment: '',
    royalty: '',
    establishmentYear: '',
    franchiseStartedYear: '',
    numberOfOutlets: '',
    minPaybackPeriod: '',
    maxPaybackPeriod: '',
    headquarter: '',
    remarks: '',
    brandDeck: '',
    productList: '',
    roiSheet: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
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
  
  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    
    if (!formData.segment) {
      newErrors.segment = 'Segment is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
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
      // In a real app, you would upload files and make API call to save the franchise
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/franchises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create franchise');
      }
      
      router.push('/admin/franchise');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
        <div className="border p-4 rounded">
          <div className="card-title d-flex align-items-center flex justify-between mb-4">
            <div className="flex items-center">
              <h5 className="mb-0 text-xl font-bold text-blue-900">Franchise Inventory</h5>
            </div>
            <div>
              <button 
                type="button" 
                onClick={() => router.push('/admin/franchise')}
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
          
          <form id="myForm" className="needs-validation" onSubmit={handleSubmit}>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="industry" className="text-gray-700">Industry</label>
              <div className="position-relative">
                <select 
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <div className="text-red-500 text-sm mt-1">{errors.industry}</div>
                )}
              </div>
              
              <label htmlFor="segment" className="text-gray-700 ml-2">Segment</label>
              <div className="position-relative">
                <select 
                  id="segment"
                  name="segment"
                  value={formData.segment}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {SEGMENTS.map(segment => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
                {errors.segment && (
                  <div className="text-red-500 text-sm mt-1">{errors.segment}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="brand" className="text-gray-700">Brand</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Brand"
                />
                {errors.brand && (
                  <div className="text-red-500 text-sm mt-1">{errors.brand}</div>
                )}
              </div>
              
              <label htmlFor="model" className="text-gray-700 ml-2">Model</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Model"
                />
                {errors.model && (
                  <div className="text-red-500 text-sm mt-1">{errors.model}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="minArea" className="text-gray-700">Minimum Area</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="minArea"
                  name="minArea"
                  value={formData.minArea}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Minimum Area Req. (sq.ft.)"
                />
                {errors.minArea && (
                  <div className="text-red-500 text-sm mt-1">{errors.minArea}</div>
                )}
              </div>
              
              <label htmlFor="maxArea" className="text-gray-700 ml-2">Maximum Area</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="maxArea"
                  name="maxArea"
                  value={formData.maxArea}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Max Area Req. (sq.ft.)"
                />
                {errors.maxArea && (
                  <div className="text-red-500 text-sm mt-1">{errors.maxArea}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="minInvestment" className="text-gray-700">Investment (Min)</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="minInvestment"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Investment (Minimum)"
                />
                {errors.minInvestment && (
                  <div className="text-red-500 text-sm mt-1">{errors.minInvestment}</div>
                )}
              </div>
              
              <label htmlFor="maxInvestment" className="text-gray-700 ml-2">Investment (Max)</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="maxInvestment"
                  name="maxInvestment"
                  value={formData.maxInvestment}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Investment (Maximum)"
                />
                {errors.maxInvestment && (
                  <div className="text-red-500 text-sm mt-1">{errors.maxInvestment}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="royalty" className="text-gray-700">Royalty</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="royalty"
                  name="royalty"
                  value={formData.royalty}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Royalty"
                />
                {errors.royalty && (
                  <div className="text-red-500 text-sm mt-1">{errors.royalty}</div>
                )}
              </div>
              
              <label htmlFor="establishmentYear" className="text-gray-700 ml-2">Establishment Year</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="establishmentYear"
                  name="establishmentYear"
                  value={formData.establishmentYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Establishment Year"
                />
                {errors.establishmentYear && (
                  <div className="text-red-500 text-sm mt-1">{errors.establishmentYear}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="franchiseStartedYear" className="text-gray-700">Franchise Started Year</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="franchiseStartedYear"
                  name="franchiseStartedYear"
                  value={formData.franchiseStartedYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Franchise Started Year"
                />
                {errors.franchiseStartedYear && (
                  <div className="text-red-500 text-sm mt-1">{errors.franchiseStartedYear}</div>
                )}
              </div>
              
              <label htmlFor="numberOfOutlets" className="text-gray-700 ml-2">Number of Outlets</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="numberOfOutlets"
                  name="numberOfOutlets"
                  value={formData.numberOfOutlets}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Number of Outlets"
                />
                {errors.numberOfOutlets && (
                  <div className="text-red-500 text-sm mt-1">{errors.numberOfOutlets}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="minPaybackPeriod" className="text-gray-700">Min Payback Period</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="minPaybackPeriod"
                  name="minPaybackPeriod"
                  value={formData.minPaybackPeriod}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Minimum Payback Period"
                />
                {errors.minPaybackPeriod && (
                  <div className="text-red-500 text-sm mt-1">{errors.minPaybackPeriod}</div>
                )}
              </div>
              
              <label htmlFor="maxPaybackPeriod" className="text-gray-700 ml-2">Max Payback Period</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="maxPaybackPeriod"
                  name="maxPaybackPeriod"
                  value={formData.maxPaybackPeriod}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Maximum Payback Period"
                />
                {errors.maxPaybackPeriod && (
                  <div className="text-red-500 text-sm mt-1">{errors.maxPaybackPeriod}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="headquarter" className="text-gray-700">Headquarter</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="headquarter"
                  name="headquarter"
                  value={formData.headquarter}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Headquarter"
                />
                {errors.headquarter && (
                  <div className="text-red-500 text-sm mt-1">{errors.headquarter}</div>
                )}
              </div>
              
              <label htmlFor="remarks" className="text-gray-700 ml-2">Remarks</label>
              <div className="position-relative">
                <input 
                  type="text"
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Remarks"
                />
                {errors.remarks && (
                  <div className="text-red-500 text-sm mt-1">{errors.remarks}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="position-relative">
                <div className="input-group flex">
                  <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Brand Deck</span>
                  <input 
                    type="text"
                    id="brandDeck"
                    name="brandDeck"
                    value={formData.brandDeck}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Brand Deck"
                  />
                </div>
              </div>
              
              <div className="position-relative">
                <div className="input-group flex">
                  <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Product List/Menu</span>
                  <input 
                    type="text"
                    id="productList"
                    name="productList"
                    value={formData.productList}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Product List/Menu"
                  />
                </div>
              </div>
              
              <div className="position-relative">
                <div className="input-group flex">
                  <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">ROI Sheet</span>
                  <input 
                    type="text"
                    id="roiSheet"
                    name="roiSheet"
                    value={formData.roiSheet}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="ROI Sheet"
                  />
                </div>
              </div>
            </div>
            
            {/* File Upload Section */}
            <div className="mt-6 mb-6">
              <div className="list-group list-group-item border border-gray-200 rounded p-4">
                <div className="mt-2 mb-4">
                  <label 
                    htmlFor="attachment" 
                    className="btn px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  >
                    SELECT FILE
                  </label>
                  <input 
                    type="file" 
                    id="attachment" 
                    name="attachment" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".xlsx,.xls,image/*,.doc,audio/*,.docx,video/*,.ppt,.pptx,.txt,.pdf" 
                    className="hidden"
                  />
                </div>
                
                {previewImages.length > 0 && (
                  <div id="dvPreview" className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative">
                        <img src={src} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  {isLoading ? 'Saving...' : 'Save Franchise'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 