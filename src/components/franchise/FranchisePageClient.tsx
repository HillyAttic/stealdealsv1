"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown, FaBuilding, FaMoneyBillWave, FaUsers, FaHandshake, FaStar, FaBriefcase, FaChartLine } from 'react-icons/fa';
import { FranchiseCard, FranchiseModal, FranchiseContactModal } from '@/components/franchise';
import { ScrollToBottom } from '@/components/ui/ScrollToBottom';

// Franchise interface to match the database
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

interface FranchisePageClientProps {
  franchises: Franchise[];
}

export default function FranchisePageClient({ franchises }: FranchisePageClientProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Check for success message from FormSubmit
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Remove the success parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  // Memoized filter options
  const filterOptions = useMemo(() => {
    const industries = Array.from(new Set(franchises.map(f => f.industry))).filter(Boolean);
    // Only use locations that exist in the database (from both location and headquarter fields)
    const allLocations = Array.from(new Set([
      ...franchises.map(f => f.location).filter(Boolean),
      ...franchises.map(f => f.headquarter).filter(Boolean)
    ])).filter(Boolean).sort();
    
    const segments = Array.from(new Set(franchises.map(f => f.segment))).filter(Boolean);
    const models = Array.from(new Set(franchises.map(f => f.model))).filter(Boolean);

    return { industries, allLocations, segments, models };
  }, [franchises]);

  // Investment range options
  const investmentRanges = [
    { label: 'Less than ₹5 Lakhs', min: 0, max: 500000 },
    { label: '₹5 Lakhs – ₹10 Lakhs', min: 500000, max: 1000000 },
    { label: '₹10 Lakhs – ₹20 Lakhs', min: 1000000, max: 2000000 },
    { label: '₹20 Lakhs – ₹50 Lakhs', min: 2000000, max: 5000000 },
    { label: '₹50 Lakhs – ₹1 Crore', min: 5000000, max: 10000000 },
    { label: '₹1 Crore – ₹2 Crores', min: 10000000, max: 20000000 },
    { label: '₹2 Crores – ₹5 Crores', min: 20000000, max: 50000000 },
    { label: '₹5 Crores – ₹10 Crores', min: 50000000, max: 100000000 },
    { label: 'Above ₹10 Crores', min: 100000000, max: Infinity }
  ];
  
  // Helper function to get investment amount as number with improved parsing
  const getInvestmentAmount = (franchise: Franchise) => {
    const investment = franchise.minInvestment || franchise.investment;
    
    if (typeof investment === 'string') {
      // Handle different string formats
      let cleanStr = investment.toUpperCase().replace(/[^0-9.LAKCRORE]/g, '');
      
      // Extract numeric value
      const numMatch = cleanStr.match(/([0-9.]+)/);
      if (!numMatch) return 0;
      
      let num = parseFloat(numMatch[1]);
      if (isNaN(num)) return 0;
      
      // Check for lakhs/crores indicators in original string
      const originalUpper = investment.toUpperCase();
      if (originalUpper.includes('CRORE') || originalUpper.includes('CR')) {
        return num * 10000000; // Convert crores to rupees
      } else if (originalUpper.includes('LAKH') || originalUpper.includes('LAC') || originalUpper.includes('LK')) {
        return num * 100000; // Convert lakhs to rupees
      } else if (originalUpper.includes('THOUSAND') || originalUpper.includes('K')) {
        return num * 1000; // Convert thousands to rupees
      }
      
      // If no unit specified, assume the number is already in rupees
      return num;
    }
    
    return typeof investment === 'number' ? investment : 0;
  };

  // Memoized filtered franchises
  const filteredFranchises = useMemo(() => {
    return franchises.filter(franchise => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        (franchise.name?.toLowerCase().includes(searchStr) || '') ||
        (franchise.industry?.toLowerCase().includes(searchStr) || '') ||
        (franchise.location?.toLowerCase().includes(searchStr) || '') ||
        (franchise.description?.toLowerCase().includes(searchStr) || '');
        
      const matchesIndustry = selectedIndustry ? franchise.industry === selectedIndustry : true;
      const matchesLocation = selectedLocation ? 
        (franchise.location === selectedLocation || franchise.headquarter === selectedLocation) : true;
      const matchesSegment = selectedSegment ? franchise.segment === selectedSegment : true;
      const matchesModel = selectedModel ? franchise.model === selectedModel : true;
      
      // Investment range filter
      let matchesInvestment = true;
      if (selectedInvestmentRange) {
        const range = investmentRanges.find(r => r.label === selectedInvestmentRange);
        if (range) {
          const franchiseInvestment = getInvestmentAmount(franchise);
          matchesInvestment = franchiseInvestment >= range.min && franchiseInvestment < range.max;
        }
      }
      
      return matchesSearch && matchesIndustry && matchesLocation && matchesSegment && matchesModel && matchesInvestment;
    });
  }, [franchises, searchTerm, selectedIndustry, selectedLocation, selectedSegment, selectedModel, selectedInvestmentRange]);

  // Handle franchise card click to open modal
  const handleFranchiseClick = (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFranchise(null);
  };

  // Open contact modal
  const handleOpenContactModal = (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setIsContactModalOpen(true);
  };

  // Close contact modal
  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setSelectedFranchise(null);
  };

  return (
    <>
      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Franchise Request Sent!</h3>
            <p className="text-gray-600 mb-6">Thank you for your franchise listing request. We'll review it and get back to you soon.</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Great, Thanks!
            </button>
          </div>
        </div>
      )}
      
      {/* Stats Section */}
      <div className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div style={{backgroundColor: '#BBDCE5'}} className="rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600 text-sm sm:text-base">Brand Partners</div>
            </div>
            <div style={{backgroundColor: '#BBDCE5'}} className="rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-gray-600 text-sm sm:text-base">Franchise Outlets</div>
            </div>
            <div style={{backgroundColor: '#BBDCE5'}} className="rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-gray-600 text-sm sm:text-base">Cities Covered</div>
            </div>
            <div style={{backgroundColor: '#BBDCE5'}} className="rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600 text-sm sm:text-base">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Filter Section */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search franchises by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Filter Toggle Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-600" />
                <span className="font-medium text-gray-700">Franchise Filters</span>
                <FaChevronDown className={`text-gray-600 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Active Filters Count */}
              {(selectedIndustry || selectedSegment || selectedModel || selectedInvestmentRange || selectedLocation) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    {[selectedIndustry, selectedSegment, selectedModel, selectedInvestmentRange, selectedLocation].filter(Boolean).length}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFilter className="text-primary" />
                Filter Franchise Opportunities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Category (Industry) Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {filterOptions.industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Segment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                      value={selectedSegment}
                      onChange={(e) => setSelectedSegment(e.target.value)}
                    >
                      <option value="">All Segments</option>
                      {filterOptions.segments.map(segment => (
                        <option key={segment} value={segment}>{segment}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Model Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <option value="">All Models</option>
                      <option value="FOFO">FOFO</option>
                      <option value="COCO">COCO</option>
                      <option value="FOCO">FOCO</option>
                      <option value="Hybrid">Hybrid</option>
                      {filterOptions.models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Investment Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Range</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                      value={selectedInvestmentRange}
                      onChange={(e) => setSelectedInvestmentRange(e.target.value)}
                    >
                      <option value="">All Ranges</option>
                      {investmentRanges.map(range => (
                        <option key={range.label} value={range.label}>{range.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {filterOptions.allLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedIndustry('');
                    setSelectedSegment('');
                    setSelectedModel('');
                    setSelectedInvestmentRange('');
                    setSelectedLocation('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Clear All Filters
                </button>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Showing {filteredFranchises.length} of {franchises.length} franchises</span>
                  {filteredFranchises.length !== franchises.length && (
                    <span className="text-primary font-medium">({franchises.length - filteredFranchises.length} filtered out)</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Franchise Listings */}
      <div id="browse-franchises" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Available Franchise Opportunities
          </h2>
          
          {filteredFranchises.length === 0 ? (
            <div className="text-center py-20">
              <img 
                src="https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="No franchises available" 
                className="w-32 h-32 object-cover rounded-full mx-auto mb-6 opacity-50"
              />
              <p className="text-gray-600 text-lg font-medium mb-2">No franchise opportunities found</p>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Try adjusting your search or filter criteria to find more opportunities.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndustry('');
                  setSelectedSegment('');
                  setSelectedModel('');
                  setSelectedInvestmentRange('');
                  setSelectedLocation('');
                }}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  <span className="text-primary">{filteredFranchises.length}</span> {filteredFranchises.length === 1 ? 'Franchise' : 'Franchises'} Available
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFranchises.map((franchise) => (
                  <div
                    key={franchise.id}
                    onClick={() => handleFranchiseClick(franchise)}
                    className="cursor-pointer"
                  >
                    <FranchiseCard
                      franchise={franchise}
                      onOpenModal={handleFranchiseClick}
                      showWishlist={true}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Contact Form Section */}
      <div id="contact-form" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              List Your Franchise Opportunity
            </h2>
            
            <form 
              action="https://formsubmit.co/stealdeals.co.in@gmail.com" 
              method="POST"
              className="bg-gray-50 p-8 rounded-lg shadow-md"
            >
              {/* Hidden fields for FormSubmit configuration */}
              <input type="hidden" name="_subject" value="New Franchise Listing Request" />
              <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/franchise?success=true`} />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="form_type" value="Franchise Listing Request" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                  <input 
                    type="text" 
                    name="brand_name"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                  <input 
                    type="text" 
                    name="industry"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent" 
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your franchise</label>
                <textarea 
                  name="franchise_description"
                  rows={4} 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Describe your franchise opportunity, investment requirements, etc."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-md transition-colors">
                Submit Franchise
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Franchise Modal */}
      <FranchiseModal
        franchise={selectedFranchise}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOpenContactModal={handleOpenContactModal}
      />
      
      {/* Franchise Contact Modal */}
      <FranchiseContactModal
        franchise={selectedFranchise}
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
      />
      
      {/* Scroll to Bottom Button */}
      <ScrollToBottom showProgress={true} />
    </>
  );
}