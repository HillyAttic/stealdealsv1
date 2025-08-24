'use client';

import { useCallback, useState } from 'react';
import { FaMapMarkerAlt, FaMoneyBillWave, FaChartLine, FaHandshake, FaDownload, FaLock } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { useGatedContent } from '@/hooks/useGatedContent';
import { GatedContentModal } from './GatedContentModal';
import { SuccessMessage } from './SuccessMessage';

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
  // Counter for generating consistent IDs
  let franchiseIdCounter = 0;
  
  // Generate a consistent ID for this franchise
  const franchiseId = franchise.id || `franchise-${++franchiseIdCounter}`;

  // Gated content state
  const { isContentUnlocked, unlockContent } = useGatedContent('franchise');
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isUnlocked = isContentUnlocked(franchiseId);

  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    // No longer needed - auth prompts are disabled
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

  // Handle investor discovery kit click
  const handleInvestorKitClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!franchise.investorDiscoveryKitUrl) {
      return; // Do nothing if no URL
    }
    
    if (isUnlocked) {
      // Content is unlocked, open the Google Drive link
      window.open(franchise.investorDiscoveryKitUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Content is locked, show the gated modal
      setShowGatedModal(true);
    }
  };

  // Handle successful form submission
  const handleGatedSuccess = () => {
    setShowGatedModal(false);
    unlockContent(franchiseId);
    setShowSuccessMessage(true);
  };

  // Handle download from success message
  const handleDownloadFromSuccess = () => {
    setShowSuccessMessage(false);
    if (franchise.investorDiscoveryKitUrl) {
      window.open(franchise.investorDiscoveryKitUrl, '_blank', 'noopener,noreferrer');
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
            <div className="absolute top-4 left-4 bg-highlight text-primary px-3 py-1 rounded-md text-sm font-medium">
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
              <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2.5 py-0.5 rounded">
                {franchise.segment}
              </span>
            )}
            {franchise.model && (
              <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-0.5 rounded">
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
        <div className="bg-accent/10 border-l-4 border-accent p-3 rounded-md mb-4 shadow-sm">
          <h4 className="text-sm font-bold text-accent mb-1 uppercase">Product</h4>
          <p className="text-md font-bold text-gray-900 group-hover:text-primary transition-colors">
            {franchise.product || franchise.name || 'Product Available'}
          </p>
        </div>

        {/* Investment and ROI */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-700">
            <FaMoneyBillWave className="mr-2 text-secondary" />
            <span>
              {franchise.maxInvestment && franchise.maxInvestment !== "" 
                ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                : formatInvestment(franchise.minInvestment || franchise.investment)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FaChartLine className="mr-2 text-accent" />
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
                ? `${franchise.minArea} - ${franchise.maxArea}`
                : `${franchise.minArea !== "NA" ? franchise.minArea : franchise.maxArea}`}
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
          {franchise.investorDiscoveryKitUrl ? (
            <button
              onClick={handleInvestorKitClick}
              className={`w-full flex justify-center items-center py-2 px-4 rounded transition-all duration-300 text-white ${
                isUnlocked 
                  ? 'hover:shadow-lg' 
                  : 'hover:shadow-lg'
              }`}
              style={{
                background: isUnlocked 
                  ? '#154D71' 
                  : 'linear-gradient(to right, #f59e0b, #dc2626)'
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.background = 'rgba(21, 77, 113, 0.9)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(to right, #d97706, #b91c1c)';
                }
              }}
              onMouseLeave={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.background = '#154D71';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #dc2626)';
                }
              }}
            >
              {isUnlocked ? (
                <>
                  <FaDownload className="mr-2" />
                  Investor Discovery Kit
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Unlock Discovery Kit
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex justify-center items-center bg-gray-400 text-gray-200 py-2 px-4 rounded cursor-not-allowed">
              <FaDownload className="mr-2" />
              Investor Discovery Kit
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CardContent />
      
      {/* Gated Content Modal */}
      <GatedContentModal
        franchise={franchise}
        isOpen={showGatedModal}
        onClose={() => setShowGatedModal(false)}
        onSuccess={handleGatedSuccess}
      />
      
      {/* Success Message */}
      <SuccessMessage
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        onDownload={handleDownloadFromSuccess}
        franchiseName={franchise.product || franchise.name}
      />
    </>
  );
}