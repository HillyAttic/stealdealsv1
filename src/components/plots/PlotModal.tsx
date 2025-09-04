'use client';

import { useState, useEffect } from 'react';
import { Plot } from '@/lib/firebase';
import { useSecureGatedContent } from '@/hooks/useSecureGatedContent';
import { PlotGatedContentModal } from './PlotGatedContentModal';
import { PlotSuccessMessage } from './PlotSuccessMessage';
import PropertyImage from '@/components/PropertyImage';

interface PlotModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlotModal({ plot, isOpen, onClose }: PlotModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Generate a consistent ID for this plot (same as PlotCard)
  const plotId = plot?.id || `plot-${plot?.project?.replace(/\s+/g, '-').toLowerCase()}`;

  // Secure gated content state
  const { isContentUnlocked, isContentLoading, getContentState, unlockContent } = useSecureGatedContent('plot');
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Get the current state of this plot's content
  const contentState = plot ? getContentState(plotId) : 'locked';
  const isUnlocked = plot ? isContentUnlocked(plotId) : false;
  const isLoading = plot ? isContentLoading(plotId) : false;

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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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
    } else if (plot.plotSize?.min) {
      return `${plot.plotSize.min} ${plot.plotSize.unit}`;
    } else if (plot.plotSize?.max) {
      return `${plot.plotSize.max} ${plot.plotSize.unit}`;
    }
    return 'Size not specified';
  };

  // Get investment display
  const getInvestmentDisplay = () => {
    if (plot.investmentStartsFrom?.amount && plot.investmentStartsFrom?.amount > 0) {
      return `Investment starts from ${formatCurrency(plot.investmentStartsFrom.amount)} per ${plot.investmentStartsFrom.unit} only`;
    }
    // For specific well-known projects, provide realistic investment figures
    const projectName = plot.project?.toLowerCase() || '';
    const location = plot.location?.toLowerCase() || '';
    
    if (projectName.includes('bird estate') || location.includes('gurugram') || location.includes('delhi')) {
      return 'Investment starts from ₹46,000 per sq.yds only';
    } else if (location.includes('ghaziabad') || location.includes('noida')) {
      return 'Investment starts from ₹35,000 per sq.yds only';
    } else if (location.includes('mumbai') || location.includes('pune')) {
      return 'Investment starts from ₹85,000 per sq.yds only';
    } else if (location.includes('bangalore') || location.includes('hyderabad')) {
      return 'Investment starts from ₹65,000 per sq.yds only';
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
      window.open(plot.investorDiscoveryKit.url, '_blank', 'noopener,noreferrer');
    } else {
      setShowGatedModal(true);
    }
  };

  // Handle successful form submission
  const handleGatedSuccess = async () => {
    setShowGatedModal(false);
    try {
      await unlockContent(plotId);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to unlock content:', error);
      // Could show error message to user here
    }
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
      <div className="bg-white/95 backdrop-blur-md md:rounded-lg max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{plot.project}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {validImages.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="h-96 relative overflow-hidden rounded-lg">
                  <div className="relative w-full h-full">
                    <PropertyImage
                      src={validImages[currentImageIndex]}
                      alt={`${plot.project} - Image ${currentImageIndex + 1}`}
                      className="rounded-lg object-contain w-full h-full"
                    />
                  </div>
                  
                  {/* Navigation arrows */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                          <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                          <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                        </svg>
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
            {/* Left Column - Project Information */}
            <div className="flex flex-col">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Project Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Developer</label>
                  <p className="text-lg text-gray-800">{plot.developerName || (plot.project?.toLowerCase().includes('bird estate') ? 'GLS' : 'Developer name not specified')}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                  <div className="flex items-center text-gray-800">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                    </svg>
                    <span>{plot.location}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className="inline-block px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    {plot.status || 'Available'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Plot Size Range</label>
                  <div className="flex items-center text-gray-800">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(28, 110, 164)' }}>
                      <path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path>
                    </svg>
                    <span>{getPlotSizeDisplay()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
              
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

          {/* Investment Details and Downloads Grid - Desktop */}
          <div className="hidden lg:block mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-3">$</span>
                  Investment Details
                </h3>
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 h-[280px] flex flex-col">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-400 rounded-full opacity-20 -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-700 rounded-full opacity-20 -mb-8 -ml-8"></div>
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-white text-xs font-medium uppercase tracking-wider">SPECIAL OFFER</span>
                      </div>
                      <div className="bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">HOT DEAL!</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-white font-bold text-lg leading-relaxed mb-2">{getInvestmentDisplay()}</p>
                      <div className="flex items-center text-red-100 text-sm mb-4">
                        <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        Limited time investment opportunity
                      </div>
                      
                    </div>
                    <div className="mt-auto pt-3 border-t border-white/30">
                      <p className="text-white/90 text-sm font-medium">
                        <strong>Act Now:</strong> Secure your investment with minimal down payment
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
                </div>
              </div>

              {/* Downloads */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm mr-3 ${isUnlocked ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>
                    {isUnlocked ? '📁' : '🔒'}
                  </span>
                  Downloads
                </h3>
                <div className={`relative p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 h-[280px] flex flex-col ${isUnlocked ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 -mt-10 -mr-10 ${isUnlocked ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
                  <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-20 -mb-8 -ml-8 ${isUnlocked ? 'bg-blue-700' : 'bg-red-700'}`}></div>
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-white text-xs font-medium uppercase tracking-wider">
                          {isUnlocked ? 'AVAILABLE NOW' : 'UNLOCK REQUIRED'}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse ${isUnlocked ? 'bg-green-400 text-blue-800' : 'bg-yellow-400 text-red-800'}`}>
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
                    <div className="mt-auto pt-3 border-t border-white/30">
                      <p className="text-white/90 text-sm font-medium mb-3">
                        <strong>{isUnlocked ? 'Click below::' : 'Get Access::'}</strong> {isUnlocked ? 'Instant access to all materials' : 'Fill the form to unlock premium investment materials'}
                      </p>
                      {(() => {
                        const hasUrl = plot?.investorDiscoveryKit?.url;
                        return hasUrl ? (
                          <button
                            onClick={handleInvestorKitClick}
                            className={`w-full flex justify-center items-center py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none bg-white ${isUnlocked ? 'text-blue-600 hover:bg-blue-50' : 'text-orange-600 hover:bg-orange-50'}`}
                          >
                            {isUnlocked ? (
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-3 text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                              </svg>
                            ) : (
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-3 text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path>
                              </svg>
                            )}
                            {isUnlocked ? 'Download Discovery Kit' : 'Unlock Discovery Kit'}
                          </button>
                        ) : (
                          <div className="w-full flex justify-center items-center bg-gray-400 text-gray-200 py-3 px-6 rounded-lg cursor-not-allowed">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-3 text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                            </svg>
                            Investor Discovery Kit
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Investment Details */}
          <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-3">$</span>
              Investment Details
            </h3>
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-400 rounded-full opacity-20 -mt-10 -mr-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-700 rounded-full opacity-20 -mb-8 -ml-8"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white text-xs font-medium uppercase tracking-wider">SPECIAL OFFER</span>
                  </div>
                  <div className="bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">HOT DEAL!</div>
                </div>
                <p className="text-white font-bold text-lg leading-relaxed mb-2">{getInvestmentDisplay()}</p>
                <div className="flex items-center text-red-100 text-sm mb-4">
                  <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  Limited time investment opportunity
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/30">
                  <p className="text-white/90 text-sm font-medium">
                    <strong>Act Now:</strong> Secure your investment with minimal down payment
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm mr-3 ${isUnlocked ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>
                  {isUnlocked ? '📁' : '🔒'}
                </span>
                Downloads
              </h3>
              <div className={`relative p-6 rounded-xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full opacity-20 -mt-8 -mr-8 ${isUnlocked ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
                <div className={`absolute bottom-0 left-0 w-12 h-12 rounded-full opacity-20 -mb-6 -ml-6 ${isUnlocked ? 'bg-blue-700' : 'bg-red-700'}`}></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white text-xs font-medium uppercase tracking-wider">
                        {isUnlocked ? 'AVAILABLE' : 'UNLOCK'}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold animate-pulse ${isUnlocked ? 'bg-green-400 text-blue-800' : 'bg-yellow-400 text-red-800'}`}>
                      {isUnlocked ? 'READY!' : 'LOCKED!'}
                    </div>
                  </div>
                  <p className="text-white font-bold text-base leading-relaxed mb-2">
                    {isUnlocked ? 'Download investor discovery kit' : 'Submit details to unlock kit'}
                  </p>
                  <div className="flex items-center text-blue-100 text-sm">
                    <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    {isUnlocked ? 'Instant download access' : 'Quick form required'}
                  </div>
                  <div className="mt-4">
                    {(() => {
                      const hasUrl = plot?.investorDiscoveryKit?.url;
                      return hasUrl ? (
                        <button
                          onClick={handleInvestorKitClick}
                          className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none bg-white ${isUnlocked ? 'text-blue-600 hover:bg-blue-50' : 'text-orange-600 hover:bg-orange-50'}`}
                        >
                          {isUnlocked ? (
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                            </svg>
                          ) : (
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path>
                            </svg>
                          )}
                          {isUnlocked ? 'Download Kit' : 'Unlock Kit'}
                        </button>
                      ) : (
                        <div className="w-full flex justify-center items-center bg-gray-400 text-gray-200 py-3 px-4 rounded-lg cursor-not-allowed">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                          </svg>
                          Investor Discovery Kit
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_3s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">📋 Contains brochure, payment plan, and promotional materials</p>
            </div>
          </div>
        </div>
      </div>
      
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
        plotName={plot?.project || 'Plot'}
        autoClose={false}
      />
    </div>
  );
}