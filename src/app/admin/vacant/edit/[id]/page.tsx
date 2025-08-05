"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import ClientOnly from '@/components/ClientOnly';
import { BsMenuUp, BsSave } from 'react-icons/bs';
import { database, vacantPropertiesRef } from '@/lib/firebase';
import { ref, get, child, update } from 'firebase/database';
import { toast, Toaster } from 'react-hot-toast';

export default function EditVacantProperty() {
  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <span className="ml-2">Loading property editor...</span>
          </div>
        }
      >
        <EditVacantPropertyContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function EditVacantPropertyContent() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState<any>({});
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check auth first, separate from data loading
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          // If auth check fails, store intended destination and redirect to login
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('returnTo', `/admin/vacant/edit/${propertyId}`);
          }
          router.push('/admin/login');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
        return false;
      }
    };
    
    checkAuth().then(isAuthenticated => {
      setAuthChecked(isAuthenticated);
    });
  }, [propertyId, router]);
  
  // Load property data only after authentication is confirmed
  useEffect(() => {
    if (!authChecked) return;
    
    if (!propertyId) {
      setError('Property ID is missing');
      setIsLoading(false);
      return;
    }
    
    const fetchProperty = async () => {
      try {
        // Try to get from vacant properties first
        let propertyRef = child(vacantPropertiesRef, propertyId);
        let snapshot = await get(propertyRef);
        
        // If not found, try legacy properties storage
        if (!snapshot.exists()) {
          propertyRef = ref(database, `properties/${propertyId}`);
          snapshot = await get(propertyRef);
        }
        
        if (snapshot.exists()) {
          const propertyData = snapshot.val();
          setProperty({
            id: propertyId,
            ...propertyData
          });
        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        console.error('Error loading property:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperty();
  }, [propertyId, authChecked]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProperty({
      ...property,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      // Ensure propertyType is preserved and imageUrl is converted to image
      const updatedProperty = {
        ...property,
        propertyType: property.propertyType || 'vacant',
        updatedAt: new Date().toISOString()
      };
      
      // Convert imageUrl to image if needed
      if (updatedProperty.imageUrl && !updatedProperty.image) {
        updatedProperty.image = updatedProperty.imageUrl;
        delete updatedProperty.imageUrl;
      }
      
      // Remove the id field as it's not stored in the Firebase object
      const { id, ...propertyToSave } = updatedProperty;
      
      // Update the property in Firebase
      const propertyRef = child(vacantPropertiesRef, propertyId);
      await update(propertyRef, propertyToSave);
      
      toast.success('Property updated successfully');
      router.push('/admin/vacant');
    } catch (err: any) {
      console.error('Error updating property:', err);
      setError(err.message || 'Failed to update property');
      toast.error('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back button click safely
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin/vacant');
  };

  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-4 rounded">
        <div className="card-title d-flex align-items-center flex justify-between mb-4">
          <div className="flex items-center">
            <h5 className="mb-0 text-xl font-bold text-blue-900">Edit Vacant Property</h5>
          </div>
          <div>
            <button 
              type="button" 
              onClick={handleBack}
              className="btn btn-outline-danger px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
            >
              <BsMenuUp className="inline mr-1" /> Back to List
            </button>
          </div>
        </div>
        <hr className="mb-4" />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : property.id ? (
          <form onSubmit={handleSubmit}>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-bold mb-4">Property ID: {property.id}</h2>
              
              {/* Location Information */}
              <div className="p-4 bg-blue-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-blue-900 border-b border-blue-200 pb-2">LOCATION DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={property.location || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={property.state || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={property.city || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      name="district"
                      value={property.district || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-District</label>
                    <input
                      type="text"
                      name="subDistrict"
                      value={property.subDistrict || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>
              
              {/* Unit Details */}
              <div className="p-4 bg-green-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-green-900 border-b border-green-200 pb-2">UNIT DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={property.category || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <input
                      type="text"
                      name="floor"
                      value={property.floor || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                    <input
                      type="text"
                      name="facing"
                      value={property.facing || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Super Area</label>
                    <input
                      type="text"
                      name="superArea"
                      value={property.superArea || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area</label>
                    <input
                      type="text"
                      name="carpetArea"
                      value={property.carpetArea || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <input
                      type="text"
                      name="propertyType"
                      value={property.propertyType || 'vacant'}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                      readOnly
                    />
                    <small className="text-gray-500">Cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                    <input
                      type="text"
                      name="length"
                      value={property.length || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="text"
                      name="width"
                      value={property.width || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="text"
                      name="height"
                      value={property.height || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reference and Financial */}
              <div className="p-4 bg-amber-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-amber-900 border-b border-amber-200 pb-2">REFERENCE & FINANCIAL</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ref</label>
                    <input
                      type="text"
                      name="reference"
                      value={property.reference || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name & Contact Ref</label>
                    <input
                      type="text"
                      name="contactName"
                      value={property.contactName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent</label>
                    <input
                      type="text"
                      name="rent"
                      value={property.rent || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="p-4 bg-purple-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-purple-900 border-b border-purple-200 pb-2">IMAGE</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={property.image || property.imageUrl || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  />
                </div>
                {(property.image || property.imageUrl) && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Image:</p>
                    <img 
                      src={property.image || property.imageUrl} 
                      alt="Property" 
                      className="max-h-32 border border-gray-300 rounded mt-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        (e.target as HTMLImageElement).alt = 'Image not available';
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2">Saving...</span>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <BsSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
            Property not found.
          </div>
        )}
      </div>
    </div>
  );
} 