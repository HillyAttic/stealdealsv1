'use client';

import { useState, useCallback } from 'react';
import { FaMapMarkerAlt, FaMoneyBillWave, FaChartLine, FaHandshake, FaDownload } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';

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

interface FranchiseCardProps {
  franchise: Franchise;
  className?: string;
  showWishlist?: boolean;
  onOpenModal?: (franchise: Franchise) => void;
}

export function FranchiseCard({ 
  franchise, 
  className = '',
  showWishlist = true,
  onOpenModal
}: FranchiseCardProps) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Counter for generating consistent IDs
  let franchiseIdCounter = 0;
  
  // Generate a consistent ID for this franchise
  const franchiseId = franchise.id || `franchise-${++franchiseIdCounter}`;

  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    setShowAuthPrompt(true);
  }, []);

  // Format the investment amount to show as lakhs or crores
  const formatInvestment = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) {
      return "₹0";
    }
    
    // If it's already a string with text (like "20 LACS"), return as is
    if (typeof amount === 'string' && isNaN(Number(amount))) {
      return amount;
    }
    
    // Convert to number for formatting
    const numAmount = typeof amount === 'string' ? Number(amount) : amount;
    
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

  // Default image if none provided
  const defaultImage = 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  // Handle card click to open modal
  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(franchise);
    }
  };

  const CardContent = () => (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="h-56 relative overflow-hidden">
          <img 
            src={franchise.image || defaultImage}
            alt={franchise.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {franchise.status === 'Limited' && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              Limited
            </div>
          )}
          {showWishlist && (
            <div className="absolute top-4 right-4">
              <WishlistButton
                propertyId={franchiseId}
                size="md"
                onAuthRequired={handleAuthRequired}
              />
            </div>
          )}
        </div>
      </div>
    
      <div className="p-5 flex-1 flex flex-col">
        {/* Header with badges only (removed title) */}
        <div className="flex justify-end items-start mb-2">
          <div className="flex flex-row flex-wrap gap-1 items-center justify-end">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded">
              {franchise.industry}
            </span>
            {franchise.segment && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {franchise.segment}
              </span>
            )}
            {franchise.model && (
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {franchise.model}
              </span>
            )}
          </div>
        </div>
        
        {/* Location */}
        <p className="text-gray-600 mb-2 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2 text-primary" />
          {franchise.headquarter || franchise.location}
        </p>

        {/* Product Display - HIGH PRIORITY */}
        <div className="bg-indigo-100 border-l-4 border-indigo-500 p-3 rounded-md mb-4 shadow-sm">
          <h4 className="text-sm font-bold text-indigo-800 mb-1 uppercase">Product</h4>
          <p className="text-md font-bold text-gray-900 group-hover:text-primary transition-colors">
            {franchise.product || franchise.name || 'Product Available'}
          </p>
        </div>

        {/* Investment and ROI */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-700">
            <FaMoneyBillWave className="mr-2 text-green-600" />
            <span>
              {franchise.maxInvestment && franchise.maxInvestment !== "" 
                ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                : formatInvestment(franchise.minInvestment || franchise.investment)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FaChartLine className="mr-2 text-green-600" />
            <span>{franchise.royalty || franchise.roi}</span>
          </div>
        </div>
        
        {/* Area Requirements */}
        {((franchise.minArea && franchise.minArea !== "NA") || (franchise.maxArea && franchise.maxArea !== "NA")) && (
          <div className="bg-primary/5 p-2 rounded-md mb-3">
            <h4 className="text-xs font-medium text-primary mb-1">Area Requirements</h4>
            <p className="text-xs text-gray-700">
              {(franchise.minArea && franchise.minArea !== "NA") && 
               (franchise.maxArea && franchise.maxArea !== "NA")
                ? `${franchise.minArea} - ${franchise.maxArea} sq.ft.`
                : `${franchise.minArea !== "NA" ? franchise.minArea : franchise.maxArea} sq.ft.`}
            </p>
          </div>
        )}
        
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2 rounded-md text-xs">
          {/* Establishment Year */}
          <div>
            <span className="text-gray-500">Est. Year:</span>
            <span className="ml-1 text-gray-700 font-medium">{franchise.establishmentYear || 'N/A'}</span>
          </div>
          
          {/* Franchise Started */}
          <div>
            <span className="text-gray-500">Started:</span>
            <span className="ml-1 text-gray-700 font-medium">{franchise.franchiseStartedYear || 'N/A'}</span>
          </div>
          
          {/* Outlets */}
          <div>
            <span className="text-gray-500">Outlets:</span>
            <span className="ml-1 text-gray-700 font-medium">{franchise.numberOutlets || 'N/A'}</span>
          </div>
          
          {/* Payback Period */}
          <div>
            <span className="text-gray-500">Payback:</span>
            <span className="ml-1 text-gray-700 font-medium">
              {franchise.minPaybackPeriod && franchise.maxPaybackPeriod 
                ? `${franchise.minPaybackPeriod}-${franchise.maxPaybackPeriod}`
                : franchise.minPaybackPeriod || franchise.maxPaybackPeriod || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3 mt-auto">
          <div className="w-full flex justify-center items-center bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded transition-colors">
            <FaDownload className="mr-2" />
            Investor Discovery Kit
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CardContent />

      {/* Auth Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in to save franchises"
        feature="wishlist"
      />
    </>
  );
}