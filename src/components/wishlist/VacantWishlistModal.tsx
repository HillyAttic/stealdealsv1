'use client';

import { useState } from 'react';
import { WishlistProperty } from '@/types/auth';
import { useActivity } from '@/hooks/useActivity';

interface VacantWishlistModalProps {
  property: WishlistProperty;
  isOpen: boolean;
  onClose: () => void;
}

export function VacantWishlistModal({ property, isOpen, onClose }: VacantWishlistModalProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const { logContactInquiry } = useActivity();

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
    <>
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
                <h2 className="text-2xl font-bold text-white">{property.title}</h2>
                <div className="flex items-center text-white/80 mt-1">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                  </svg>
                  <span>{property.location}</span>
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
                        <p className="font-semibold text-gray-800">Lower Ground</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Facing</h5>
                      <p className="font-semibold text-gray-800">Main Road</p>
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
                        <p className="font-semibold text-gray-800">DELHI</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">City</h5>
                      <div className="flex items-center">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2 text-green-600" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                        </svg>
                        <p className="font-semibold text-gray-800">{property.location || 'SOUTH DELHI'}</p>
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
                        <p className="font-semibold text-gray-800">3600 Sq.Ft</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Carpet Area</h5>
                      <div className="flex items-center">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                          <path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path>
                        </svg>
                        <p className="font-semibold text-gray-800">2700 Sq.Ft</p>
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
                        <p className="text-xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>
                          {property.price > 0 ? formatCurrency(property.price) : '₹3,50,000'} per month
                        </p>
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

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors py-2 px-4 rounded font-medium text-sm cursor-pointer"
                      style={{ color: 'rgb(28, 110, 164)' }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path>
                      </svg>
                      Request Information
                    </button>
                    <a
                      href="tel:+919630403080"
                      className="w-full flex items-center justify-center gap-2 border border-white text-white hover:bg-white/10 transition-colors py-2 px-4 rounded font-medium text-sm"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path>
                      </svg>
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Request Information</h3>
            <p className="mb-4 text-gray-600">Get detailed information about this vacant property</p>
            
            <form action="https://formsubmit.co/info@stealdeals.co.in" method="POST" className="space-y-4">
              <input type="hidden" name="_subject" value="Vacant Property Information Request" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.href : ''} />
              <input type="hidden" name="property_title" value={property.title} />
              <input type="hidden" name="property_id" value={property.id} />
              <input type="hidden" name="property_type" value="Vacant" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 96 3040 3080"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  name="message" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any specific requirements or questions?"
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Send Request
                </button>
              </div>
            </form>
            
            <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
              <p>Or contact us directly:</p>
              <p className="font-medium">Email: info@stealdeals.co.in</p>
              <p className="font-medium">Phone: +91 96 3040 3080</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}