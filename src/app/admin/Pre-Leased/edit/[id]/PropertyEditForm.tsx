"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPropertyById, updateProperty, Property } from '@/lib/firebase';
import { FaSpinner, FaSave } from 'react-icons/fa';

interface PropertyEditFormProps {
  propertyId: string;
}

export default function PropertyEditForm({ propertyId }: PropertyEditFormProps) {
  const router = useRouter();
  const [property, setProperty] = useState<Property>({} as Property);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const propertyData = await getPropertyById(propertyId);
        if (propertyData) {
          // Ensure propertyType is set to "Pre-Leased"
          setProperty({
            ...propertyData,
            propertyType: "Pre-Leased"
          });
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    
    // Convert string values to numbers for numeric fields
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    // Update the property with the new value
    setProperty(prev => {
      const updatedProperty = { ...prev, [name]: parsedValue };
      
      // If tenant or buildingName changes, update the title field to match the format "tenant - buildingName"
      if (name === 'tenant' || name === 'buildingName') {
        const tenant = name === 'tenant' ? value : prev.tenant;
        const buildingName = name === 'buildingName' ? value : prev.buildingName;
        
        if (tenant && buildingName) {
          updatedProperty.title = `${tenant} - ${buildingName}`;
        } else if (tenant) {
          updatedProperty.title = `${tenant} Property`;
        } else if (buildingName) {
          updatedProperty.title = buildingName;
        } else {
          updatedProperty.title = `${updatedProperty.category || 'Property'}`;
        }
      }
      
      return updatedProperty;
    });
  };

  // Replace all input field classNames with this updated one that includes text-gray-800
  const inputClasses = "w-full p-2 border border-gray-300 rounded-md text-gray-800";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!property.id) {
        throw new Error('Property ID is missing');
      }
      
      // Ensure propertyType is always set to "Pre-Leased"
      const updatedProperty = {
        ...property,
        propertyType: "Pre-Leased"
      };
      
      await updateProperty(property.id, updatedProperty);
      setSuccess('Property updated successfully!');
      
      // Navigate back to properties list after short delay
      setTimeout(() => {
        router.push('/admin/Pre-Leased');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Pre-Leased Property</h1>
        <button
          onClick={() => router.push('/admin/Pre-Leased')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Properties
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Hidden input for propertyType */}
        <input 
          type="hidden" 
          name="propertyType" 
          value="Pre-Leased" 
          onChange={handleInputChange}
        />
        
        {/* Basic Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
              <input
                type="text"
                name="tenant"
                value={property.tenant || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
              <input
                type="text"
                name="buildingName"
                value={property.buildingName || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Auto-generated)</label>
              <input
                type="text"
                name="title"
                value={property.title || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={property.category || ''}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">Select Category</option>
                <option value="Bank">Bank</option>
                <option value="F&B Brand">F&B Brand</option>
                <option value="Retail Space">Retail Space</option>
                <option value="Multiplex">Multiplex</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
              <input
                type="text"
                name="propertyStatus"
                value={property.propertyStatus || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                name="propertyType"
                value={property.propertyType || 'Pre-Leased'}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="Pre-Leased">Pre-Leased</option>
                <option value="Vacant">Vacant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={property.location || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={property.district || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub District</label>
              <input
                type="text"
                name="subDistrict"
                value={property.subDistrict || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="text"
                name="floor"
                value={property.floor || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Area Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Area Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Area</label>
              <input
                type="text"
                name="totalArea"
                value={property.totalArea || ''}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Enter number only, Sq.Ft. will be added automatically"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area on Sale</label>
              <input
                type="text"
                name="areaOnSale"
                value={property.areaOnSale || ''}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Enter number only, Sq.Ft. will be added automatically"
              />
            </div>
          </div>
        </div>

        {/* Lease Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Lease Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Term</label>
              <input
                type="text"
                name="leaseTerm"
                value={property.leaseTerm || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Lease</label>
              <input
                type="text"
                name="remainingLease"
                value={property.remainingLease || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lock-in Period</label>
              <input
                type="text"
                name="lockIn"
                value={property.lockIn || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escalation</label>
              <input
                type="text"
                name="escalation"
                value={property.escalation || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rental Type</label>
              <input
                type="text"
                name="rentalType"
                value={property.rentalType || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹)</label>
              <input
                type="number"
                name="rent"
                value={property.rent || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price (₹)</label>
              <input
                type="number"
                name="askingPrice"
                value={property.askingPrice || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
              <input
                type="text"
                name="securityDeposit"
                value={property.securityDeposit || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ROI</label>
              <input
                type="text"
                name="roi"
                value={property.roi || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
              <input
                type="text"
                name="advance"
                value={property.advance || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                name="reference"
                value={property.reference || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <input
                type="text"
                name="channel"
                value={property.channel || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image"
                value={property.image || ''}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          {property.image && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Image Preview</p>
              <img 
                src={property.image} 
                alt="Property" 
                className="h-40 object-cover rounded-md shadow-sm" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 