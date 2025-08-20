'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaRulerCombined } from 'react-icons/fa';
import PropertyImage from '@/components/PropertyImage';
import { Plot } from '@/lib/firebase';

interface PlotModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlotModal({ plot, isOpen, onClose }: PlotModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
            <div>
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
                  <FaMapMarkerAlt className="mr-2 text-blue-900" />
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
                  <FaRulerCombined className="mr-2 text-blue-900" />
                  <span>{getPlotSizeDisplay()}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Investment & Downloads */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Investment Details</h3>
              
              {/* Investment */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-900 font-semibold">
                  {getInvestmentDisplay()}
                </p>
              </div>

              {/* Investor Discovery Kit */}
              {plot.investorDiscoveryKit?.url && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Downloads</h4>
                  <a
                    href={plot.investorDiscoveryKit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaDownload className="mr-2" />
                    Download {plot.investorDiscoveryKit.title}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    {plot.investorDiscoveryKit.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {plot.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
              <div 
                className="prose prose-blue max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: plot.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}