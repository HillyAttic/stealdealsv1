'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaRulerCombined, FaBuilding, FaPhone, FaUser } from 'react-icons/fa';
import PropertyImage from '@/components/PropertyImage';
import { Property } from '@/lib/firebase';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property]);

  // Handle escape key press and header visibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // Hide header when modal is open
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      
      // Show header when modal closes
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'block';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '-';
    const numValue = typeof value === 'string' ? Number(value) : value;
    return `₹${numValue.toLocaleString('en-IN')}`;
  };

  // Get the main price to display
  const getDisplayPrice = () => {
    return property.rent || property.price || property.askingPrice || 0;
  };

  // Get price label
  const getPriceLabel = () => {
    if (property.rent) return '/month';
    return '';
  };

  // Navigation functions for image gallery (single image for now)
  const nextImage = () => {
    // For future multi-image support
    setCurrentImageIndex(0);
  };

  const prevImage = () => {
    // For future multi-image support
    setCurrentImageIndex(0);
  };

  // For now, we'll treat the single image as an array for consistency
  const validImages = property.image ? [property.image] : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 md:p-4" style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background: 'rgba(0, 0, 0, 0.3)'
    }}>
      <div className="bg-white/95 backdrop-blur-md md:rounded-lg max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{property.title || property.location || 'Property Details'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {validImages.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="h-96 relative overflow-hidden rounded-lg">
                  <PropertyImage
                    src={validImages[currentImageIndex]}
                    alt={`${property.title || property.location} - Property Image`}
                    className="rounded-lg"
                  />
                  
                  {/* Navigation arrows - hidden for single image */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image indicators - hidden for single image */}
                {validImages.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Property Details</h3>
              
              {/* Category & Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <p className="text-lg text-gray-800">{property.category || 'Not specified'}</p>
              </div>
              
              {/* Property Type */}
              {property.propertyType && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
                  <p className="text-lg text-gray-800">{property.propertyType}</p>
                </div>
              )}
              
              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <div className="flex items-center text-gray-800">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  <span>{property.location}</span>
                </div>
              </div>
              
              {/* Location Details */}
              <div className="bg-primary/5 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-primary mb-3">Location Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm font-medium text-primary">State:</span>
                    <p className="text-gray-700">{property.state || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-primary">City:</span>
                    <p className="text-gray-700">{property.city || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-primary">District:</span>
                    <p className="text-gray-700">{property.district || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-primary">Sub-District:</span>
                    <p className="text-gray-700">{property.subDistrict || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(property.contactName || property.contactNumber) && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-green-900 mb-3">Contact Information</h4>
                  {property.contactName && (
                    <div className="flex items-center mb-2">
                      <FaUser className="mr-2 text-green-700" />
                      <span className="text-gray-700">{property.contactName}</span>
                    </div>
                  )}
                  {property.contactNumber && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-green-700" />
                      <span className="text-gray-700">{property.contactNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Description */}
            {property.description && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>{property.description}</p>
                </div>
                
                {/* Unit Specifications */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Unit Specifications</h4>
                  <div className="space-y-2">
                    {property.floor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="text-gray-800">{property.floor}</span>
                      </div>
                    )}
                    {property.facing && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facing:</span>
                        <span className="text-gray-800">{property.facing}</span>
                      </div>
                    )}
                    {property.reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="text-gray-800">{property.reference}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Area Details */}
                {(property.superArea || property.carpetArea || property.length || property.width || property.height) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Area Details</h4>
                    <div className="space-y-2">
                      {property.superArea && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Super Area:</span>
                          <span className="text-gray-800">{property.superArea} sq.ft</span>
                        </div>
                      )}
                      {property.carpetArea && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carpet Area:</span>
                          <span className="text-gray-800">{property.carpetArea} sq.ft</span>
                        </div>
                      )}
                      {property.length && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="text-gray-800">{property.length} ft</span>
                        </div>
                      )}
                      {property.width && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Width:</span>
                          <span className="text-gray-800">{property.width} ft</span>
                        </div>
                      )}
                      {property.height && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Height:</span>
                          <span className="text-gray-800">{property.height} ft</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Financial Details - Bottom Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Financial Details</h3>
            
            {/* Price Information */}
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <span className="text-red-800 font-semibold text-lg">
                  {property.rent ? 'Monthly Rent:' : 'Price:'}
                </span>
                <span className="text-gray-800 font-bold text-xl">
                  {getDisplayPrice() ? `${formatCurrency(getDisplayPrice())}${getPriceLabel()}` : 'Price on request'}
                </span>
              </div>
            </div>

            {/* Additional Financial Details */}
            {(property.securityDeposit || property.advance || property.roi) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.securityDeposit && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <span className="text-yellow-800 font-medium text-sm">Security Deposit:</span>
                    <p className="text-gray-700">{property.securityDeposit}</p>
                  </div>
                )}
                {property.advance && (
                  <div className="bg-primary/5 p-3 rounded-md">
                    <span className="text-primary font-medium text-sm">Advance:</span>
                    <p className="text-gray-700">{property.advance}</p>
                  </div>
                )}
                {property.roi && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <span className="text-green-800 font-medium text-sm">ROI:</span>
                    <p className="text-gray-700">{property.roi}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}