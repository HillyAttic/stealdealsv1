'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/lib/firebase';
import { useActivity } from '@/hooks/useActivity';

interface VacantModalProps {
  vacant: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VacantModal({ vacant: property, isOpen, onClose }: VacantModalProps) {
  const [viewStartTime] = useState(Date.now());
  const { logPropertyView, logContactInquiry } = useActivity();

  // Log property view when modal opens
  useEffect(() => {
    if (isOpen && property) {
      logPropertyView(property.id, {
        propertyTitle: property.location || property.title,
        source: 'direct',
        timestamp: new Date().toISOString()
      });
    }
  }, [isOpen, property, logPropertyView]);

  // Handle escape key press and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);


  if (!isOpen || !property) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (!value || value === '' || value === null || value === undefined) {
      return '-';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);

    if (isNaN(numericValue) || numericValue === 0) {
      return '-';
    }

    return `₹${numericValue.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'rgba(0, 0, 0, 0.3)'
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
              <h2 className="text-2xl font-bold text-white">{property.location}</h2>
              <div className="flex items-center text-white/80 mt-1">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                </svg>
                <span>{property.city}, {property.state}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Property Details</h3>

              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium mb-3" style={{ color: 'rgb(28, 110, 164)' }}>Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Property Category</h5>
                    <p className="font-semibold text-gray-800">{property.category || 'Industrial'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Property Type</h5>
                    <p className="font-semibold text-gray-800">Vacant</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Floor</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                        <path d="M436 480h-20V24c0-13.255-10.745-24-24-24H56C42.745 0 32 10.745 32 24v456H12c-6.627 0-12 5.373-12 12v20h448v-20c0-6.627-5.373-12-12-12zM128 76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76zm0 96c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40zm52 148h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12zm76 160h-64v-84c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v84zm64-172c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">{property.floor || 'Lower Ground'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Facing</h5>
                    <p className="font-semibold text-gray-800">{property.facing || 'Main Road'}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium mb-3 text-green-800">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">State</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2 text-green-600" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">{property.state || 'DELHI'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">City</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2 text-green-600" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">{property.city || 'SOUTH DELHI'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">District</h5>
                    <p className="font-semibold text-gray-800">Not specified</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Status</h5>
                    <p className="font-semibold text-gray-800">Available</p>
                  </div>
                </div>
              </div>

              {/* Area & Measurements */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium mb-3 text-yellow-800">Area & Measurements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Super Area</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                        <path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">{property.superArea || '3600'} Sq.Ft</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="text-gray-500 text-sm uppercase mb-1">Carpet Area</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                        <path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">{property.carpetArea || '2700'} Sq.Ft</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h4 className="text-sm font-medium mb-3 text-red-800">Financial Details</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-3 rounded">
                    <h5 className="text-gray-500 text-xs uppercase mb-1">Monthly Rent</h5>
                    <div className="flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="mr-2 text-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                        <path d="M308 96c6.627 0 12-5.373 12-12V44c0-6.627-5.373-12-12-12H12C5.373 32 0 37.373 0 44v44.748c0 6.627 5.373 12 12 12h85.28c27.308 0 48.261 9.958 60.97 27.252H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h158.757c-6.217 36.086-32.961 58.632-74.757 58.632H12c-6.627 0-12 5.373-12 12v53.012c0 3.349 1.4 6.546 3.861 8.818l165.052 152.356a12.001 12.001 0 0 0 8.139 3.182h82.562c10.924 0 16.166-13.408 8.139-20.818L116.871 319.906c76.499-2.34 131.144-53.395 138.318-127.906H308c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-58.69c-3.486-11.541-8.28-22.246-14.252-32H308z"></path>
                      </svg>
                      <div>
                        <p className="text-lg font-medium text-gray-800">{property.rent ? formatCurrency(property.rent) : '₹3,50,000'}</p>
                        <p className="text-xs text-gray-600">per month</p>
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
                    <p className="text-xs text-gray-700">Industrial</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Lower Ground Floor</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Main Road Facing</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Spacious Area</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-gray-700">Vacant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Section */}
            <div>
              <div
                className="rounded-lg p-4 text-white sticky top-6"
                style={{ background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164))' }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium mb-2">Interested in this property?</h3>
                  <p className="text-white/90 text-sm">Contact us today to schedule a viewing or get detailed information about this vacant property.</p>
                </div>

                <div className="bg-white/10 p-3 rounded mb-4">
                  <h4 className="text-sm font-medium mb-3 text-white">Quick Summary</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Location:</span>
                      <span className="text-white font-medium">{property.city || 'SOUTH DELHI'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Area:</span>
                      <span className="text-white font-medium">{property.superArea || '3600'} Sq.Ft</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Rent:</span>
                      <span className="text-white font-medium">{property.rent ? formatCurrency(property.rent) + '/mo' : '₹3,50,000/mo'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Floor:</span>
                      <span className="text-white font-medium">{property.floor || 'Lower Ground'}</span>
                    </div>
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