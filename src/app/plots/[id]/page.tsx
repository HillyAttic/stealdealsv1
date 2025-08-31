"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import PropertyImage from '@/components/PropertyImage';
import { FaArrowLeft, FaMapMarkerAlt, FaBuilding, FaRulerCombined, FaRupeeSign, FaRegClock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';
import { database, Property } from '@/lib/firebase';
import { ref, get, child } from 'firebase/database';
import { trackPropertyView, trackContactInquiry } from '@/lib/activity-tracker';

// Default fallback image
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

// Format currency using Indian format (lakhs, crores)
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '-';
  const numValue = typeof value === 'string' ? Number(value) : value;
  return `₹${numValue.toLocaleString('en-IN')}`;
};

export default function PlotPropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [viewStartTime] = useState(Date.now());
  
  // Detect property type from ID and redirect if necessary
  useEffect(() => {
    if (!propertyId) {
      setError('Property ID is missing');
      setIsLoading(false);
      return;
    }

    // Check if this is not a plot property ID
    if (propertyId.includes('FRAN')) {
      // Redirect to franchise route
      router.replace(`/franchise/${propertyId}`);
      return;
    }
    
    if (propertyId.includes('VAC')) {
      // Redirect to vacant route
      router.replace(`/vacant/${propertyId}`);
      return;
    }

    // Proceed to load plot property
    loadProperty();
  }, [propertyId, router]);

  const loadProperty = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();
      
      if (response.ok && data.property) {
        setProperty(data.property);
        
        // Track property view
        trackPropertyView(propertyId, {
          source: 'direct_url',
          propertyTitle: data.property.location || data.property.title,
          category: data.property.category,
          location: data.property.location
        });
      } else {
        throw new Error(data.error || 'Property not found');
      }
    } catch (err: any) {
      console.error("Error fetching property:", err);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle contact inquiry tracking
  const handleContactClick = (method: 'email' | 'phone') => {
    if (property) {
      trackContactInquiry(property.id!, {
        method,
        contactName: property.contactName,
        propertyTitle: property.location || property.title,
        source: 'property_details'
      });
    }
  };

  // Track view duration on unmount
  useEffect(() => {
    return () => {
      if (property) {
        const viewDuration = Date.now() - viewStartTime;
        trackPropertyView(property.id!, {
          source: 'direct_url',
          propertyTitle: property.location || property.title,
          category: property.category,
          location: property.location,
          viewDuration
        });
      }
    };
  }, [property, viewStartTime]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          <div className="flex-grow flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
          </div>
          <Footer />
        </ClientOnly>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          <div className="flex-grow flex justify-center items-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The requested property could not be found.'}</p>
              <Link href="/plots" className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
                Back to Plots
              </Link>
            </div>
          </div>
          <Footer />
        </ClientOnly>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Back Navigation */}
        <div className="bg-gray-100 py-4">
          <div className="container mx-auto px-4">
            <Link href="/plots" className="flex items-center text-blue-900 hover:text-blue-700 transition-colors">
              <FaArrowLeft className="mr-2" />
              Back to Plots
            </Link>
          </div>
        </div>

        {/* Property Details */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Image Section */}
              <div className="space-y-6">
                <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                  <PropertyImage
                    src={property.image}
                    alt={property.location || property.title || 'Plot Property'}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                  
                  {/* Wishlist Button */}
                  <div className="absolute top-4 right-4">
                    <WishlistButton
                      propertyId={property.id!}
                      size="lg"
                      onAuthRequired={() => setShowAuthPrompt(true)}
                    />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {property.location || property.title || 'Plot Property'}
                  </h1>
                  
                  <div className="flex items-center text-gray-600 mb-6">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{property.city}, {property.state}</span>
                  </div>

                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700">Price</span>
                      <span className="text-2xl font-bold text-green-700">
                        {formatCurrency(property.price || property.askingPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Location Details */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700">State:</span>
                        <span className="text-gray-800">{property.state || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700">City:</span>
                        <span className="text-gray-800">{property.city || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700">District:</span>
                        <span className="text-gray-800">{property.district || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700">Sub District:</span>
                        <span className="text-gray-800">{property.subDistrict || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 border-b border-green-200 pb-2">
                      Property Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700">Category:</span>
                        <span className="text-gray-800">{property.category || 'Plot'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700">Property Type:</span>
                        <span className="text-gray-800">{property.propertyType || 'Plot'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700">Reference:</span>
                        <span className="text-gray-800">{property.reference || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Area Details */}
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">
                      Area Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700">Super Area:</span>
                        <span className="text-gray-800">{property.superArea ? `${property.superArea} sq.ft.` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700">Carpet Area:</span>
                        <span className="text-gray-800">{property.carpetArea ? `${property.carpetArea} sq.ft.` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700">Length:</span>
                        <span className="text-gray-800">{property.length ? `${property.length} ft` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700">Width:</span>
                        <span className="text-gray-800">{property.width ? `${property.width} ft` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 border-b border-red-200 pb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-red-700">Contact Person:</span>
                        <span className="text-gray-800">{property.contactName || 'Not Available'}</span>
                      </div>
                      
                      {property.email && (
                        <button 
                          onClick={() => {
                            window.location.href = `mailto:${property.email}`;
                            handleContactClick('email');
                          }}
                          className="w-full flex items-center justify-center bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FaEnvelope className="mr-2" />
                          Send Email
                        </button>
                      )}
                      
                      {property.phone && (
                        <button 
                          onClick={() => {
                            window.location.href = `tel:${property.phone}`;
                            handleContactClick('phone');
                          }}
                          className="w-full flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaPhone className="mr-2" />
                          Call Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPrompt
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          title="Sign in to add to wishlist"
          message="Please sign in to add properties to your wishlist and track your favorites."
        />
      )}
    </main>
  );
}