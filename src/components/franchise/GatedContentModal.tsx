'use client';

import { useState } from 'react';
import { FaTimes, FaLock, FaDownload } from 'react-icons/fa';

// Define the Franchise interface to match the database
interface Franchise {
  id?: string | null;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number | string;
  maxInvestment?: number | string;
  royalty?: string;
  establishmentYear?: string;
  franchiseStartedYear?: string;
  numberOutlets?: string;
  minPaybackPeriod?: string;
  maxPaybackPeriod?: string;
  headquarter?: string;
  remarks?: string;
  brandDeck?: string;
  productList?: string;
  roiSheet?: string;
  investorDiscoveryKitUrl?: string;
  investment: number | string;
  location: string;
  status: string;
  roi: string;
  description?: string;
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface GatedContentModalProps {
  franchise: Franchise | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GatedContentModal({ franchise, isOpen, onClose, onSuccess }: GatedContentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !franchise) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '-';
    
    // If it's already a string with text (like "20 LACS"), return as is
    if (typeof value === 'string' && isNaN(Number(value))) {
      return value;
    }
    
    // Convert to number for formatting
    const numAmount = typeof value === 'string' ? Number(value) : value;
    
    if (isNaN(numAmount)) {
      return "₹0";
    }
    
    if (numAmount >= 10000000) {
      return `₹${(numAmount / 10000000).toFixed(1)} Cr`;
    } else if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(1)} Lakhs`;
    } else {
      return `₹${numAmount.toLocaleString()}`;
    }
  };

  // Get investment display
  const getInvestmentDisplay = () => {
    if (franchise.minInvestment && franchise.maxInvestment) {
      return `${formatCurrency(franchise.minInvestment)} - ${formatCurrency(franchise.maxInvestment)}`;
    }
    return formatCurrency(franchise.minInvestment || franchise.investment);
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
      tempForm.action = 'https://formsubmit.co/ishank@stealdeals.co.in';
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
      
      // Add the form to the document and submit
      document.body.appendChild(tempForm);
      tempForm.submit();
      
      // Clean up
      document.body.removeChild(tempForm);
      
      // Call success handler immediately (don't wait for redirect)
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[1004] p-4" 
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
              <FaLock className="text-white mr-3 text-xl" />
              <h3 className="text-lg md:text-xl font-bold text-white">Unlock Investor Discovery Kit</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/70 transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <FaTimes className="text-lg md:text-xl" />
            </button>
          </div>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            Please provide your details to access the investor discovery kit for {franchise.product || franchise.name}
          </p>
        </div>

        {/* Form */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Hidden fields */}
            <input type="hidden" name="_subject" value={`Investor Discovery Kit Request - ${franchise.product || franchise.name} (Gated Content)`} />
            <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/franchise?kit_unlocked=true&franchise_id=${franchise.id || ''}`} />
            <input type="hidden" name="_captcha" value="false" />
            
            <input type="hidden" name="franchise_name" value={franchise.product || franchise.name} />
            <input type="hidden" name="franchise_industry" value={franchise.industry} />
            <input type="hidden" name="franchise_investment" value={getInvestmentDisplay()} />
            <input type="hidden" name="franchise_location" value={franchise.headquarter || franchise.location} />
            <input type="hidden" name="franchise_roi" value={franchise.royalty || franchise.roi || 'NA'} />
            <input type="hidden" name="form_type" value="Gated Content - Investor Discovery Kit" />

            {/* Franchise Name (readonly) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Franchise Name
              </label>
              <input
                type="text"
                value={franchise.product || franchise.name}
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
            
            {/* Phone and Investment Budget */}
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
                  Investment Budget
                </label>
                <select 
                  name="investment_budget"
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
                  <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                  <option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                  <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                  <option value="₹50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                  <option value="Above ₹1 Crore">Above ₹1 Crore</option>
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
                placeholder="Tell us about your franchise requirements..."
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
                    Unlocking...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Unlock Discovery Kit
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