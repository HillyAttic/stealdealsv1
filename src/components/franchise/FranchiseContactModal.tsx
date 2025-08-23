'use client';

import { FaTimes } from 'react-icons/fa';

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

interface FranchiseContactModalProps {
  franchise: Franchise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FranchiseContactModal({ franchise, isOpen, onClose }: FranchiseContactModalProps) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1003] p-4" style={{
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="bg-primary px-4 md:px-6 py-3 md:py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-white">Request Information</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-primary/20 transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <FaTimes className="text-lg md:text-xl" />
            </button>
          </div>
          <p className="text-primary/20 text-xs md:text-sm mt-1">
            Get detailed information about {franchise.name}
          </p>
        </div>

        <div className="p-4 md:p-6">
          <form 
            action="https://formsubmit.co/stealdeals.co.in@gmail.com" 
            method="POST"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            <input type="hidden" name="_subject" value={`Franchise Inquiry - ${franchise.name} (Contact Modal)`} />
            <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/franchise?success=true`} />
            <input type="hidden" name="_captcha" value="false" />
            
            <input type="hidden" name="franchise_name" value={franchise.name} />
            <input type="hidden" name="franchise_industry" value={franchise.industry} />
            <input type="hidden" name="franchise_investment" value={getInvestmentDisplay()} />
            <input type="hidden" name="franchise_location" value={franchise.location} />
            <input type="hidden" name="franchise_roi" value={franchise.roi || 'Not specified'} />
            <input type="hidden" name="form_type" value="Separate Contact Modal" />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Franchise Name
              </label>
              <input
                type="text"
                value={franchise.name}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-primary/5 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Investment Budget
                </label>
                <select 
                  name="investment_budget"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about your franchise requirements..."
              ></textarea>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6 md:col-span-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}