'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaRulerCombined, FaLock } from 'react-icons/fa';
import PropertyImage from '@/components/PropertyImage';
import { Plot } from '@/lib/firebase';
import { useGatedContent } from '@/hooks/useGatedContent';
import { PlotGatedContentModal } from './PlotGatedContentModal';
import { PlotSuccessMessage } from './PlotSuccessMessage';

interface PlotModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlotModal({ plot, isOpen, onClose }: PlotModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Generate a consistent ID for this plot (same as PlotCard)
  const plotId = plot?.id || `plot-${plot?.project?.replace(/\s+/g, '-').toLowerCase()}`;

  // Gated content state
  const { isContentUnlocked, unlockContent } = useGatedContent('plot');
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isUnlocked = plot ? isContentUnlocked(plotId) : false;

  // Reset image index when plot changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [plot]);

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
      
      // Hide header when modal is open
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      
      // Show header when modal closes
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'block';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !plot) return null;

  // Format currency using Indian format
  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return '-';
    return `₹${value.toLocaleString('en-IN')}`;
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

  // Navigation functions for image gallery
  const nextImage = () => {
    if (plot.images && plot.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % plot.images.length);
    }
  };

  const prevImage = () => {
    if (plot.images && plot.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + plot.images.length) % plot.images.length);
    }
  };

  // Handle investor discovery kit click
  const handleInvestorKitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!plot?.investorDiscoveryKit?.url) {
      return;
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
    if (plot?.investorDiscoveryKit?.url) {
      window.open(plot.investorDiscoveryKit.url, '_blank', 'noopener,noreferrer');
    }
  };

  const validImages = plot.images?.filter(img => img && img.trim() !== '') || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 md:p-4" style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background: 'rgba(0, 0, 0, 0.3)'
    }}>
      <div className="bg-white/95 backdrop-blur-md md:rounded-lg max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{plot.project}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {validImages.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="h-96 relative overflow-hidden rounded-lg">
                  <PropertyImage
                    src={validImages[currentImageIndex]}
                    alt={`${plot.project} - Image ${currentImageIndex + 1}`}
                    className="rounded-lg"
                  />
                  
                  {/* Navigation arrows */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image indicators */}
                {validImages.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-blue-900' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="flex flex-col">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Project Details</h3>
                
                {/* Developer */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Developer</label>
                  <p className="text-lg text-gray-800">{plot.developerName}</p>
                </div>
                
                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                  <div className="flex items-center text-gray-800">
                    <FaMapMarkerAlt className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                    <span>{plot.location}</span>
                  </div>
                </div>
                
                {/* Status */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                    plot.status === 'Ready to Move In' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {plot.status}
                  </span>
                </div>
                
                {/* Plot Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Plot Size Range</label>
                  <div className="flex items-center text-gray-800">
                    <FaRulerCombined className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
                    <span>{getPlotSizeDisplay()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
              
              {/* Description */}
              {plot.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div 
                    className="prose prose-blue max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: plot.description }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Investment Details and Downloads Grid - Desktop Only */}
          <div className="hidden lg:block mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Details Card */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-3">$</span>
                  Investment Details
                </h3>
                
                {/* Investment - Enhanced with Red Theme */}
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 h-[280px] flex flex-col">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-400 rounded-full opacity-20 -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-700 rounded-full opacity-20 -mb-8 -ml-8"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-white text-xs font-medium uppercase tracking-wider">
                          SPECIAL OFFER
                        </span>
                      </div>
                      <div className="bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        HOT DEAL!
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-white font-bold text-lg leading-relaxed mb-2">
                        {getInvestmentDisplay()}
                      </p>
                      
                      <div className="flex items-center text-red-100 text-sm mb-4">
                        <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        Limited time investment opportunity
                      </div>
                    </div>
                    
                    {/* Call to action line */}
                    <div className="mt-auto pt-3 border-t border-white/30">
                      <p className="text-white/90 text-sm font-medium">
                        <strong>Act Now:</strong> Secure your investment with minimal down payment
                      </p>
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
                </div>
              </div>

              {/* Downloads Card */}
              {plot.investorDiscoveryKit?.url && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm mr-3 ${
                      isUnlocked 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}>
                      {isUnlocked ? '📁' : '🔒'}
                    </span>
                    Downloads
                  </h3>
                  
                  {/* Enhanced Download Card with Blue Theme - Same height as Investment Details */}
                  <div className={`relative p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 h-[280px] flex flex-col ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-r from-orange-500 to-red-600'
                  }`}>
                    {/* Decorative elements */}
                    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 -mt-10 -mr-10 ${
                      isUnlocked ? 'bg-blue-400' : 'bg-orange-400'
                    }`}></div>
                    <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-20 -mb-8 -ml-8 ${
                      isUnlocked ? 'bg-blue-700' : 'bg-red-700'
                    }`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-white text-xs font-medium uppercase tracking-wider">
                            {isUnlocked ? 'AVAILABLE NOW' : 'UNLOCK REQUIRED'}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse ${
                          isUnlocked 
                            ? 'bg-green-400 text-blue-800' 
                            : 'bg-yellow-400 text-red-800'
                        }`}>
                          {isUnlocked ? 'READY!' : 'LOCKED!'}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-white font-bold text-lg leading-relaxed mb-4">
                          {isUnlocked 
                            ? 'Download complete investor discovery kit with brochures & videos'
                            : 'Submit your details to unlock exclusive investor discovery kit'
                          }
                        </p>
                        
                        <div className="flex items-center text-blue-100 text-sm mb-6">
                          <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          {isUnlocked 
                            ? 'Instant download access available'
                            : 'Quick form submission required'
                          }
                        </div>
                      </div>
                      
                      {/* Call to action section */}
                      <div className="mt-auto pt-3 border-t border-white/30">
                        <p className="text-white/90 text-sm font-medium mb-3">
                          <strong>{isUnlocked ? 'Click below:' : 'Get Access:'}:</strong> {isUnlocked 
                            ? 'Instant access to all materials'
                            : 'Fill the form to unlock premium investment materials'
                          }
                        </p>
                        
                        {/* Enhanced Download Button */}
                        <button
                          onClick={handleInvestorKitClick}
                          className={`w-full flex justify-center items-center py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                            isUnlocked 
                              ? 'bg-white text-blue-600 hover:bg-blue-50' 
                              : 'bg-white text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {isUnlocked ? (
                            <>
                              <FaDownload className="mr-3 text-xl" />
                              Download Discovery Kit
                            </>
                          ) : (
                            <>
                              <FaLock className="mr-3 text-xl" />
                              Unlock Discovery Kit
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investment Details - Show only on Mobile (below description) */}
          <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-3">$</span>
              Investment Details
            </h3>
            
            {/* Investment - Enhanced with Red Theme */}
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-400 rounded-full opacity-20 -mt-10 -mr-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-700 rounded-full opacity-20 -mb-8 -ml-8"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white text-xs font-medium uppercase tracking-wider">
                      SPECIAL OFFER
                    </span>
                  </div>
                  <div className="bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    HOT DEAL!
                  </div>
                </div>
                
                <p className="text-white font-bold text-lg leading-relaxed mb-2">
                  {getInvestmentDisplay()}
                </p>
                
                <div className="flex items-center text-red-100 text-sm">
                  <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  Limited time investment opportunity
                </div>
                
                {/* Call to action line */}
                <div className="mt-4 pt-3 border-t border-white/30">
                  <p className="text-white/90 text-sm font-medium">
                    <strong>Act Now:</strong> Secure your investment with minimal down payment
                  </p>
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
            </div>

            {/* Investor Discovery Kit - Mobile Only */}
            {plot.investorDiscoveryKit?.url && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-3 ${
                    isUnlocked 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-orange-600 text-white'
                  }`}>
                    {isUnlocked ? '📁' : '🔒'}
                  </span>
                  Downloads
                </h3>
                
                {/* Enhanced Download Card with Blue Theme - Mobile */}
                <div className={`relative p-6 rounded-xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600'
                }`}>
                  {/* Decorative elements */}
                  <div className={`absolute top-0 right-0 w-16 h-16 rounded-full opacity-20 -mt-8 -mr-8 ${
                    isUnlocked ? 'bg-blue-400' : 'bg-orange-400'
                  }`}></div>
                  <div className={`absolute bottom-0 left-0 w-12 h-12 rounded-full opacity-20 -mb-6 -ml-6 ${
                    isUnlocked ? 'bg-blue-700' : 'bg-red-700'
                  }`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-white text-xs font-medium uppercase tracking-wider">
                          {isUnlocked ? 'AVAILABLE' : 'UNLOCK'}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold animate-pulse ${
                        isUnlocked 
                          ? 'bg-green-400 text-blue-800' 
                          : 'bg-yellow-400 text-red-800'
                      }`}>
                        {isUnlocked ? 'READY!' : 'LOCKED!'}
                      </div>
                    </div>
                    
                    <p className="text-white font-bold text-base leading-relaxed mb-2">
                      {isUnlocked 
                        ? 'Download investor discovery kit'
                        : 'Submit details to unlock kit'
                      }
                    </p>
                    
                    <div className="flex items-center text-blue-100 text-sm">
                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      {isUnlocked 
                        ? 'Instant download access'
                        : 'Quick form required'
                      }
                    </div>
                    
                    {/* Enhanced Download Button */}
                    <div className="mt-4">
                      <button
                        onClick={handleInvestorKitClick}
                        className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                          isUnlocked 
                            ? 'bg-white text-blue-600 hover:bg-blue-50' 
                            : 'bg-white text-orange-600 hover:bg-orange-50'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <FaDownload className="mr-2" />
                            Download Kit
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            Unlock Kit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2 text-center">
                  📋 Contains brochure, payment plan, and promotional materials
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Gated Content Modal */}
      {plot && (
        <PlotGatedContentModal
          plot={plot}
          isOpen={showGatedModal}
          onClose={() => setShowGatedModal(false)}
          onSuccess={handleGatedSuccess}
        />
      )}
      
      {/* Success Message */}
      {plot && (
        <PlotSuccessMessage
          isOpen={showSuccessMessage}
          onClose={() => setShowSuccessMessage(false)}
          onDownload={handleDownloadFromSuccess}
          plotName={plot.project}
        />
      )}
    </div>
  );
}