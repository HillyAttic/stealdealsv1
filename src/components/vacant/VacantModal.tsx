'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaBuilding, FaRulerCombined, FaRupeeSign, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import PropertyImage from '@/components/PropertyImage';
import { Property } from '@/lib/firebase';
import { useActivity } from '@/hooks/useActivity';

// Define VacantContactModal props locally to avoid circular imports
interface VacantContactModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

// VacantContactModal component defined inline
function VacantContactModal({ property, isOpen, onClose, logContactInquiry }: VacantContactModalProps & { logContactInquiry: (propertyId: string, metadata?: any) => Promise<void> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !property) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '-';
    const numValue = typeof value === 'string' ? Number(value) : value;
    return `₹${numValue.toLocaleString('en-IN')}`;
  };

  // Get rent display
  const getRentDisplay = () => {
    if (property.rent) {
      return `${formatCurrency(property.rent)}/month`;
    }
    return 'Contact for pricing';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit the form normally
      const formData = new FormData(e.currentTarget);
      
      // Create a temporary form for submission
      const tempForm = document.createElement('form');
      tempForm.action = 'https://formsubmit.co/stealdeals.co.in@gmail.com';
      tempForm.method = 'POST';
      tempForm.style.display = 'none';
      
      // Copy all form data
      for (const [key, value] of formData.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        tempForm.appendChild(input);
      }
      
      // Log contact inquiry activity
      await logContactInquiry(property.id, {
        propertyTitle: property.location || property.title,
        inquiryType: 'form',
        source: 'vacant_modal',
        timestamp: new Date().toISOString()
      });
      
      // Add the form to the document and submit
      document.body.appendChild(tempForm);
      tempForm.submit();
      
      // Clean up
      document.body.removeChild(tempForm);
      
      // Close modal after submission
      onClose();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[1100] p-4" 
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div 
          className="px-4 md:px-6 py-3 md:py-4 rounded-t-2xl"
          style={{
            background: 'linear-gradient(to right, #154D71, #1C6EA4, #33A1E0)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaEnvelope className="text-white mr-3 text-xl" />
              <h3 className="text-lg md:text-xl font-bold text-white">Request Information</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <FaTimes className="text-lg md:text-xl" />
            </button>
          </div>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            Get detailed information about {property.location}
          </p>
        </div>

        {/* Form */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Hidden fields */}
            <input type="hidden" name="_subject" value={`Vacant Property Inquiry - ${property.location} (Contact Modal)`} />
            <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/vacant?success=true`} />
            <input type="hidden" name="_captcha" value="false" />
            
            <input type="hidden" name="property_location" value={property.location} />
            <input type="hidden" name="property_category" value={property.category} />
            <input type="hidden" name="property_rent" value={getRentDisplay()} />
            <input type="hidden" name="property_city" value={`${property.city}, ${property.state}`} />
            <input type="hidden" name="property_type" value="Vacant" />
            <input type="hidden" name="form_type" value="Vacant Property Contact Modal" />

            {/* Property Location (readonly) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Location
              </label>
              <input
                type="text"
                value={property.location}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(21, 77, 113, 0.05)'
                }}
              />
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    '--tw-ring-color': '#154D71'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Phone and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Range
                </label>
                <select 
                  name="budget_range"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">Select your budget range</option>
                  <option value="₹10,000 - ₹25,000/month">₹10,000 - ₹25,000/month</option>
                  <option value="₹25,000 - ₹50,000/month">₹25,000 - ₹50,000/month</option>
                  <option value="₹50,000 - ₹1,00,000/month">₹50,000 - ₹1,00,000/month</option>
                  <option value="₹1,00,000 - ₹2,00,000/month">₹1,00,000 - ₹2,00,000/month</option>
                  <option value="Above ₹2,00,000/month">Above ₹2,00,000/month</option>
                </select>
              </div>
            </div>

            {/* Preferred Move-in Date and Property Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Move-in Date
                </label>
                <input
                  type="date"
                  name="move_in_date"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Intended Use
                </label>
                <select 
                  name="intended_use"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">Select intended use</option>
                  <option value="Office Space">Office Space</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Restaurant/Cafe">Restaurant/Cafe</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other Business">Other Business</option>
                </select>
              </div>
            </div>
            
            {/* Message */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(21, 77, 113, 0.5)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                placeholder="Tell us about your requirements..."
              ></textarea>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6 md:col-span-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base disabled:opacity-50 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(to right, #154D71, #1C6EA4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(21, 77, 113, 0.9), rgba(28, 110, 164, 0.9))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #154D71, #1C6EA4)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface VacantModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VacantModal({ property, isOpen, onClose }: VacantModalProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [viewStartTime] = useState(Date.now());
  const { logPropertyView, logContactInquiry } = useActivity();

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
      document.body.classList.add('modal-open'); // Add class to hide header
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open'); // Remove class to show header
    };
  }, [isOpen, onClose]);

  // Track property view when modal opens
  useEffect(() => {
    if (isOpen && property) {
      logPropertyView(property.id || 'unknown', {
        propertyTitle: property.title || property.location,
        source: 'modal',
        propertyType: property.propertyType,
        category: property.category,
        location: property.location
      });
    }
  }, [isOpen, property, logPropertyView]);

  // Track page exit with duration
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (property) {
        const duration = Date.now() - viewStartTime;
        logPropertyView(property.id || 'unknown', {
          source: 'modal',
          duration,
          propertyType: property.propertyType,
          category: property.category,
          location: property.location,
          exitTracking: true
        });
      }
    };

    if (isOpen) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [property, viewStartTime, isOpen]);

  if (!isOpen || !property) return null;

  // Format currency using Indian format - Clean implementation to prevent extra characters
  const formatCurrency = (value: number | string | undefined): string => {
    if (!value || value === '' || value === null || value === undefined) {
      return '-';
    }
    
    // Convert to number, handling both string and number inputs
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);
    
    // Return dash for invalid numbers
    if (isNaN(numericValue) || numericValue === 0) {
      return '-';
    }
    
    // Simple, clean formatting
    return `₹${numericValue.toLocaleString('en-IN')}`;
  };

  // Track contact inquiry
  const handleContactClick = () => {
    logContactInquiry(property.id || 'unknown', {
      contactType: 'modal-form',
      propertyTitle: property.location || 'Unknown Property'
    });
    setShowContactModal(true);
  };

  const handlePhoneClick = () => {
    logContactInquiry(property.id || 'unknown', {
      contactType: 'phone',
      propertyTitle: property.location || 'Unknown Property'
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center z-[1100] p-4" 
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
          {/* Header */}
          <div 
            className="px-6 py-4 rounded-t-2xl"
            style={{
              background: 'linear-gradient(to right, #154D71, #1C6EA4, #33A1E0)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{property.location}</h2>
                <div className="flex items-center text-white/80 mt-1">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{property.city}, {property.state}</span>
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

          <div className="p-6">
            {/* Property Image */}
            {property.image && (
              <div className="mb-6">
                <div className="h-72 md:h-96 relative overflow-hidden rounded-lg">
                  <PropertyImage
                    src={property.image}
                    alt={property.location || 'Property'} 
                    className="brightness-95 rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-900 text-white py-1 px-3 text-sm font-medium rounded">
                      {property.category}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Property Details */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Property Details</h3>
                
                {/* Basic Property Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'rgb(28, 110, 164)' }}>Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Property Category</h5>
                      <p className="font-semibold text-gray-800">{property.category || 'Not specified'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Property Type</h5>
                      <p className="font-semibold text-gray-800">Vacant</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Floor</h5>
                      <div className="flex items-center">
                        <FaBuilding className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                        <p className="font-semibold text-gray-800">{property.floor || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Facing</h5>
                      <p className="font-semibold text-gray-800">{property.facing || 'Not specified'}</p>
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
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        <p className="font-semibold text-gray-800">{property.state || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">City</h5>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        <p className="font-semibold text-gray-800">{property.city || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">District</h5>
                      <p className="font-semibold text-gray-800">{property.district || 'Not specified'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <h5 className="text-gray-500 text-sm uppercase mb-1">Status</h5>
                      <p className="font-semibold text-gray-800">{property.propertyStatus || 'Available'}</p>
                    </div>
                  </div>
                </div>

                {/* Area & Measurements */}
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium mb-3 text-yellow-800">Area & Measurements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.superArea && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Super Area</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.superArea} Sq.Ft</p>
                        </div>
                      </div>
                    )}
                    
                    {property.carpetArea && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Carpet Area</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.carpetArea} Sq.Ft</p>
                        </div>
                      </div>
                    )}
                    
                    {property.length && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Length</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.length} ft</p>
                        </div>
                      </div>
                    )}
                    
                    {property.width && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Width</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.width} ft</p>
                        </div>
                      </div>
                    )}
                    
                    {property.height && (
                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-gray-500 text-sm uppercase mb-1">Height</h5>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                          <p className="font-semibold text-gray-800">{property.height} ft</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium mb-3 text-red-800">Financial Details</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {property.rent && (
                      <div className="bg-white p-3 rounded">
                        <h5 className="text-gray-500 text-xs uppercase mb-1">Monthly Rent</h5>
                        <div className="flex items-center">
                          <FaRupeeSign className="mr-2 text-sm" style={{ color: 'rgb(28, 110, 164)' }} />
                          <div>
                            <p className="text-lg font-medium text-gray-800">{formatCurrency(property.rent)}</p>
                            <p className="text-xs text-gray-600">per month</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    
                  </div>
                </div>

                {/* Property Features */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 text-purple-800">Property Features & Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.category && (
                      <div key="feature-category" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-gray-700">{property.category}</p>
                      </div>
                    )}
                    {property.floor && (
                      <div key="feature-floor" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-gray-700">{property.floor} Floor</p>
                      </div>
                    )}
                    {property.facing && (
                      <div key="feature-facing" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-gray-700">{property.facing} Facing</p>
                      </div>
                    )}
                    {property.reference === 'Ready to Move-In' && (
                      <div key="feature-ready" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-green-600">Ready to Move-In</p>
                      </div>
                    )}
                    {(property.superArea || property.carpetArea) && (
                      <div key="feature-area" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-gray-700">Spacious Area</p>
                      </div>
                    )}
                    {(property.unitType || property.propertyType) && (
                      <div key="feature-type" className="bg-white p-2 rounded text-center">
                        <p className="text-xs text-gray-700">{property.unitType || property.propertyType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Section */}
              <div>
                <div 
                  className="rounded-lg p-4 text-white sticky top-6"
                  style={{
                    background: 'linear-gradient(to right, #154D71, #1C6EA4)'
                  }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium mb-2">Interested in this property?</h3>
                    <p className="text-white/90 text-sm">
                      Contact us today to schedule a viewing or get detailed information about this vacant property.
                    </p>
                  </div>
                  
                  {/* Quick Property Summary */}
                  <div className="bg-white/10 p-3 rounded mb-4">
                    <h4 className="text-sm font-medium mb-3 text-white">Quick Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Location:</span>
                        <span className="text-white font-medium">{property.city}</span>
                      </div>
                      {property.superArea && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Area:</span>
                          <span className="text-white font-medium">{property.superArea} Sq.Ft</span>
                        </div>
                      )}
                      {property.rent && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Rent:</span>
                          <span className="text-white font-medium">{formatCurrency(property.rent)}/mo</span>
                        </div>
                      )}
                      {property.floor && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Floor:</span>
                          <span className="text-white font-medium">{property.floor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleContactClick}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors py-2 px-4 rounded font-medium text-sm cursor-pointer"
                      style={{ color: 'rgb(28, 110, 164)' }}
                    >
                      <FaEnvelope className="text-sm" />
                      Request Information
                    </button>
                    
                    <a 
                      href="tel:+919999999999" 
                      onClick={handlePhoneClick}
                      className="w-full flex items-center justify-center gap-2 border border-white text-white hover:bg-white/10 transition-colors py-2 px-4 rounded font-medium text-sm"
                    >
                      <FaPhone className="text-sm" />
                      Call Now
                    </a>
                  </div>
                  
                  {/* Contact Info */}
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

      {/* Contact Modal */}
      {showContactModal && (
        <VacantContactModal
          property={property}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          logContactInquiry={logContactInquiry}
        />
      )}
    </>
  );
}