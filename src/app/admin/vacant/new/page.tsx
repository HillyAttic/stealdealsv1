"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';
import { database, vacantPropertiesRef } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';
import ClientOnly from '@/components/ClientOnly';
import ImageUploader from '@/components/ui/ImageUploader';

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
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading property form...</p>
          </div>
        }
      >
        <NewVacantPropertyContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function NewVacantPropertyContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    propertyType: '', // Allow user to select property type
    reference: '',
    contactRef: '',
    rent: '',
    length: '',
    width: '',
    height: '',
    images: Array(10).fill(''),
    status: 'Available'
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check authentication using HTTP-only cookies
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the auth check API endpoint
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Important to include cookies
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
    
    // Handle state selection to update city options
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        city: ''
      }));
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
  
  // Handle image array changes
  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
    
    // Clear images validation error when user starts adding images
    if (errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };
  
  // Handle image URL generated from ImageUploader
  const handleImageUrlGenerated = (index: number, url: string) => {
    handleImageChange(index, url);
  };
  
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
      newErrors.propertyType = 'Unit Type is required';
    }
    
    if (!formData.reference) {
      newErrors.reference = 'Reference is required';
    }
    
    // Validate that at least one image exists
    const hasImages = formData.images.some(img => img.trim() !== '');
    if (!hasImages) {
      newErrors.images = 'At least one image is required';
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
      // Prepare property data with all fields
      const propertyData = {
        // Core required fields
        location: formData.location,
        category: formData.category,
        propertyType: 'Vacant', // This is the key field that determines the collection
        
        // Location fields
        state: formData.state,
        city: formData.city,
        district: formData.district,
        subDistrict: formData.subDistrict,
        
        // Unit details
        floor: formData.floor,
        facing: formData.facing,
        superArea: formData.superArea,
        carpetArea: formData.carpetArea,
        
        // Property specifics
        unitType: formData.propertyType, // Store the actual property type (Independent Unit, etc.) as unitType
        reference: formData.reference,
        contactName: formData.contactRef,
        contactRef: formData.contactRef, // Keep both for compatibility
        
        // Measurements
        length: formData.length,
        width: formData.width,
        height: formData.height,
        
        // Financial
        rent: formData.rent ? Number(formData.rent) : 0,
        
        // Media
        images: formData.images.filter(img => img.trim() !== ''),
        
        // Metadata
        status: formData.status || 'Available',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      console.log('Submitting property data:', propertyData);
      
      // Use the API endpoint with HTTP-only cookie authentication
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important to include cookies
        body: JSON.stringify(propertyData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create property');
      }
      
      setSuccess('Property added successfully!');
      
      // Reset form or navigate away after short delay
      setTimeout(() => {
        router.push('/admin/vacant');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(err.message || 'Failed to save property');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-4 rounded">
        <div className="card-title d-flex align-items-center flex justify-between mb-4">
          <div className="flex items-center">
            <h5 className="mb-0 text-xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>Vacant Inventory</h5>
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
            {success}
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
                {formData.state && CITIES[formData.state]?.map(city => (
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
            
            <label htmlFor="subDistrict" className="text-gray-700 ml-2">Status</label>
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
                <label htmlFor="propertyType" className="text-gray-700">Unit Type</label>
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
          
          {/* Images URL Input Section */}
          <div className="mt-6 mb-6">
            <div className="list-group list-group-item border border-gray-200 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-bold text-gray-700">PROPERTY IMAGES</h6>
              </div>
              <hr className="mb-4" />
              
              {formData.images.map((image, index) => (
                <div key={index} className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                  <label className="col-span-2 text-gray-700 pt-2">Image {index + 1}</label>
                  <div className="col-span-8">
                    <input 
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black h-10"
                      placeholder={`Enter image ${index + 1} URL`}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-span-2 flex items-start pt-0">
                    <ImageUploader 
                      onImageUrlGenerated={(url) => handleImageUrlGenerated(index, url)}
                      disabled={isLoading}
                      hideUrlDisplay={true}
                    />
                  </div>
                </div>
              ))}
              
              {errors.images && (
                <div className="text-red-500 text-sm mt-2">{errors.images}</div>
              )}
              
              {formData.images.some(img => img.trim() !== '') && (
                <div id="imagePreview" className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.filter(img => img.trim() !== '').map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Property Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded border" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                      }}
                    />
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
  );
} 