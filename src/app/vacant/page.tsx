"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import PropertyImage from '@/components/PropertyImage';
import { FaSearch, FaFilter, FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { database, Property, vacantPropertiesRef } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

// Default fallback image
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

// Format currency using Indian format (lakhs, crores)
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '-';
  const numValue = typeof value === 'string' ? Number(value) : value;
  return `₹${numValue.toLocaleString('en-IN')}`;
};

export default function VacantPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Load properties from Firebase
  useEffect(() => {
    // Set up real-time listener
    setIsLoading(true);
    
    // Reference to vacant properties in Realtime Database
    const propertiesRef = vacantPropertiesRef;
    
    // Set up listener for real-time updates
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const propertiesList: Property[] = [];
        snapshot.forEach((childSnapshot) => {
          const property = { 
            id: childSnapshot.key, 
            ...childSnapshot.val() 
          };
          propertiesList.push(property as Property);
        });
        setProperties(propertiesList);
      } else {
        setProperties([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching properties:", error);
      setError('Failed to load properties. Please try again later.');
      setIsLoading(false);
    });
    
    // Clean up the listener on unmount
    return () => {
      // Firebase Realtime DB doesn't need explicit unsubscribe as with Firestore
      // But we'll implement a cleanup pattern for good practice
      setProperties([]);
    };
  }, []);

  // Handle image error
  const handleImageError = (propertyId: string | undefined) => {
    if (propertyId) {
      setImageErrors(prev => ({
        ...prev,
        [propertyId]: true
      }));
    }
  };

  // Get unique categories and cities for filter dropdowns
  const categories = Array.from(new Set(properties.map(p => p.category))).filter(Boolean);
  const cities = Array.from(new Set(properties.map(p => p.city))).filter(Boolean);

  // Filter properties based on search term, category, and city
  const filteredProperties = properties.filter(property => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (property.location?.toLowerCase().includes(searchStr) || '') ||
      (property.category?.toLowerCase().includes(searchStr) || '') ||
      (property.city?.toLowerCase().includes(searchStr) || '');
      
    const matchesCategory = selectedCategory ? property.category === selectedCategory : true;
    const matchesCity = selectedCity ? property.city === selectedCity : true;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-blue-900/50 z-10"></div>
          <div className="absolute inset-0">
            <div className="w-full h-full">
              <Image 
                src="https://images.pexels.com/photos/1105754/pexels-photo-1105754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Vacant Properties"
                fill
                style={{ objectFit: 'cover' }}
                priority
                quality={100}
                className="brightness-75"
              />
            </div>
          </div>
          
          <div className="relative z-20 py-24 md:py-32">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vacant Properties</h1>
                <p className="text-xl text-gray-200 mb-8">
                  Discover available spaces ready for your business or investment
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Properties Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
                  </h2>
                </div>
                
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-20">
                    <FaBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 mb-2">No properties found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map((property) => (
                      <Link href={`/vacant/${property.id}`} key={property.id}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 h-full">
                          <div className="relative">
                            <div className="h-64 relative overflow-hidden">
                              <PropertyImage 
                                src={property.image} 
                                alt={property.location || 'Property'}
                                className="transition-transform duration-700 group-hover:scale-110"
                              />
                              
                              {property.reference === 'Ready to Move-In' && (
                                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                                  Ready
                                </div>
                              )}
                              
                              <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
                                For Rent
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
                              {property.location || 'Vacant Property'}
                            </h3>
                            
                            <div className="bg-blue-50 p-3 rounded-md mb-3">
                              <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">Location Details</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-900 font-medium mr-1">State:</span>
                                  <span className="text-gray-800">{property.state || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-900 font-medium mr-1">City:</span>
                                  <span className="text-gray-800">{property.city || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-900 font-medium mr-1">District:</span>
                                  <span className="text-gray-800">{property.district || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-900 font-medium mr-1">Sub-District:</span>
                                  <span className="text-gray-800">{property.subDistrict || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-yellow-50 p-3 rounded-md mb-3">
                              <h4 className="font-semibold text-yellow-800 mb-2 border-b border-yellow-200 pb-1">Unit Details</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Category:</span>
                                  <span className="text-gray-800">{property.category || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Floor:</span>
                                  <span className="text-gray-800">{property.floor || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Facing:</span>
                                  <span className="text-gray-800">{property.facing || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Property Type:</span>
                                  <span className="text-gray-800">{property.propertyType || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Ref:</span>
                                  <span className="text-gray-800">{property.reference || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-yellow-800 font-medium mr-1">Contact:</span>
                                  <span className="text-gray-800">{property.contactName || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-50 p-3 rounded-md mb-3">
                              <h4 className="font-semibold text-green-800 mb-2 border-b border-green-200 pb-1">Area Details</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center text-sm">
                                  <span className="text-green-800 font-medium mr-1">Super Area:</span>
                                  <span className="text-gray-800">{property.superArea ? `${property.superArea} sq.ft.` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-green-800 font-medium mr-1">Carpet Area:</span>
                                  <span className="text-gray-800">{property.carpetArea ? `${property.carpetArea} sq.ft.` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-green-800 font-medium mr-1">Length:</span>
                                  <span className="text-gray-800">{property.length ? `${property.length} ft` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-green-800 font-medium mr-1">Width:</span>
                                  <span className="text-gray-800">{property.width ? `${property.width} ft` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-green-800 font-medium mr-1">Height:</span>
                                  <span className="text-gray-800">{property.height ? `${property.height} ft` : 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-red-50 p-3 rounded-md">
                              <h4 className="font-semibold text-red-800 mb-2 border-b border-red-200 pb-1">Financial Details</h4>
                              <div className="flex items-center text-lg font-bold">
                                <span className="text-red-800 mr-2">Rent:</span>
                                <span className="text-gray-800">{property.rent ? `${formatCurrency(property.rent)}/month` : 'Not available'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 