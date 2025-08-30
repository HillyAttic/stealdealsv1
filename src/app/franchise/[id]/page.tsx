"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FaMapMarkerAlt, FaMoneyBillWave, FaChartLine, FaBuilding, FaDollarSign, FaCalendarAlt, FaStoreAlt, FaShoppingBag, FaFileAlt, FaClock, FaGraduationCap, FaHeadset, FaBullhorn, FaCog, FaChevronRight, FaPhone, FaEnvelope, FaGlobe, FaShare, FaTrophy, FaHandshake, FaRocket, FaShieldAlt, FaTimes } from 'react-icons/fa';
import ClientOnly from '../../../components/ClientOnly';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';

// Define the Franchise interface that includes all fields
interface Franchise {
  id?: string | null;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number;
  maxInvestment?: number;
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
  investment: number;
  location: string;
  status: string;
  roi: string;
  description?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function FranchiseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Format the investment amount to show as lakhs or crores
  const formatInvestment = (amount: number | undefined) => {
    if (!amount) return 'Not specified';
    
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  // Check for success message from FormSubmit
  useEffect(() => {
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

  // Fetch franchise details from the API
  useEffect(() => {
    const fetchFranchiseDetails = async () => {
      try {
        setIsLoading(true);
        setError(''); // Clear previous errors
        
        console.log(`[FranchiseDetail] 🔄 Fetching franchise details for ID: ${resolvedParams.id}`);
        
        const response = await fetch(`/api/franchises/${resolvedParams.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Prevent caching issues
        });
        
        console.log(`[FranchiseDetail] 📡 API Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FranchiseDetail] ❌ API Error: ${response.status} - ${errorText}`);
          
          if (response.status === 404) {
            throw new Error(`Franchise with ID "${resolvedParams.id}" not found. Please check the URL and try again.`);
          } else if (response.status === 500) {
            throw new Error('Server error occurred while fetching franchise details. Please try again later.');
          } else {
            throw new Error(`Failed to fetch franchise details (Status: ${response.status})`);
          }
        }
        
        const data = await response.json();
        console.log(`[FranchiseDetail] ✅ Successfully fetched franchise:`, data.franchise?.name || 'Unknown');
        
        if (!data.franchise) {
          throw new Error('Franchise data is missing from server response');
        }
        
        setFranchise(data.franchise);
        setIsLoading(false);
      } catch (err) {
        console.error('[FranchiseDetail] ❌ Error fetching franchise details:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load franchise details';
        setError(errorMessage);
        setIsLoading(false);
      }
    };
    
    if (resolvedParams.id) {
      console.log(`[FranchiseDetail] 🚀 Starting fetch for franchise ID: ${resolvedParams.id}`);
      fetchFranchiseDetails();
    } else {
      console.warn('[FranchiseDetail] ⚠️ No franchise ID provided');
      setError('No franchise ID provided');
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  // Default image if none provided
  const defaultImage = 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-3 text-gray-600">Loading franchise details...</p>
          </div>
        ) : error ? (
          <div className="flex-1 text-center py-20">
            <p className="text-red-600">{error}</p>
            <Link 
              href="/franchise"
              className="mt-4 inline-block px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
            >
              Back to Franchises
            </Link>
          </div>
        ) : franchise ? (
          <div className="flex-1">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">We'll get back to you soon with franchise details for <strong>{franchise.name}</strong>.</p>
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Great, Thanks!
                  </button>
                </div>
              </div>
            )}
            
           {/* Enhanced Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 min-h-[70vh] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              
              {/* Hero Content */}
              <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Breadcrumb */}
                <nav className="mb-8">
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <FaChevronRight className="text-xs" />
                    <Link href="/franchise" className="hover:text-white transition-colors">Franchises</Link>
                    <FaChevronRight className="text-xs" />
                    <span className="text-white">{franchise.name}</span>
                  </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column - Main Info */}
                  <div className="text-white">
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold mr-3 ${
                          franchise.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {franchise.status}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                          {franchise.industry}
                        </span>
                        {franchise.segment && (
                          <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-medium ml-2">
                            {franchise.segment}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight flex-1">
                          {franchise.name}
                        </h1>
                        <div className="ml-4 mt-2">
                          <WishlistButton
                            propertyId={`franchise-${resolvedParams.id}`}
                            size="lg"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                        {franchise.description || franchise.remarks || `Discover the ${franchise.name} franchise opportunity in the ${franchise.industry} industry.`}
                      </p>
                    </div>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <FaCalendarAlt className="text-2xl mb-2 mx-auto text-blue-300" />
                        <div className="text-sm text-blue-200">Established</div>
                        <div className="font-bold">{franchise.establishmentYear || 'N/A'}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <FaStoreAlt className="text-2xl mb-2 mx-auto text-green-300" />
                        <div className="text-sm text-blue-200">Outlets</div>
                        <div className="font-bold">{franchise.numberOutlets || 'N/A'}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <FaMapMarkerAlt className="text-2xl mb-2 mx-auto text-orange-300" />
                        <div className="text-sm text-blue-200">Location</div>
                        <div className="font-bold text-xs">{franchise.location}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <FaChartLine className="text-2xl mb-2 mx-auto text-yellow-300" />
                        <div className="text-sm text-blue-200">ROI</div>
                        <div className="font-bold">{franchise.roi || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => setShowContactModal(true)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <FaRocket className="mr-2" />
                        Request Information
                      </button>
                      <a 
                        href="tel:+919876543210"
                        className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-white/30 flex items-center justify-center"
                      >
                        <FaPhone className="mr-2" />
                        Call Now
                      </a>
                    </div>
                  </div>

                  {/* Right Column - Investment Summary */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <FaMoneyBillWave className="mr-3 text-green-400" />
                      Investment Overview
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-blue-200 text-sm mb-1">Total Investment</div>
                        <div className="text-2xl font-bold text-white">
                          {franchise.minInvestment && franchise.maxInvestment 
                            ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                            : formatInvestment(franchise.investment)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-blue-200 text-sm mb-1">Royalty</div>
                          <div className="text-lg font-bold text-white">
                            {franchise.royalty || 'Contact for details'}
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                          <div className="text-blue-200 text-sm mb-1">Payback</div>
                          <div className="text-lg font-bold text-white">
                            {franchise.minPaybackPeriod && franchise.maxPaybackPeriod
                              ? `${franchise.minPaybackPeriod}-${franchise.maxPaybackPeriod}`
                              : franchise.minPaybackPeriod || franchise.maxPaybackPeriod || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-blue-200 text-sm mb-1">Space Required</div>
                        <div className="text-lg font-bold text-white">
                          {franchise.minArea && franchise.maxArea 
                            ? `${franchise.minArea} - ${franchise.maxArea}` 
                            : franchise.minArea || franchise.maxArea || 'Flexible'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comprehensive Franchise Information Section */}
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">    
              
                  {/* Business Overview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaBuilding className="mr-3" />
                        Business Overview
                      </h2>
                    </div>
                    <div className="p-6">
                      {/* Franchise Image */}
                      <div className="mb-6">
                        <img 
                          src={franchise.image || defaultImage}
                          alt={franchise.name}
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      
                      {/* Product Name Display - Prominent Section */}
                      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-indigo-800 mb-2 flex items-center">
                          <FaShoppingBag className="mr-2 text-indigo-600" />
                          Product/Brand Name
                        </h3>
                        <p className="text-xl font-bold text-gray-900">
                          {franchise.product || franchise.name || 'Product Information Available'}
                        </p>
                        {franchise.segment && (
                          <p className="text-sm text-gray-600 mt-1">
                            Category: {franchise.segment}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                          <FaFileAlt className="mr-2 text-blue-600" />
                          About This Franchise
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {franchise.description || franchise.remarks || `${franchise.name} is a leading franchise opportunity in the ${franchise.industry} sector, offering excellent business potential for entrepreneurs.`}
                        </p>
                      </div>

                      {/* Business Model Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaRocket className="mr-2 text-blue-600" />
                            Business Model
                          </h4>
                          <p className="text-gray-700">{franchise.model || 'Franchise Model'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Product: {franchise.product || franchise.name || 'Product Information Available'}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-green-600" />
                            Target Market
                          </h4>
                          <p className="text-gray-700">{franchise.industry} Industry</p>
                          <p className="text-sm text-gray-600 mt-1">Segment: {franchise.segment || 'General Market'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaMoneyBillWave className="mr-3" />
                        Financial Details
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Investment Breakdown */}
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <FaDollarSign className="mr-2 text-green-600" />
                              Total Investment
                            </h4>
                            <p className="text-2xl font-bold text-green-700">
                              {franchise.minInvestment && franchise.maxInvestment 
                                ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                                : formatInvestment(franchise.investment)}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <FaChartLine className="mr-2 text-blue-600" />
                              ROI Expected
                            </h4>
                            <p className="text-xl font-bold text-blue-700">{franchise.roi || 'Contact for details'}</p>
                          </div>
                        </div>

                        {/* Additional Financial Info */}
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <FaClock className="mr-2 text-orange-600" />
                              Payback Period
                            </h4>
                            <p className="text-lg font-semibold text-orange-700">
                              {franchise.minPaybackPeriod && franchise.maxPaybackPeriod
                                ? `${franchise.minPaybackPeriod} - ${franchise.maxPaybackPeriod}`
                                : franchise.minPaybackPeriod || franchise.maxPaybackPeriod || 'Contact for details'}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <FaHandshake className="mr-2 text-purple-600" />
                              Royalty Fee
                            </h4>
                            <p className="text-lg font-semibold text-purple-700">{franchise.royalty || 'Contact for details'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Requirements Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaCog className="mr-3" />
                        Operational Requirements
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Space Requirements */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaBuilding className="mr-2 text-blue-600" />
                            Space Required
                          </h4>
                          <p className="text-gray-700">
                            {franchise.minArea && franchise.maxArea 
                              ? `${franchise.minArea} - ${franchise.maxArea}` 
                              : franchise.minArea || franchise.maxArea || 'Flexible'}
                          </p>
                        </div>

                        {/* Location */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-green-600" />
                            Headquarters
                          </h4>
                          <p className="text-gray-700">{franchise.headquarter || franchise.location}</p>
                        </div>

                        {/* Outlets */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaStoreAlt className="mr-2 text-purple-600" />
                            Current Outlets
                          </h4>
                          <p className="text-gray-700">{franchise.numberOutlets || 'Contact for details'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
 
                 {/* Company Timeline Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaCalendarAlt className="mr-3" />
                        Company Timeline
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaTrophy className="mr-2 text-indigo-600" />
                            Company Established
                          </h4>
                          <p className="text-xl font-bold text-indigo-700">{franchise.establishmentYear || 'Not specified'}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <FaRocket className="mr-2 text-green-600" />
                            Franchising Started
                          </h4>
                          <p className="text-xl font-bold text-green-700">{franchise.franchiseStartedYear || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support & Training Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaHeadset className="mr-3" />
                        Support & Training
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <FaGraduationCap className="text-purple-600 text-xl mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-800">Initial Training</h4>
                              <p className="text-gray-600">Comprehensive training program for new franchisees</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <FaBullhorn className="text-pink-600 text-xl mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-800">Marketing Support</h4>
                              <p className="text-gray-600">Brand marketing and promotional assistance</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <FaHeadset className="text-blue-600 text-xl mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-800">Ongoing Support</h4>
                              <p className="text-gray-600">Continuous operational and technical support</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <FaShieldAlt className="text-green-600 text-xl mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-800">Quality Assurance</h4>
                              <p className="text-gray-600">Regular quality checks and brand standards</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents & Resources */}
                  {(franchise.brandDeck || franchise.productList || franchise.roiSheet) && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                          <FaFileAlt className="mr-3" />
                          Documents & Resources
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {franchise.brandDeck && (
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200 hover:shadow-md transition-shadow">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <FaFileAlt className="mr-2 text-teal-600" />
                                Brand Deck
                              </h4>
                              <p className="text-gray-700">{franchise.brandDeck}</p>
                            </div>
                          )}
                          
                          {franchise.productList && (
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <FaShoppingBag className="mr-2 text-orange-600" />
                                Product List
                              </h4>
                              <p className="text-gray-700">{franchise.productList}</p>
                            </div>
                          )}
                          
                          {franchise.roiSheet && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <FaChartLine className="mr-2 text-green-600" />
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
                
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-8 sticky top-4">  
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <FaPhone className="mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <FaPhone className="text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Phone</p>
                          <p className="text-gray-600">+91 98765 43210</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Email</p>
                          <p className="text-gray-600">info@franchise.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FaGlobe className="text-purple-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Website</p>
                          <p className="text-gray-600">www.franchise.com</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <a 
                        href="tel:+919876543210"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center"
                      >
                        <FaPhone className="mr-2" />
                        Call Now
                      </a>
                      
                      <button 
                        onClick={() => setShowContactModal(true)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center"
                      >
                        <FaEnvelope className="mr-2" />
                        Request Information
                      </button>
                      
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
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center"
                      >
                        <FaShare className="mr-2" />
                        Share Franchise
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <FaChartLine className="mr-2 text-green-600" />
                      Quick Stats
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-semibold text-gray-800">{franchise.industry}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Investment</span>
                        <span className="font-semibold text-gray-800">
                          {franchise.minInvestment && franchise.maxInvestment 
                            ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                            : formatInvestment(franchise.investment)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">ROI</span>
                        <span className="font-semibold text-gray-800">{franchise.roi || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Outlets</span>
                        <span className="font-semibold text-gray-800">{franchise.numberOutlets || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          franchise.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {franchise.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div id="contact-form" className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                      Interested in {franchise.name}?
                    </h2>
                    <p className="text-xl text-gray-600">
                      Get detailed information and start your franchise journey today
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form 
                      action="https://formsubmit.co/stealdeals.co.in@gmail.com" 
                      method="POST"
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Hidden fields for FormSubmit configuration */}
                      <input type="hidden" name="_subject" value={`Franchise Inquiry - ${franchise.name} (Main Form)`} />
                      <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.href : ''}?success=true`} />
                      <input type="hidden" name="_captcha" value="false" />
                      
                      {/* Franchise Information (hidden but included in email) */}
                      <input type="hidden" name="franchise_name" value={franchise.name} />
                      <input type="hidden" name="franchise_industry" value={franchise.industry} />
                      <input type="hidden" name="franchise_investment" value={
                        franchise.minInvestment && franchise.maxInvestment 
                          ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                          : formatInvestment(franchise.investment)
                      } />
                      <input type="hidden" name="franchise_location" value={franchise.location} />
                      <input type="hidden" name="franchise_roi" value={franchise.roi || 'Not specified'} />
                      <input type="hidden" name="form_type" value="Main Contact Form" />

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Budget
                        </label>
                        <select 
                          name="investment_budget"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select your budget range</option>
                          <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                          <option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                          <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                          <option value="₹50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                          <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about your franchise requirements..."
                        ></textarea>
                      </div>
                      
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Get Franchise Information
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Modal Popup */}
            {showContactModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">
                        Request Information
                      </h3>
                      <button
                        onClick={() => setShowContactModal(false)}
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                      Get detailed information about {franchise.name}
                    </p>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <form 
                      action="https://formsubmit.co/stealdeals.co.in@gmail.com" 
                      method="POST"
                      className="space-y-4"
                    >
                      {/* Hidden fields for FormSubmit configuration */}
                      <input type="hidden" name="_subject" value={`Franchise Inquiry - ${franchise.name}`} />
                      <input type="hidden" name="_next" value={`${window.location.origin}/franchise/${franchise.id || resolvedParams.id}?success=true`} />
                      <input type="hidden" name="_captcha" value="false" />
                      
                      {/* Franchise Information (hidden but included in email) */}
                      <input type="hidden" name="franchise_name" value={franchise.name} />
                      <input type="hidden" name="franchise_industry" value={franchise.industry} />
                      <input type="hidden" name="franchise_investment" value={
                        franchise.minInvestment && franchise.maxInvestment 
                          ? `${formatInvestment(franchise.minInvestment)} - ${formatInvestment(franchise.maxInvestment)}`
                          : formatInvestment(franchise.investment)
                      } />
                      <input type="hidden" name="franchise_location" value={franchise.location} />
                      <input type="hidden" name="franchise_roi" value={franchise.roi || 'Not specified'} />

                      {/* Franchise Name Display (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Franchise Name
                        </label>
                        <input
                          type="text"
                          value={franchise.name}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>

                      {/* User Input Fields */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Budget
                        </label>
                        <select 
                          name="investment_budget"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select your budget range</option>
                          <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                          <option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                          <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                          <option value="₹50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                          <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about your franchise requirements..."
                        ></textarea>
                      </div>
                      
                      {/* Submit Button */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowContactModal(false)}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          Send Request
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 text-center py-20">
            <p className="text-gray-600">Franchise not found.</p>
            <Link 
              href="/franchise"
              className="mt-4 inline-block px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
            >
              Back to Franchises
            </Link>
          </div>
        )}
        
        <Footer />
      </ClientOnly>

      {/* Auth Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in to save franchises"
        message="Sign in to save franchise opportunities to your wishlist and access them anytime."
        feature="wishlist"
      />
    </main>
  );
}