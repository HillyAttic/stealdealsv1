'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FaMapMarkerAlt, FaRulerCombined, FaDownload } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';
import PropertyImage from '@/components/PropertyImage';
import { Plot } from '@/lib/firebase';

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    setShowAuthPrompt(true);
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

        {/* Investor Discovery Kit Download */}
        {plot.investorDiscoveryKit?.url && (
          <div className="mt-3">
            <a
              href={plot.investorDiscoveryKit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking download
            >
              <FaDownload className="mr-2" />
              Download Investor Discovery Kit
            </a>
          </div>
        )}
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

      {/* Auth Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in to save plots"
        feature="wishlist"
      />
    </>
  );
}