'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { FaMapMarkerAlt, FaRulerCombined, FaDownload, FaLock } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import PropertyImage from '@/components/PropertyImage';
import { Plot } from '@/lib/firebase';
import { useGatedContent } from '@/hooks/useGatedContent';
import { PlotGatedContentModal } from './PlotGatedContentModal';
import { PlotSuccessMessage } from './PlotSuccessMessage';

interface PlotCardProps {
  plot: Plot;
  linkPath?: string;
  className?: string;
  showWishlist?: boolean;
}

export function PlotCard({ 
  plot, 
  linkPath,
  className = '',
  showWishlist = true
}: PlotCardProps) {
  // Generate a consistent ID for this plot
  const plotId = plot.id || `plot-${plot.project?.replace(/\s+/g, '-').toLowerCase()}`;

  // Gated content state
  const { isContentUnlocked, unlockContent } = useGatedContent('plot');
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isUnlocked = isContentUnlocked(plotId);

  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    // No longer needed - auth prompts are disabled
  }, []);

  // Format currency using Indian format
  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return '-';
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Determine the link path
  const getHref = () => {
    if (linkPath) return linkPath;
    return `/plots/${plot.id}`;
  };

  // Get plot size range display
  const getPlotSizeDisplay = () => {
    if (plot.plotSize?.min && plot.plotSize?.max) {
      return `${plot.plotSize.min}–${plot.plotSize.max} ${plot.plotSize.unit}`;
    }
    return 'Size not specified';
  };

  // Get investment display
  const getInvestmentDisplay = () => {
    if (plot.investmentStartsFrom?.amount) {
      return `Investment starts from ${formatCurrency(plot.investmentStartsFrom.amount)} per ${plot.investmentStartsFrom.unit} only`;
    }
    return 'Investment details not available';
  };

  // Handle investor discovery kit click
  const handleInvestorKitClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!plot.investorDiscoveryKit?.url) {
      return; // Do nothing if no URL
    }
    
    if (isUnlocked) {
      // Content is unlocked, open the discovery kit URL
      window.open(plot.investorDiscoveryKit.url, '_blank', 'noopener,noreferrer');
    } else {
      // Content is locked, show the gated modal
      setShowGatedModal(true);
    }
  };

  // Handle successful form submission
  const handleGatedSuccess = () => {
    setShowGatedModal(false);
    unlockContent(plotId);
    setShowSuccessMessage(true);
  };

  // Handle download from success message
  const handleDownloadFromSuccess = () => {
    setShowSuccessMessage(false);
    if (plot.investorDiscoveryKit?.url) {
      window.open(plot.investorDiscoveryKit.url, '_blank', 'noopener,noreferrer');
    }
  };

  const CardContent = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-200 h-full flex flex-col ${className}`}>
      <div className="relative">
        <div className="h-64 relative overflow-hidden">
          <PropertyImage 
            src={plot.images?.[0]} 
            alt={plot.project || 'Plot Project'}
            className="transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Status badges */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${
              plot.status === 'Ready to Move In' 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {plot.status}
            </span>
          </div>

          {/* Wishlist Button */}
          {showWishlist && plot.id && (
            <div className="absolute top-4 right-4">
              <WishlistButton
                propertyId={plot.id}
                size="md"
                onAuthRequired={handleAuthRequired}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Project and Developer - Clean display without labels */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors leading-tight">
            {plot.project || 'Project Name Not Available'}
          </h3>
          <p className="text-base text-gray-600 font-medium">
            {plot.developerName || 'Developer Name Not Available'}
          </p>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          <span>{plot.location}</span>
        </div>
        
        {/* Plot Size Range */}
        <div className="flex items-center text-gray-600 mb-3">
          <FaRulerCombined className="mr-2 text-blue-900" />
          <span>{getPlotSizeDisplay()}</span>
        </div>
        
        {/* Investment Details */}
        <div className="bg-blue-50 p-3 rounded-md mb-4 mt-auto">
          <p className="text-blue-900 font-semibold text-sm leading-relaxed">
            {getInvestmentDisplay()}
          </p>
        </div>

        {/* Investor Discovery Kit - Gated Content */}
        <div className="border-t pt-3 mt-auto">
          {plot.investorDiscoveryKit?.url ? (
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
      {linkPath !== null ? (
        <Link href={getHref()}>
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
      
      {/* Gated Content Modal */}
      <PlotGatedContentModal
        plot={plot}
        isOpen={showGatedModal}
        onClose={() => setShowGatedModal(false)}
        onSuccess={handleGatedSuccess}
      />
      
      {/* Success Message */}
      <PlotSuccessMessage
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        onDownload={handleDownloadFromSuccess}
        plotName={plot.project}
      />
    </>
  );
}