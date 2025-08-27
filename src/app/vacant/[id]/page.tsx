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
import { database, Property, vacantPropertiesRef } from '@/lib/firebase';
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

export default function VacantPropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [viewStartTime] = useState(Date.now());
  
  // Load property data
  useEffect(() => {
    if (!propertyId) {
      setError('Property ID is missing');
      setIsLoading(false);
      return;
    }
    
    const fetchProperty = async () => {
      try {
        // Try to get from vacant properties first
        let propertyRef = child(vacantPropertiesRef, propertyId);
        let snapshot = await get(propertyRef);
        
        // If not found, try legacy properties storage
        if (!snapshot.exists()) {
          propertyRef = ref(database, `properties/${propertyId}`);
          snapshot = await get(propertyRef);
        }
        
        if (snapshot.exists()) {
          const propertyData = snapshot.val();
          // Verify this is a vacant property
          if (propertyData.propertyType === 'Vacant') {
            const propertyWithId = { 
              id: snapshot.key, 
              ...propertyData 
            };
            setProperty(propertyWithId);
            
            // Track property view automatically
            trackPropertyView(propertyId, {
              source: getTrafficSource(),
              propertyType: propertyData.propertyType,
              category: propertyData.category,
              location: propertyData.location
            });
          } else {
            setError('Property not found');
          }
        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        console.error('Error loading property:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperty();
  }, [propertyId]);

  // Get traffic source from referrer
  const getTrafficSource = (): string => {
    if (typeof window === 'undefined') return 'direct';

    const referrer = document.referrer;
    if (!referrer) return 'direct';

    try {
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);

      // Same domain = internal navigation
      if (referrerUrl.hostname === currentUrl.hostname) {
        // Check if coming from search page
        if (referrer.includes('/search') || referrer.includes('?search')) {
          return 'search';
        }
        // Check if coming from wishlist
        if (referrer.includes('/wishlist')) {
          return 'wishlist';
        }
        return 'internal';
      }

      // External referrer
      if (referrerUrl.hostname.includes('google')) return 'google';
      if (referrerUrl.hostname.includes('facebook')) return 'facebook';
      if (referrerUrl.hostname.includes('twitter')) return 'twitter';
      
      return 'external';
    } catch {
      return 'direct';
    }
  };

  // Track contact inquiry
  const handleContactClick = () => {
    trackContactInquiry(propertyId, {
      contactType: 'email',
      propertyTitle: property?.location || 'Unknown Property'
    });
  };

  const handlePhoneClick = () => {
    trackContactInquiry(propertyId, {
      contactType: 'phone',
      propertyTitle: property?.location || 'Unknown Property'
    });
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Track page exit with duration
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (property) {
        const duration = Date.now() - viewStartTime;
        trackPropertyView(propertyId, {
          source: getTrafficSource(),
          duration,
          propertyType: property.propertyType,
          category: property.category,
          location: property.location,
          exitTracking: true
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [property, propertyId, viewStartTime]);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => router.push('/vacant')}
              className="flex items-center transition-colors mb-8"
             style={{ color: 'rgb(28, 110, 164)' }}
             onMouseEnter={(e) => {
               e.currentTarget.style.color = 'rgb(21, 77, 113)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.color = 'rgb(28, 110, 164)';
             }}
            >
              <FaArrowLeft className="mr-2" />
              Back to Vacant Properties
            </button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-6 mb-6 text-center">
                <h2 className="text-xl font-bold mb-2">{error}</h2>
                <p>The property you're looking for might have been removed or doesn't exist.</p>
                <Link href="/vacant" className="mt-4 inline-block px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors">
                  View All Vacant Properties
                </Link>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
              </div>
            ) : property ? (
              <div>
                <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
                  {/* Property header */}
                  <div className="relative h-72 md:h-96">
                    <PropertyImage
                      src={property.image}
                      alt={property.location || 'Property'} 
                      className="brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <WishlistButton
                        propertyId={propertyId}
                        size="lg"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="inline-block bg-blue-900 text-white py-1 px-3 text-sm font-medium rounded mb-3">
                        {property.category}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.location}</h1>
                      <div className="flex items-center text-gray-200">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{property.city}, {property.state}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Property details */}
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-gray-500 text-sm uppercase mb-2">Floor</h3>
                        <div className="flex items-center">
                          <FaBuilding className="mr-2 text-xl" style={{ color: 'rgb(28, 110, 164)' }} />
                          <span className="text-lg font-semibold">{property.floor}</span>
                        </div>
                      </div>
                      
                      {property.superArea && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-gray-500 text-sm uppercase mb-2">Super Area</h3>
                          <div className="flex items-center">
                            <FaRulerCombined className="mr-2 text-xl" style={{ color: 'rgb(28, 110, 164)' }} />
                            <span className="text-lg font-semibold">{property.superArea} Sq.Ft</span>
                          </div>
                        </div>
                      )}
                      
                      {property.carpetArea && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-gray-500 text-sm uppercase mb-2">Carpet Area</h3>
                          <div className="flex items-center">
                            <FaRulerCombined className="mr-2 text-xl" style={{ color: 'rgb(28, 110, 164)' }} />
                            <span className="text-lg font-semibold">{property.carpetArea} Sq.Ft</span>
                          </div>
                        </div>
                      )}
                      
                      {property.rent && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-gray-500 text-sm uppercase mb-2">Rent</h3>
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-2 text-xl" style={{ color: 'rgb(28, 110, 164)' }} />
                            <span className="text-lg font-semibold">{formatCurrency(property.rent)}/month</span>
                          </div>
                        </div>
                      )}
                      
                      {property.facing && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-gray-500 text-sm uppercase mb-2">Facing</h3>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">{property.facing}</span>
                          </div>
                        </div>
                      )}
                      
                      {property.propertyType && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-gray-500 text-sm uppercase mb-2">Property Type</h3>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">{property.propertyType}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional details */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                      <h2 className="text-2xl font-bold mb-6">Property Details</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {property.district && (
                          <div>
                            <h3 className="text-gray-500 mb-1">District</h3>
                            <p className="font-medium">{property.district}</p>
                          </div>
                        )}
                        
                        {property.subDistrict && (
                          <div>
                            <h3 className="text-gray-500 mb-1">Sub-District</h3>
                            <p className="font-medium">{property.subDistrict}</p>
                          </div>
                        )}
                        
                        {property.length && (
                          <div>
                            <h3 className="text-gray-500 mb-1">Length</h3>
                            <p className="font-medium">{property.length}</p>
                          </div>
                        )}
                        
                        {property.width && (
                          <div>
                            <h3 className="text-gray-500 mb-1">Width</h3>
                            <p className="font-medium">{property.width}</p>
                          </div>
                        )}
                        
                        {property.height && (
                          <div>
                            <h3 className="text-gray-500 mb-1">Height</h3>
                            <p className="font-medium">{property.height}</p>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact box */}
                <div className="bg-blue-900 text-white rounded-lg overflow-hidden shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-4">Interested in this property?</h2>
                  <p className="mb-6">Contact us today to schedule a viewing or learn more about this vacant property.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link 
                      href="/contact" 
                      onClick={handleContactClick}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 transition-colors py-3 px-6 rounded-md font-medium"
                     style={{ color: 'rgb(28, 110, 164)' }}
                    >
                      <FaEnvelope />
                      Contact Us
                    </Link>
                    <Link 
                      href="tel:+919999999999" 
                      onClick={handlePhoneClick}
                      className="flex items-center justify-center gap-2 border border-white text-white hover:bg-white/10 transition-colors py-3 px-6 rounded-md font-medium"
                    >
                      <FaPhone />
                      Call Now
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 