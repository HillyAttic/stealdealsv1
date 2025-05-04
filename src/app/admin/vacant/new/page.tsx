"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';

// Categories for the form
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

// State options
const STATES = [
  'Delhi',
  'Uttar Pradesh',
  'Haryana',
  'Maharashtra'
];

// Cities based on state
const CITIES: { [key: string]: string[] } = {
  'Delhi': ['New Delhi', 'East Delhi', 'West Delhi', 'North Delhi', 'South Delhi'],
  'Uttar Pradesh': ['Noida', 'Ghaziabad', 'Lucknow', 'Kanpur'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Sonipat'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur']
};

// District options
const DISTRICTS = [
  'Central',
  'East',
  'North',
  'South',
  'West'
];

// Sub-district options
const SUB_DISTRICTS = [
  'Ready to Move-In',
  'Future Delivery'
];

// High-street categories
const HIGH_STREET_CATEGORIES = [
  'High-Street',
  'Mall',
  'IT-ITES',
  'Corporate',
  'Industrial'
];

// Floor options
const FLOORS = [
  'Ground',
  'Upper Ground',
  'Lower Ground',
  'Basement',
  'First',
  'Second',
  'Third'
];

// Facing options
const FACING_OPTIONS = [
  'Main Road',
  'Atrium',
  'General',
  'Frontage'
];

// Property types
const PROPERTY_TYPES = [
  'Independent Unit',
  'Standalone Building',
  'High-Street'
];

// Reference options
const REFERENCE_OPTIONS = [
  'Direct',
  'Channel Partner'
];

export default function NewVacantProperty() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    location: '',
    state: '',
    city: '',
    district: '',
    subDistrict: '',
    category: '',
    floor: '',
    facing: '',
    superArea: '',
    carpetArea: '',
    propertyType: '',
    reference: '',
    contactRef: '',
    rent: '',
    length: '',
    width: '',
    height: ''
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
    
    // Handle state selection to update city options
    if (name === 'state') {
      setSelectedState(value);
    }
    
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
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.floor) {
      newErrors.floor = 'Floor is required';
    }
    
    if (!formData.facing) {
      newErrors.facing = 'Facing is required';
    }
    
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property Type is required';
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
      // In a real app, you would upload files and make API call to save the property
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          propertyType: 'Vacant'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }
      
      router.push('/admin/vacant');
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
              <h5 className="mb-0 text-xl font-bold text-blue-900">Vacant Inventory</h5>
            </div>
            <div>
              <button 
                type="button" 
                onClick={() => router.push('/admin/vacant')}
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
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <label htmlFor="location" className="col-span-1 text-gray-700">Location</label>
              <div className="col-span-2 position-relative">
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
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="state" className="text-gray-700">State</label>
              <div className="position-relative">
                <select 
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <div className="text-red-500 text-sm mt-1">{errors.state}</div>
                )}
              </div>
              
              <label htmlFor="city" className="text-gray-700 ml-2">City</label>
              <div className="position-relative">
                <select 
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {selectedState && CITIES[selectedState]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <div className="text-red-500 text-sm mt-1">{errors.city}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label htmlFor="district" className="text-gray-700">District</label>
              <div className="position-relative">
                <select 
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <label htmlFor="subDistrict" className="text-gray-700 ml-2">Sub-District</label>
              <div className="position-relative">
                <select 
                  id="subDistrict"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="" disabled>Choose...</option>
                  {SUB_DISTRICTS.map(subDistrict => (
                    <option key={subDistrict} value={subDistrict}>{subDistrict}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Unit Details Section */}
            <div className="mt-6 mb-4">
              <div className="list-group list-group-item border border-gray-200 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-bold text-gray-700">UNIT DETAILS</h6>
                </div>
                <hr className="mb-4" />
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <label htmlFor="category" className="text-gray-700">Category</label>
                  <div className="position-relative">
                    <select 
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="" disabled>Choose...</option>
                      {HIGH_STREET_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                    )}
                  </div>
                  
                  <label htmlFor="floor" className="text-gray-700 ml-2">Floor</label>
                  <div className="position-relative">
                    <select 
                      id="floor"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="" disabled>Choose...</option>
                      {FLOORS.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                    {errors.floor && (
                      <div className="text-red-500 text-sm mt-1">{errors.floor}</div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <label htmlFor="facing" className="text-gray-700">Facing</label>
                  <div className="position-relative">
                    <select 
                      id="facing"
                      name="facing"
                      value={formData.facing}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="" disabled>Choose...</option>
                      {FACING_OPTIONS.map(facing => (
                        <option key={facing} value={facing}>{facing}</option>
                      ))}
                    </select>
                    {errors.facing && (
                      <div className="text-red-500 text-sm mt-1">{errors.facing}</div>
                    )}
                  </div>
                  
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="input-group flex">
                      <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Super Area</span>
                      <input 
                        type="text"
                        id="superArea"
                        name="superArea"
                        value={formData.superArea}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Super Area"
                      />
                    </div>
                    
                    <div className="input-group flex">
                      <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Carpet Area</span>
                      <input 
                        type="text"
                        id="carpetArea"
                        name="carpetArea"
                        value={formData.carpetArea}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Carpet Area"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <label htmlFor="propertyType" className="text-gray-700">Property Type</label>
                  <div className="position-relative">
                    <select 
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="" disabled>Choose...</option>
                      {PROPERTY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.propertyType && (
                      <div className="text-red-500 text-sm mt-1">{errors.propertyType}</div>
                    )}
                  </div>
                  
                  <label htmlFor="reference" className="text-gray-700 ml-2">Ref</label>
                  <div className="position-relative">
                    <select 
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="" disabled>Choose...</option>
                      {REFERENCE_OPTIONS.map(ref => (
                        <option key={ref} value={ref}>{ref}</option>
                      ))}
                    </select>
                    {errors.reference && (
                      <div className="text-red-500 text-sm mt-1">{errors.reference}</div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <label htmlFor="contactRef" className="text-gray-700">Name & Contact Ref</label>
                  <div className="position-relative">
                    <input 
                      type="text"
                      id="contactRef"
                      name="contactRef"
                      value={formData.contactRef}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Name & Contact Ref"
                    />
                  </div>
                  
                  <label htmlFor="rent" className="text-gray-700 ml-2">Rent</label>
                  <div className="position-relative">
                    <input 
                      type="number"
                      id="rent"
                      name="rent"
                      value={formData.rent}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="input-group flex">
                    <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Length</span>
                    <input 
                      type="text"
                      id="length"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Length"
                    />
                  </div>
                  
                  <div className="input-group flex">
                    <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Width</span>
                    <input 
                      type="text"
                      id="width"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Width"
                    />
                  </div>
                  
                  <div className="input-group flex">
                    <span className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-l text-gray-800">Height</span>
                    <input 
                      type="text"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Height"
                    />
                  </div>
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
                    <FaPlus className="inline mr-1" /> SELECT FILE
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
                  {isLoading ? 'Saving...' : 'Save Property'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 