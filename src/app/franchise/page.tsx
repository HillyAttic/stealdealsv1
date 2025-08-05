"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown, FaBuilding, FaMoneyBillWave, FaUsers, FaHandshake, FaStar, FaBriefcase, FaChartLine } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';
import Image from 'next/image';

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

const FranchiseCard = ({ franchise }: { franchise: Franchise }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
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
        </div>
      </div>
      
      <div className="p-5">
        {/* Header with badges only (removed title) */}
        <div className="flex justify-end items-start mb-2">
          <div className="flex flex-row flex-wrap gap-1 items-center justify-end">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
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
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          {franchise.headquarter || franchise.location}
        </p>

        {/* Product Display - HIGH PRIORITY */}
        <div className="bg-indigo-100 border-l-4 border-indigo-500 p-3 rounded-md mb-4 shadow-sm">
          <h4 className="text-sm font-bold text-indigo-800 mb-1 uppercase">Product</h4>
          <p className="text-md font-bold text-gray-900">
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
          <div className="bg-blue-50 p-2 rounded-md mb-3">
            <h4 className="text-xs font-medium text-blue-800 mb-1">Area Requirements</h4>
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
                ? `${franchise.minPaybackPeriod}-${franchise.maxPaybackPeriod} months`
                : franchise.minPaybackPeriod || franchise.maxPaybackPeriod || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <Link 
            href={`/franchise/${franchise.id}`} 
            className="w-full flex justify-center items-center bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
          >
            <FaHandshake className="mr-2" />
            Request Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Be a Franchise Partner</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-8">
              Start your business with India's top brands and become a successful entrepreneur
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link 
                href="#browse-franchises" 
                className="bg-white text-blue-900 hover:bg-blue-50 py-3 px-6 rounded-md font-semibold transition-colors"
              >
                Browse Franchises
              </Link>
              <Link 
                href="#contact-form" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-6 rounded-md font-semibold transition-colors"
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
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
                <div className="text-gray-600">Brand Partners</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">10,000+</div>
                <div className="text-gray-600">Franchise Outlets</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">100+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Franchise Listings */}
        <div id="browse-franchises" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Available Franchise Opportunities
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="ml-3 text-gray-600">Loading franchises...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                >
                  Try Again
                </button>
              </div>
            ) : franchises.length === 0 ? (
              <div className="text-center py-20">
                <img 
                  src="https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="No franchises available" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-6 opacity-50"
                />
                <p className="text-gray-600 text-lg font-medium mb-2">No franchise opportunities available at the moment</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Our team is currently preparing exciting franchise opportunities for you. Please check back soon or contact us for early information.</p>
                <Link 
                  href="#contact-form"
                  className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Get Notified About New Franchises
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">
                    <span className="text-blue-900">{franchises.length}</span> {franchises.length === 1 ? 'Franchise' : 'Franchises'} Available
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {franchises.map((franchise) => (
                    <FranchiseCard key={franchise.id} franchise={franchise} />
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <input 
                      type="text" 
                      name="industry"
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your franchise</label>
                  <textarea 
                    name="franchise_description"
                    rows={4} 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your franchise opportunity, investment requirements, etc."
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 px-4 rounded-md transition-colors">
                  Submit Franchise
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 
