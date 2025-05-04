"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave, FaTimes } from 'react-icons/fa';

// Property categories
const CATEGORIES = [
  'Bank',
  'Retail Space',
  'Office Space',
  'Industrial',
  'Warehouse',
  'F&B Brand',
  'Petrol Pump',
  'Entertainment Zone',
  'School',
  'NBFC',
  'Healthcare',
  'Multiplex',
  'Studios & Apartments'
];

// Locations
const LOCATIONS = [
  'East Delhi',
  'South Delhi',
  'North Delhi',
  'West Delhi',
  'Central Delhi',
  'Noida',
  'Gurgaon',
  'Ghaziabad',
  'Faridabad'
];

// Property Status options
const PROPERTY_STATUS = [
  'Ready to Move-In',
  'Future Delivery'
];

// Rental Types
const RENTAL_TYPES = [
  'Revenue Share',
  'MG or Revenue Share',
  'MG + Revenue Share',
  'Fixed',
  'Fixed + Revenue Share'
];

// Channel options
const CHANNELS = [
  'Direct from Developer',
  'Broker',
  'Investor/Owner'
];

// Property Types
const PROPERTY_TYPES = [
  'Lockable',
  'Virtual'
];

export default function NewProperty() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data state with all the fields for pre-leased inventory
  const [formData, setFormData] = useState({
    tenant: '',
    category: '',
    propertyStatus: '',
    buildingName: '',
    location: '',
    district: '',
    subDistrict: '',
    floor: '',
    totalArea: '',
    areaOnSale: '',
    leaseTerm: '',
    remainingLease: '',
    lockIn: '',
    escalation: '',
    rentalType: '',
    rent: '',
    askingPrice: '',
    securityDeposit: '',
    roi: '',
    advance: '',
    reference: '',
    channel: '',
    propertyType: '',
    files: [] as File[]
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
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(e.target.files || [])
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.tenant.trim()) {
      newErrors.tenant = 'Tenant name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.propertyStatus) {
      newErrors.propertyStatus = 'Property status is required';
    }
    
    if (!formData.buildingName.trim()) {
      newErrors.buildingName = 'Building name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.subDistrict.trim()) {
      newErrors.subDistrict = 'Sub-district is required';
    }
    
    // Add validation for numerical fields if needed
    if (formData.rent && isNaN(Number(formData.rent))) {
      newErrors.rent = 'Rent must be a number';
    }
    
    if (formData.askingPrice && isNaN(Number(formData.askingPrice))) {
      newErrors.askingPrice = 'Asking price must be a number';
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
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }
      
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Pre-Leased Inventory</h1>
        <p className="text-gray-600">Create a new pre-leased property listing</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="needs-validation">
          {/* Tenant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="tenant" className="block text-sm font-medium text-gray-700 mb-1">
                Tenant*
              </label>
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                id="tenant"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tenant ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tenant Name"
                required
              />
              {errors.tenant && (
                <p className="mt-1 text-sm text-red-600">{errors.tenant}</p>
              )}
            </div>
            </div>
            
          {/* Category & Property Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                  required
              >
                  <option value="" disabled>Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
              </div>
              <div>
                <label htmlFor="propertyStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Status*
                </label>
                <select
                  id="propertyStatus"
                  name="propertyStatus"
                  value={formData.propertyStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.propertyStatus ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="" disabled>Choose...</option>
                  {PROPERTY_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.propertyStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyStatus}</p>
                )}
              </div>
            </div>
            </div>
            
          {/* Building Name & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-1">
                Building Name*
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <input
                  type="text"
                  id="buildingName"
                  name="buildingName"
                  value={formData.buildingName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.buildingName ? 'border-red-500' : 'border-gray-300'
                }`}
                  required
              />
                {errors.buildingName && (
                  <p className="mt-1 text-sm text-red-600">{errors.buildingName}</p>
              )}
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location*
              </label>
                <input
                  type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                  required
                />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
              </div>
            </div>
          </div>
          
          {/* District & Sub-District */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District Name*
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>
              <div>
                <label htmlFor="subDistrict" className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-District*
                </label>
                <input
                  type="text"
                  id="subDistrict"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subDistrict ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.subDistrict && (
                  <p className="mt-1 text-sm text-red-600">{errors.subDistrict}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Floor & Total Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Floor"
                />
              </div>
              <div>
                <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Area
                </label>
                <input
                  type="text"
                  id="totalArea"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total Area"
                />
              </div>
            </div>
          </div>
          
          {/* Area on Sale & Lease Term */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="areaOnSale" className="block text-sm font-medium text-gray-700 mb-1">
                Area on Sale
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="areaOnSale"
                  name="areaOnSale"
                  value={formData.areaOnSale}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Area on Sale"
                />
              </div>
              <div>
                <label htmlFor="leaseTerm" className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Term
                </label>
                <input
                  type="text"
                  id="leaseTerm"
                  name="leaseTerm"
                  value={formData.leaseTerm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lease Term"
                />
              </div>
            </div>
          </div>
          
          {/* Remaining Lease & Lock-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="remainingLease" className="block text-sm font-medium text-gray-700 mb-1">
                Remaining Lease
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="remainingLease"
                  name="remainingLease"
                  value={formData.remainingLease}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Remaining Lease"
                />
              </div>
              <div>
                <label htmlFor="lockIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Lock-in
                </label>
                <input
                  type="text"
                  id="lockIn"
                  name="lockIn"
                  value={formData.lockIn}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lock-in"
                />
              </div>
            </div>
            </div>
            
          {/* Escalation & Rental Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="escalation" className="block text-sm font-medium text-gray-700 mb-1">
                Escalation
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="escalation"
                  name="escalation"
                  value={formData.escalation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escalation"
                />
              </div>
            <div>
                <label htmlFor="rentalType" className="block text-sm font-medium text-gray-700 mb-1">
                  Rental Type
                </label>
                <select
                  id="rentalType"
                  name="rentalType"
                  value={formData.rentalType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose...</option>
                  {RENTAL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Rent & Asking Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                Rent
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="askingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Asking Price
              </label>
              <input
                type="number"
                  id="askingPrice"
                  name="askingPrice"
                  value={formData.askingPrice}
                onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>
            </div>
            
          {/* Security Deposit & ROI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Security Deposit"
                />
              </div>
              <div>
                <label htmlFor="roi" className="block text-sm font-medium text-gray-700 mb-1">
                  ROI
                </label>
                <div className="flex">
              <input
                    type="text"
                    id="roi"
                    name="roi"
                    value={formData.roi}
                onChange={handleChange}
                    className="w-full px-4 py-2 border-l border-t border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ROI"
              />
                  <span className="inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advance & Reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="advance" className="block text-sm font-medium text-gray-700 mb-1">
                Advance
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="number"
                  id="advance"
                  name="advance"
                  value={formData.advance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reference"
                />
              </div>
            </div>
          </div>
          
          {/* Channel & Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
                Channel
              </label>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <select
                  id="channel"
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose...</option>
                  {CHANNELS.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
            </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose...</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
            </div>
            <div className="md:col-span-2">
              <div className="border border-gray-300 rounded-md p-4">
                <label htmlFor="files" className="inline-block bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-700">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    SELECT FILE
                  </span>
                </label>
                <input 
                  type="file" 
                  id="files" 
                  name="files" 
                  onChange={handleFileChange}
                  className="hidden" 
                  multiple
                  accept=".xlsx,.xls,image/*,.doc,audio/*,.docx,video/*,.ppt,.pptx,.txt,.pdf"
                />
                
                {formData.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {Array.from(formData.files).map((file, index) => (
                        <li key={index} className="py-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mr-4"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center disabled:opacity-70"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 