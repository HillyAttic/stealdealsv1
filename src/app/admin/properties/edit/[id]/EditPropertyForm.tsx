"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

interface EditPropertyFormProps {
  id: string;
}

export default function EditPropertyForm({ id }: EditPropertyFormProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<any>({
    title: '',
    type: '',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    features: [],
    images: [],
    status: 'Available',
    featured: false
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    'Residential',
    'Commercial',
    'Land',
    'Industrial',
    'Hospitality',
    'Retail',
    'Mixed Use',
    'Restaurant',
    'Franchise',
    'Business'
  ];
  
  // Fetch property data when the component mounts
  useEffect(() => {
    fetchProperty();
  }, [id]);
  
  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }
      const data = await response.json();
      setProperty(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProperty({
        ...property,
        [name]: checked
      });
    } else {
      setProperty({
        ...property,
        [name]: value
      });
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleAddFeature = () => {
    if (newFeature.trim() !== '') {
      setProperty({
        ...property,
        features: [...property.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };
  
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...property.features];
    updatedFeatures.splice(index, 1);
    setProperty({
      ...property,
      features: updatedFeatures
    });
  };
  
  const handleAddImage = () => {
    if (newImage.trim() !== '') {
      setProperty({
        ...property,
        images: [...property.images, newImage.trim()]
      });
      setNewImage('');
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...property.images];
    updatedImages.splice(index, 1);
    setProperty({
      ...property,
      images: updatedImages
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!property.title.trim()) newErrors.title = 'Title is required';
    if (!property.type) newErrors.type = 'Property type is required';
    if (!property.price) newErrors.price = 'Price is required';
    if (!property.location.trim()) newErrors.location = 'Location is required';
    if (!property.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update property');
      }
      
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error:', error);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={property.title}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="type"
              value={property.type}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a property type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={property.price}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={property.location}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
            <input
              type="number"
              name="area"
              value={property.area}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={property.bedrooms}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={property.bathrooms}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={property.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="featured"
              checked={property.featured}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Featured Property</label>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={property.description}
            onChange={handleInputChange}
            rows={5}
            className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md"
              placeholder="Add a feature"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {property.features.map((feature: string, index: number) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md"
              placeholder="Image URL"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {property.images.map((image: string, index: number) => (
              <div key={index} className="relative group">
                <img src={image} alt={`Property ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 