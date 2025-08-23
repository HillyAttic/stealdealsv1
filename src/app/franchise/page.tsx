"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown, FaBuilding, FaMoneyBillWave, FaUsers, FaHandshake, FaStar, FaBriefcase, FaChartLine } from 'react-icons/fa';
import { FranchiseCard, FranchiseModal, FranchiseContactModal } from '@/components/franchise';
import ClientOnly from '../../components/ClientOnly';
import Image from 'next/image';

// Counter for generating consistent IDs
let franchiseIdCounter = 0;

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


export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

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

  // Fetch franchises from the API
  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        // Set loading state initially
        setIsLoading(true);
        
        // Make API call to fetch franchises
        const response = await fetch('/api/franchises');
        if (!response.ok) {
          throw new Error('Failed to fetch franchises');
        }
        
        const data = await response.json();
        setFranchises(data.franchises || []);
        
        // Set loading to false after data is loaded
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching franchises:', err);
        setError('No franchise opportunities available at the moment.');
        setIsLoading(false);
      }
    };
    
    fetchFranchises();
  }, []);

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

  // Get unique industries and locations for filter dropdowns
  const industries = Array.from(new Set(franchises.map(f => f.industry))).filter(Boolean);
  const locations = Array.from(new Set(franchises.map(f => f.location))).filter(Boolean);

  // Filter franchises based on search term, industry, and location
  const filteredFranchises = franchises.filter(franchise => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (franchise.name?.toLowerCase().includes(searchStr) || '') ||
      (franchise.industry?.toLowerCase().includes(searchStr) || '') ||
      (franchise.location?.toLowerCase().includes(searchStr) || '') ||
      (franchise.description?.toLowerCase().includes(searchStr) || '');
      
    const matchesIndustry = selectedIndustry ? franchise.industry === selectedIndustry : true;
    const matchesLocation = selectedLocation ? franchise.location === selectedLocation : true;
    
    return matchesSearch && matchesIndustry && matchesLocation;
  });

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
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
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Be a Franchise Partner</h1>
            <p className="text-primary-100 max-w-2xl mx-auto text-lg mb-8">
              Start your business with India's top brands and become a successful entrepreneur
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link 
                href="#browse-franchises" 
                className="bg-white text-primary hover:bg-gray-50 py-3 px-6 rounded-md font-semibold transition-colors"
              >
                Browse Franchises
              </Link>
              <Link 
                href="#contact-form" 
                className="bg-secondary border-2 border-white text-white hover:bg-accent py-3 px-6 rounded-md font-semibold transition-colors"
              >
                List Your Brand
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-gray-600">Brand Partners</div>
              </div>
              <div className="bg-secondary-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-secondary mb-2">10,000+</div>
                <div className="text-gray-600">Franchise Outlets</div>
              </div>
              <div className="bg-accent-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-accent mb-2">100+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="bg-highlight rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
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
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Franchise Listings */}
        <div id="browse-franchises" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Available Franchise Opportunities
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="ml-3 text-gray-600">Loading franchises...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredFranchises.length === 0 ? (
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
                    setSelectedLocation('');
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  Clear Filters
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
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 
