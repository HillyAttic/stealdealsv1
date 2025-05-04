"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';

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

// Default images by category
const getDefaultImageForCategory = (category: string) => {
  const categoryImages: {[key: string]: string} = {
    'Bank': 'https://images.pexels.com/photos/259098/pexels-photo-259098.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Retail Space': 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Office Space': 'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Industrial': 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Warehouse': 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'F&B Brand': 'https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Petrol Pump': 'https://images.pexels.com/photos/5089152/pexels-photo-5089152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Healthcare': 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Entertainment Zone': 'https://images.pexels.com/photos/1486064/pexels-photo-1486064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'School': 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'NBFC': 'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Multiplex': 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Studios & Apartments': 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  };

  return categoryImages[category] || 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
};

export default function NewPreLeasedProperty() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
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
    propertyType: ''
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
      // Remove token usage as we're not using auth on the API anymore
      
      // Prepare data for API with explicit property type
      const propertyData = {
        ...formData,
        propertyType: 'Pre-Leased',  // Explicitly set property type for inventory filtering
        featured: false,  // Default to not featured
        // Convert numeric fields to numbers for proper storage and filtering
        rent: formData.rent ? parseFloat(formData.rent.toString()) : undefined,
        askingPrice: formData.askingPrice ? parseFloat(formData.askingPrice.toString()) : undefined,
        advance: formData.advance ? parseFloat(formData.advance.toString()) : undefined,
        // Add image URL always for a default image
        image: getDefaultImageForCategory(formData.category)
      };
      
      console.log('Submitting property data:', propertyData);
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create property');
      }
      
      // Show success message
      alert('Pre-Leased property has been saved successfully and will appear in the inventory.');
      
      // Redirect to the Pre-Leased properties list
      router.push('/admin/Pre-Leased');
    } catch (err: any) {
      console.error('Error saving Pre-Leased property:', err);
      setError(err.message || 'Something went wrong while saving the property');
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
              <h5 className="mb-0 text-xl font-bold text-blue-900">Pre-Leased Inventory</h5>
            </div>
            <div>
              <button 
                type="button" 
                onClick={() => router.push('/admin/Pre-Leased')}
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
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="tenant" className="col-span-2 text-gray-700">Tenant</label>
              <div className="col-span-8 position-relative">
                <input 
                  type="text"
                  id="tenant"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Tenant Name"
                  autoComplete="off"
                />
                {errors.tenant && (
                  <div className="text-red-500 text-sm mt-1">{errors.tenant}</div>
                )}
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="category" className="col-span-2 text-gray-700">Category</label>
              <div className="col-span-4 position-relative">
                <select 
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                )}
              </div>
              
              <label htmlFor="propertyStatus" className="col-span-2 text-gray-700 ml-2">Property Status</label>
              <div className="col-span-4 position-relative">
                <select 
                  id="propertyStatus"
                  name="propertyStatus"
                  value={formData.propertyStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {PROPERTY_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.propertyStatus && (
                  <div className="text-red-500 text-sm mt-1">{errors.propertyStatus}</div>
                )}
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="buildingName" className="col-span-2 text-gray-700">Building Name</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="buildingName"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
                {errors.buildingName && (
                  <div className="text-red-500 text-sm mt-1">{errors.buildingName}</div>
                )}
              </div>
              
              <label htmlFor="location" className="col-span-2 text-gray-700 ml-2">Location</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
                {errors.location && (
                  <div className="text-red-500 text-sm mt-1">{errors.location}</div>
                )}
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="district" className="col-span-2 text-gray-700">District Name</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
                {errors.district && (
                  <div className="text-red-500 text-sm mt-1">{errors.district}</div>
                )}
              </div>
              
              <label htmlFor="subDistrict" className="col-span-2 text-gray-700 ml-2">Sub-District</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="subDistrict"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
                {errors.subDistrict && (
                  <div className="text-red-500 text-sm mt-1">{errors.subDistrict}</div>
                )}
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="floor" className="col-span-2 text-gray-700">Floor</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Floor"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="totalArea" className="col-span-2 text-gray-700 ml-2">Total Area</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="totalArea"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Total Area"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="areaOnSale" className="col-span-2 text-gray-700">Area on Sale</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="areaOnSale"
                  name="areaOnSale"
                  value={formData.areaOnSale}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Area on Sale"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="leaseTerm" className="col-span-2 text-gray-700 ml-2">Lease Term</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="leaseTerm"
                  name="leaseTerm"
                  value={formData.leaseTerm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Lease Term"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="remainingLease" className="col-span-2 text-gray-700">Remaining Lease</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="remainingLease"
                  name="remainingLease"
                  value={formData.remainingLease}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Remaining Lease"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="lockIn" className="col-span-2 text-gray-700 ml-2">Lock-in</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="lockIn"
                  name="lockIn"
                  value={formData.lockIn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Lock-in"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="escalation" className="col-span-2 text-gray-700">Escalation</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="escalation"
                  name="escalation"
                  value={formData.escalation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Escalation"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="rentalType" className="col-span-2 text-gray-700 ml-2">Rental Type</label>
              <div className="col-span-4 position-relative">
                <select 
                  id="rentalType"
                  name="rentalType"
                  value={formData.rentalType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choose...</option>
                  {RENTAL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="rent" className="col-span-2 text-gray-700">Rent</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="askingPrice" className="col-span-2 text-gray-700 ml-2">Asking Price</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="number"
                  id="askingPrice"
                  name="askingPrice"
                  value={formData.askingPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="securityDeposit" className="col-span-2 text-gray-700">Security Deposit</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Security Deposit"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="roi" className="col-span-2 text-gray-700 ml-2">ROI</label>
              <div className="col-span-4 position-relative">
                <div className="input-group flex">
                  <input 
                    type="text"
                    id="roi"
                    name="roi"
                    value={formData.roi}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="ROI"
                    autoComplete="off"
                  />
                  <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-r text-gray-800">%</span>
                </div>
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="advance" className="col-span-2 text-gray-700">Advance</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="number"
                  id="advance"
                  name="advance"
                  value={formData.advance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoComplete="off"
                />
              </div>
              
              <label htmlFor="reference" className="col-span-2 text-gray-700 ml-2">Reference</label>
              <div className="col-span-4 position-relative">
                <input 
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Reference"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <label htmlFor="channel" className="col-span-2 text-gray-700">Channel</label>
              <div className="col-span-4 position-relative">
                <select 
                  id="channel"
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choose...</option>
                  {CHANNELS.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>
              
              <label htmlFor="propertyType" className="col-span-2 text-gray-700 ml-2">Property Type</label>
              <div className="col-span-4 position-relative">
                <select 
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Choose...</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
              <div className="my-4">
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn btn-primary px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center w-full"
                  >
                    <FaSave className="mr-2" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 