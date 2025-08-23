'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaMoneyBillWave, FaChartLine, FaBuilding, FaDollarSign, FaCalendarAlt, FaStoreAlt, FaShoppingBag, FaFileAlt, FaClock, FaGraduationCap, FaHeadset, FaBullhorn, FaCog, FaPhone, FaEnvelope, FaGlobe, FaShare, FaTrophy, FaHandshake, FaRocket, FaShieldAlt, FaRulerCombined } from 'react-icons/fa';
import PropertyImage from '@/components/PropertyImage';

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

interface FranchiseModalProps {
  franchise: Franchise | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenContactModal?: (franchise: Franchise) => void;
}

export function FranchiseModal({ franchise, isOpen, onClose, onOpenContactModal }: FranchiseModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when franchise changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [franchise]);

  // Handle escape key press and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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

  // Get area requirements display
  const getAreaDisplay = () => {
    if (franchise.minArea && franchise.maxArea && franchise.minArea !== "NA" && franchise.maxArea !== "NA") {
      return `${franchise.minArea} - ${franchise.maxArea} sq.ft.`;
    }
    if (franchise.minArea && franchise.minArea !== "NA") {
      return `${franchise.minArea} sq.ft.`;
    }
    if (franchise.maxArea && franchise.maxArea !== "NA") {
      return `${franchise.maxArea} sq.ft.`;
    }
    return 'Flexible';
  };

  // Get payback period display
  const getPaybackDisplay = () => {
    if (franchise.minPaybackPeriod && franchise.maxPaybackPeriod) {
      return `${franchise.minPaybackPeriod}-${franchise.maxPaybackPeriod}`;
    }
    return franchise.minPaybackPeriod || franchise.maxPaybackPeriod || 'Contact for details';
  };

  // Default image if none provided
  const defaultImage = 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  // Create images array (for now just single image, can be extended)
  const images = franchise.image ? [franchise.image] : [defaultImage];

  // Navigation functions for image gallery
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1002] md:p-4" style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background: 'rgba(0, 0, 0, 0.3)'
    }}>
      <div className="bg-white/95 backdrop-blur-md md:rounded-lg max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-primary text-white">
          <div>
            <h2 className="text-2xl font-bold">{franchise.name}</h2>
            <p className="text-primary/20 text-sm">{franchise.industry} • {franchise.segment}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary/20 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative">
              <div className="h-96 relative overflow-hidden rounded-lg">
                <PropertyImage
                  src={images[currentImageIndex]}
                  alt={`${franchise.name} - Image ${currentImageIndex + 1}`}
                  className="rounded-lg"
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product/Brand Highlight */}
              <div className="bg-gradient-to-r from-highlight/20 to-accent/10 border-l-4 border-primary p-6 rounded-lg">
                <h3 className="text-xl font-bold text-primary mb-2 flex items-center">
                  <FaShoppingBag className="mr-2" />
                  Product/Brand
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {franchise.product || franchise.name || 'Product Information Available'}
                </p>
                {franchise.segment && (
                  <p className="text-sm text-secondary mt-1">
                    Category: {franchise.segment}
                  </p>
                )}
              </div>

              {/* Business Overview */}
              <div className="bg-white rounded-xl shadow-lg border border-primary/10">
                <div className="bg-primary px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaBuilding className="mr-3" />
                    Business Overview
                  </h3>
                </div>
                <div className="p-6">
                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {franchise.description || franchise.remarks || `${franchise.name} is a leading franchise opportunity in the ${franchise.industry} sector, offering excellent business potential for entrepreneurs.`}
                    </p>
                  </div>

                  {/* Business Model Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaRocket className="mr-2 text-primary" />
                        Business Model
                      </h4>
                      <p className="text-gray-700">{franchise.model || 'Franchise Model'}</p>
                    </div>
                    
                    <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-secondary" />
                        Target Market
                      </h4>
                      <p className="text-gray-700">{franchise.industry} Industry</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white rounded-xl shadow-lg border border-accent/10">
                <div className="bg-accent px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaMoneyBillWave className="mr-3" />
                    Financial Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <FaDollarSign className="mr-2 text-accent" />
                          Total Investment
                        </h4>
                        <p className="text-2xl font-bold text-primary">
                          {getInvestmentDisplay()}
                        </p>
                      </div>
                      
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <FaChartLine className="mr-2 text-primary" />
                          ROI Expected
                        </h4>
                        <p className="text-xl font-bold text-secondary">{franchise.roi || 'Contact for details'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <FaClock className="mr-2 text-secondary" />
                          Payback Period
                        </h4>
                        <p className="text-lg font-semibold text-accent">
                          {getPaybackDisplay()}
                        </p>
                      </div>
                      
                      <div className="bg-highlight/20 p-4 rounded-lg border border-highlight/40">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <FaHandshake className="mr-2 text-primary" />
                          Royalty Fee
                        </h4>
                        <p className="text-lg font-semibold text-primary">{franchise.royalty || 'Contact for details'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Requirements */}
              <div className="bg-white rounded-xl shadow-lg border border-secondary/10">
                <div className="bg-secondary px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaCog className="mr-3" />
                    Operational Requirements
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaRulerCombined className="mr-2 text-primary" />
                        Space Required
                      </h4>
                      <p className="text-gray-700">{getAreaDisplay()}</p>
                    </div>

                    <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-secondary" />
                        Location
                      </h4>
                      <p className="text-gray-700">{franchise.headquarter || franchise.location}</p>
                    </div>

                    <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaStoreAlt className="mr-2 text-accent" />
                        Current Outlets
                      </h4>
                      <p className="text-gray-700">{franchise.numberOutlets || 'Contact for details'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Timeline */}
              <div className="bg-white rounded-xl shadow-lg border border-highlight/20">
                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaCalendarAlt className="mr-3" />
                    Company Timeline
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaTrophy className="mr-2 text-primary" />
                        Company Established
                      </h4>
                      <p className="text-xl font-bold text-secondary">{franchise.establishmentYear || 'Not specified'}</p>
                    </div>
                    
                    <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaRocket className="mr-2 text-accent" />
                        Franchising Started
                      </h4>
                      <p className="text-xl font-bold text-primary">{franchise.franchiseStartedYear || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents & Resources */}
              {(franchise.brandDeck || franchise.productList || franchise.roiSheet) && (
                <div className="bg-white rounded-xl shadow-lg border border-accent/10">
                  <div className="bg-accent px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FaFileAlt className="mr-3" />
                      Documents & Resources
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {franchise.brandDeck && (
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaFileAlt className="mr-2 text-primary" />
                            Brand Deck
                          </h4>
                          <p className="text-gray-700">{franchise.brandDeck}</p>
                        </div>
                      )}
                      
                      {franchise.productList && (
                        <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaShoppingBag className="mr-2 text-secondary" />
                            Product List
                          </h4>
                          <p className="text-gray-700">{franchise.productList}</p>
                        </div>
                      )}
                      
                      {franchise.roiSheet && (
                        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaChartLine className="mr-2 text-accent" />
                            ROI Analysis
                          </h4>
                          <p className="text-gray-700">{franchise.roiSheet}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-4 border border-primary/10">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaPhone className="mr-2 text-primary" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => onOpenContactModal?.(franchise)}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    <FaEnvelope className="mr-2" />
                    Request Information
                  </button>
                  
                  <a 
                    href="tel:+919876543210"
                    className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center"
                  >
                    <FaPhone className="mr-2" />
                    Call Now
                  </a>
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${franchise.name} Franchise Opportunity`,
                          text: `Check out this ${franchise.industry} franchise opportunity: ${franchise.name}`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="w-full bg-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center"
                  >
                    <FaShare className="mr-2" />
                    Share Franchise
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Industry</span>
                      <span className="font-semibold text-primary">{franchise.industry}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Investment</span>
                      <span className="font-semibold text-secondary text-sm">{getInvestmentDisplay()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-semibold text-accent">{franchise.roi || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        franchise.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-highlight/50 text-secondary'
                      }`}>
                        {franchise.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}