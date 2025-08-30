'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaBuilding, FaPhone, FaEnvelope, FaRulerCombined } from 'react-icons/fa';
import { Property } from '@/lib/firebase';
import { useActivity } from '@/hooks/useActivity';

interface EnhancedPropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedPropertyModal({ property, isOpen, onClose }: EnhancedPropertyModalProps) {
  const { logPropertyView } = useActivity();

  // Track property view when modal opens
  useEffect(() => {
    if (isOpen && property) {
      logPropertyView(property.id, {
        propertyTitle: property.title || property.location,
        source: 'modal',
        category: property.category,
        location: property.location
      });
    }
  }, [isOpen, property, logPropertyView]);

  // Handle escape key press and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return 'Price on Request';
    const numValue = typeof value === 'string' ? Number(value) : value;
    return `₹${numValue.toLocaleString('en-IN')}`;
  };

  // Get the main price to display
  const getDisplayPrice = () => {
    return property.rent || property.price || property.askingPrice || 0;
  };

  const getLocationString = () => {
    const parts = [];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    return parts.join(', ') || property.location;
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[1100] p-4"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div 
          className="px-6 py-4 rounded-t-2xl"
          style={{
            background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164), rgb(51, 161, 224))'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {property.title || property.location || 'Property Details'}
              </h2>
              <div className="flex items-center text-white/80 mt-1">
                <FaMapMarkerAlt className="mr-2" />
                <span>{getLocationString()}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Property Details</h3>

              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium mb-3" style={{ color: 'rgb(28, 110, 164)' }}>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Property Category</h5>
                    <p className="font-semibold text-gray-800">{property.category || 'Not specified'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Property Type</h5>
                    <p className="font-semibold text-gray-800">{property.propertyType || 'Vacant'}</p>
                  </div>
                  {property.floor && (
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Floor</h5>
                      <div className="flex items-center">
                        <FaBuilding className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                        <p className="font-semibold text-gray-800">{property.floor}</p>
                      </div>
                    </div>
                  )}
                  {property.facing && (
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Facing</h5>
                      <p className="font-semibold text-gray-800">{property.facing}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium mb-3 text-green-800">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.state && (
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">State</h5>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        <p className="font-semibold text-gray-800">{property.state}</p>
                      </div>
                    </div>
                  )}
                  {property.city && (
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">City</h5>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        <p className="font-semibold text-gray-800">{property.city}</p>
                      </div>
                    </div>
                  )}
                  {property.district && (
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">District</h5>
                      <p className="font-semibold text-gray-800">{property.district}</p>
                    </div>
                  )}
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Status</h5>
                    <p className="font-semibold text-gray-800">Available</p>
                  </div>
                </div>
              </div>

              {/* Area & Measurements */}
              {(property.superArea || property.carpetArea || property.area) && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium mb-3 text-yellow-800">Area & Measurements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.superArea && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Super Area</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.superArea}</p>
                        </div>
                      </div>
                    )}
                    {property.carpetArea && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Carpet Area</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.carpetArea}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Details */}
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h4 className="text-sm font-medium mb-3 text-red-800">Financial Details</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-3 rounded">
                    <h5 className="text-gray-500 text-xs uppercase mb-1">
                      {property.rent ? 'Monthly Rent' : 'Price'}
                    </h5>
                    <div className="flex items-center">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 320 512"
                        className="mr-2 text-sm"
                        height="1em"
                        width="1em"
                        style={{ color: 'rgb(28, 110, 164)' }}
                      >
                        <path d="M308 96c6.627 0 12-5.373 12-12V44c0-6.627-5.373-12-12-12H12C5.373 32 0 37.373 0 44v44.748c0 6.627 5.373 12 12 12h85.28c27.308 0 48.261 9.958 60.97 27.252H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h158.757c-6.217 36.086-32.961 58.632-74.757 58.632H12c-6.627 0-12 5.373-12 12v53.012c0 3.349 1.4 6.546 3.861 8.818l165.052 152.356a12.001 12.001 0 0 0 8.139 3.182h82.562c10.924 0 16.166-13.408 8.139-20.818L116.871 319.906c76.499-2.34 131.144-53.395 138.318-127.906H308c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-58.69c-3.486-11.541-8.28-22.246-14.252-32H308z"></path>
                      </svg>
                      <div>
                        <p className="text-lg font-medium text-gray-800">
                          {formatCurrency(getDisplayPrice())}
                        </p>
                        <p className="text-xs text-gray-600">
                          {property.rent ? 'per month' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Features & Amenities */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-purple-800">Property Features & Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">{property.category || 'Property'}</p>
                  </div>
                  {property.floor && (
                    <div className="bg-white p-2 rounded text-center">
                      <p className="text-xs text-gray-700">{property.floor} Floor</p>
                    </div>
                  )}
                  {property.facing && (
                    <div className="bg-white p-2 rounded text-center">
                      <p className="text-xs text-gray-700">{property.facing} Facing</p>
                    </div>
                  )}
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Spacious Area</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Summary */}
            <div>
              <div 
                className="rounded-lg p-4 text-white sticky top-6"
                style={{
                  background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164))'
                }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium mb-2">Interested in this property?</h3>
                  <p className="text-white/90 text-sm">
                    Contact us today to schedule a viewing or get detailed information about this property.
                  </p>
                </div>

                <div className="bg-white/10 p-3 rounded mb-4">
                  <h4 className="text-sm font-medium mb-3 text-white">Quick Summary</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Location:</span>
                      <span className="text-white font-medium">{property.city || property.location}</span>
                    </div>
                    {property.superArea && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Area:</span>
                        <span className="text-white font-medium">{property.superArea}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{property.rent ? 'Rent:' : 'Price:'}:</span>
                      <span className="text-white font-medium">
                        {formatCurrency(getDisplayPrice())}{property.rent ? '/mo' : ''}
                      </span>
                    </div>
                    {property.floor && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Floor:</span>
                        <span className="text-white font-medium">{property.floor}</span>
                      </div>
                    )}
                  </div>
                </div>


                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Available:</span>
                      <span>Ready for viewing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Response:</span>
                      <span>Within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}