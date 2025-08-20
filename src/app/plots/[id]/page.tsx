"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft, FaDownload, FaMapMarkerAlt, FaRulerCombined, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import PropertyImage from '@/components/PropertyImage';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';
import { Plot } from '@/lib/firebase';

export default function PlotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const plotId = params.id as string;

  // Load plot details
  useEffect(() => {
    const loadPlot = async () => {
      if (!plotId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/plots/${plotId}`);
        const data = await response.json();
        
        if (response.ok) {
          setPlot(data.plot);
        } else {
          throw new Error(data.error || 'Failed to load plot details');
        }
      } catch (err: any) {
        console.error("Error fetching plot:", err);
        setError('Plot not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlot();
  }, [plotId]);

  // Format currency using Indian format
  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return '-';
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Get plot size range display
  const getPlotSizeDisplay = () => {
    if (plot?.plotSize?.min && plot?.plotSize?.max) {
      return `${plot.plotSize.min}–${plot.plotSize.max} ${plot.plotSize.unit}`;
    }
    return 'Size not specified';
  };

  // Get investment display
  const getInvestmentDisplay = () => {
    if (plot?.investmentStartsFrom?.amount) {
      return `Investment starts from ${formatCurrency(plot.investmentStartsFrom.amount)} per ${plot.investmentStartsFrom.unit} only`;
    }
    return 'Investment details not available';
  };

  // Navigation functions for image gallery
  const nextImage = () => {
    if (plot?.images && plot.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % plot.images.length);
    }
  };

  const prevImage = () => {
    if (plot?.images && plot.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + plot.images.length) % plot.images.length);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
          </div>
          <Footer />
        </ClientOnly>
      </main>
    );
  }

  if (error || !plot) {
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Plot Not Found</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/plots')}
                className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              >
                Back to Plots
              </button>
            </div>
          </div>
          <Footer />
        </ClientOnly>
      </main>
    );
  }

  const validImages = plot.images?.filter(img => img && img.trim() !== '') || [];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
              onClick={() => router.push('/plots')}
              className="flex items-center text-blue-900 hover:text-blue-700 mb-6"
            >
              <FaArrowLeft className="mr-2" />
              Back to Plots
            </button>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image Gallery */}
              {validImages.length > 0 && (
                <div className="relative">
                  <div className="h-96 md:h-[500px] relative overflow-hidden">
                    <PropertyImage
                      src={validImages[currentImageIndex]}
                      alt={`${plot.project} - Image ${currentImageIndex + 1}`}
                    />
                    
                    {/* Navigation arrows */}
                    {validImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-2 rounded-md text-sm font-medium ${
                        plot.status === 'Ready to Move In' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {plot.status}
                      </span>
                    </div>
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4">
                      <WishlistButton
                        propertyId={plot.id || ''}
                        size="lg"
                        onAuthRequired={() => setShowAuthPrompt(true)}
                      />
                    </div>
                  </div>
                  
                  {/* Image indicators */}
                  {validImages.length > 1 && (
                    <div className="flex justify-center py-4 space-x-2 bg-gray-50">
                      {validImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-4 h-4 rounded-full ${
                            index === currentImageIndex ? 'bg-blue-900' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-8">
                {/* Header Section */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {plot.project}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">
                    {plot.developerName}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Details</h2>
                    
                    {/* Location */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
                      <div className="flex items-center text-gray-800">
                        <FaMapMarkerAlt className="mr-3 text-blue-900 text-lg" />
                        <span className="text-lg">{plot.location}</span>
                      </div>
                    </div>
                    
                    {/* Plot Size */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Plot Size Range</label>
                      <div className="flex items-center text-gray-800">
                        <FaRulerCombined className="mr-3 text-blue-900 text-lg" />
                        <span className="text-lg">{getPlotSizeDisplay()}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {plot.description && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
                        <div 
                          className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: plot.description }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Investment & Downloads */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Investment Details</h2>
                    
                    {/* Investment Information */}
                    <div className="bg-blue-50 p-6 rounded-lg mb-8">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Investment Information</h3>
                      <p className="text-blue-800 text-lg font-medium">
                        {getInvestmentDisplay()}
                      </p>
                    </div>
                    
                    {/* Investor Discovery Kit */}
                    {plot.investorDiscoveryKit?.url && (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Download Materials</h3>
                        <a
                          href={plot.investorDiscoveryKit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
                        >
                          <FaDownload className="mr-3" />
                          Download {plot.investorDiscoveryKit.title}
                        </a>
                        <p className="text-sm text-green-700 mt-3">
                          {plot.investorDiscoveryKit.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Prompt Modal */}
        <AuthPrompt
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          title="Sign in to save plots"
          feature="wishlist"
        />
        
        <Footer />
      </ClientOnly>
    </main>
  );
}