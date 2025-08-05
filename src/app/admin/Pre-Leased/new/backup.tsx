"use client";

import { useState, useEffect } from 'react';
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
    image: ''
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
        // Use provided image URL or fallback to default
        image: formData.image || getDefaultImageForCategory(formData.category)
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
            {/* Form fields */}
            {/* ... existing form fields ... */}
            
            {/* Image URL Input */}
            <div className="mt-6 mb-6">
              <div className="list-group list-group-item border border-gray-200 rounded p-4">
                <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <label htmlFor="image" className="col-span-2 text-gray-700">Image URL</label>
                  <div className="col-span-10 position-relative">
                    <input 
                      type="text"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Enter image URL"
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a direct URL to an image (e.g., https://example.com/image.jpg)</p>
                  </div>
                </div>
                
                {formData.image && (
                  <div id="imagePreview" className="mt-4">
                    <img 
                      src={formData.image} 
                      alt="Property Preview" 
                      className="w-64 h-48 object-cover rounded" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultImageForCategory(formData.category);
                      }}
                    />
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