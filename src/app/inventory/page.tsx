"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';
import { ScrollToBottom } from '@/components/ui/ScrollToBottom';
import ClientOnly from '../../components/ClientOnly';
import { getPreleasedProperties } from '@/lib/firebase';

// Property interface reflecting the structure from API
interface Property {
  id: string | number;
  originalId?: string | number;
  title?: string;
  tenant?: string;
  category: string;
  price?: number;
  buildingName?: string;
  location: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  area?: number;
  totalArea?: string;
  areaOnSale?: string;
  description?: string;
  featured?: boolean;
  propertyStatus?: string;
  leaseTerm?: string;
  remainingLease?: string;
  lockIn?: string;
  escalation?: string;
  rentalType?: string;
  rent?: number;
  askingPrice?: number;
  securityDeposit?: string;
  roi?: string;
  advance?: string;
  reference?: string;
  channel?: string;
  propertyType?: string;
}

// Helper function for getting property title from various property fields
const getPropertyTitle = (property: any) => {
  if (property.title) {
    return property.title;
  } else if (property.tenant && property.buildingName) {
    return `${property.tenant} - ${property.buildingName}`;
  } else if (property.tenant) {
    return `${property.tenant} Property`;
  } else if (property.buildingName) {
    return property.buildingName;
  } else {
    return `${property.category} Property`;
  }
};

// Sample property data as fallback
const sampleProperties = [
  {
    id: 1,
    title: 'Modern Commercial Space',
    price: '₹1,25,00,000',
    location: 'Mumbai, Maharashtra',
    beds: 0,
    baths: 2,
    area: '1,500 sq ft',
    type: 'For Sale',
    isNew: true,
    category: 'Commercial',
    image: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  // ... existing sample properties
];

const PropertyCard = ({ property, onAuthRequired }: { property: any; onAuthRequired?: () => void }) => {
  // Helper function to format numbers in Indian number system
  const formatToIndianSystem = (num: number) => {
    const result = num.toString().split('.');
    let lastThree = result[0].substring(result[0].length - 3);
    const otherNumbers = result[0].substring(0, result[0].length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    if (result.length > 1) {
      formatted += '.' + result[1];
    }
    return formatted;
  };

  // Format price based on what's available (askingPrice, rent, or price)
  const formatPrice = (property: any) => {
    if (property.askingPrice) {
      return `₹${formatToIndianSystem(property.askingPrice)}`;
    } else if (property.rent) {
      return `₹${formatToIndianSystem(property.rent)}/month`;
    } else if (property.price) {
      return `₹${formatToIndianSystem(property.price)}`;
    } else {
      return 'Price on Request';
    }
  };

  // Get property area based on what's available
  const getPropertyArea = (property: any) => {
    if (property.area) {
      return `${property.area} sq ft`;
    } else if (property.totalArea) {
      return property.totalArea;
    } else {
      return 'Area not specified';
    }
  };

  // Get property location based on what's available
  const getPropertyLocation = (property: any) => {
    if (property.location && property.district) {
      return `${property.location}, ${property.district}`;
    } else {
      return property.location;
    }
  };

  // Get default image based on category
  const getDefaultImage = (category: string) => {
    const categoryImages: {[key: string]: string} = {
      'Bank': 'https://images.pexels.com/photos/259098/pexels-photo-259098.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Retail Space': 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Office Space': 'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Industrial': 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Warehouse': 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'F&B Brand': 'https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Petrol Pump': 'https://images.pexels.com/photos/5089152/pexels-photo-5089152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    return categoryImages[category] || 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  };

  // Get property type (For Sale/For Rent) based on available fields
  const getPropertyType = (property: any) => {
    if (property.propertyType === 'Pre-Leased') {
      return 'Pre-Leased';
    } else if (property.propertyType) {
      return property.propertyType;
    } else if (property.type) {
      return property.type;
    } else if (property.rent) {
      return 'For Rent';
    } else {
      return 'For Sale';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="h-64 relative overflow-hidden">
          <img 
            src={property.image || getDefaultImage(property.category)} 
            alt={getPropertyTitle(property)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {property.propertyStatus === 'Ready to Move-In' && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              Ready
            </div>
          )}
          <div className="absolute top-4 right-4">
            <WishlistButton
              propertyId={property.id?.toString() || property.originalId?.toString() || ''}
              size="md"
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            {getPropertyType(property)}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 transition-colors hover:text-blue-600">
          {getPropertyTitle(property)}
        </h3>
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2" style={{ color: 'rgb(28, 110, 164)' }} />
          {property.location}{property.district ? `, ${property.district}` : ''}
        </p>
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-gray-600 text-sm mb-1">Investment Amount</p>
          <p className="font-bold text-xl" style={{ color: 'rgb(28, 110, 164)' }}>
            {property.askingPrice ? formatPrice({ askingPrice: property.askingPrice }) : formatPrice(property)}
          </p>
        </div>
        
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center text-sm">
            <span className="px-2 py-1 bg-blue-100 rounded-md" style={{ color: 'rgb(28, 110, 164)' }}>{property.category}</span>
          </div>
          <div className="flex items-center text-sm">
            <FaRulerCombined className="mr-1" style={{ color: 'rgb(28, 110, 164)' }} />
            <span>{property.totalArea ? 
              ((/sq\.?ft\.?/i).test(property.totalArea) ? property.totalArea : `${property.totalArea} SQ.FT.`) 
              : ''}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="font-semibold mb-2" style={{ color: 'rgb(28, 110, 164)' }}>Financial Highlights</p>
          <div className="grid grid-cols-1 gap-2">
            {property.rent && (
              <div className="flex items-center p-2 bg-green-50 border border-green-100 rounded-md">
                <div>
                  <p className="text-gray-600 text-xs">Monthly Rental</p>
                  <p className="font-bold text-green-700 text-lg">{formatPrice({ rent: property.rent })}</p>
                </div>
              </div>
            )}
            
            {property.roi && (
              <div className="flex items-center p-2 bg-amber-50 border border-amber-100 rounded-md">
                <div>
                  <p className="text-gray-600 text-xs">Return on Investment</p>
                  <p className="font-bold text-amber-600 text-lg">{property.roi}% <span className="text-xs font-normal">per annum</span></p>
                </div>
              </div>
            )}
          </div>

          <p className="font-semibold mt-4 mb-2" style={{ color: 'rgb(28, 110, 164)' }}>Property Details</p>
          <div className="flex items-center text-sm mb-2">
            <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Tenant:</span>
            <span className="font-semibold text-gray-800">{property.tenant || ''}</span>
          </div>
          
          {property.leaseTerm && (
            <div className="flex items-center text-sm mb-2">
              <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Lease Term:</span>
              <span className="text-gray-800">{property.leaseTerm}</span>
            </div>
          )}
          
          {property.floor && (
            <div className="flex items-center text-sm mb-2">
              <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Floor:</span>
              <span className="text-gray-800">{property.floor}</span>
            </div>
          )}
          
          {property.areaOnSale && (
            <div className="flex items-center text-sm mb-2">
              <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Area on Sale:</span>
              <span className="text-gray-800">
                {(/sq\.?ft\.?/i).test(property.areaOnSale) ? property.areaOnSale : `${property.areaOnSale} SQ.FT.`}
              </span>
            </div>
          )}
          
          {property.propertyStatus && (
            <div className="flex items-center text-sm mb-2">
              <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Status:</span>
              <span className="text-gray-800">{property.propertyStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch preleased properties from Firebase
  useEffect(() => {
    const loadPreleasedProperties = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch preleased properties from Firebase
        const firebaseProperties = await getPreleasedProperties();
        
        // Apply filters
        let filteredProperties = firebaseProperties;
        
        // Filter by category if selected
        if (selectedCategory) {
          filteredProperties = filteredProperties.filter(p => 
            p.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        // Filter by search term if present
        if (searchTerm) {
          filteredProperties = filteredProperties.filter((property: any) => {
            const propertyTitle = (property.title || getPropertyTitle(property)).toLowerCase();
            const propertyLocation = property.location?.toLowerCase() || '';
            const propertyCategory = property.category?.toLowerCase() || '';
            const propertyTenant = property.tenant?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            return (
              propertyTitle.includes(searchLower) || 
              propertyLocation.includes(searchLower) || 
              propertyCategory.includes(searchLower) ||
              propertyTenant.includes(searchLower)
            );
          });
        }
        
        setProperties(filteredProperties);
      } catch (err) {
        console.error('Error fetching preleased properties:', err);
        setError('Failed to load properties. Please try again later.');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreleasedProperties();
  }, [selectedCategory, searchTerm]);

  // Get all unique categories from properties
  const categories = [...new Set(properties.map(p => p.category))];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Preleased Inventory</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Explore our exclusive selection of preleased commercial properties for investment
            </p>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <button 
                className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-md w-full md:w-auto"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FaFilter className="mr-2 text-gray-800" />
                <span className="text-gray-800">Filters</span>
                <FaChevronDown className={`ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''} text-gray-800`} />
              </button>
              
              {/* Property Type Selector */}
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Property Types</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
              
              {/* Removed Pre-Leased Toggle as it's always showing Pre-Leased properties */}
              
              {/* Price Range Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="">Any Price Range</option>
                  <option value="0-5000000">Up to ₹50 Lakhs</option>
                  <option value="5000000-10000000">₹50 Lakhs - ₹1 Crore</option>
                  <option value="10000000-20000000">₹1 Crore - ₹2 Crore</option>
                  <option value="20000000+">Above ₹2 Crore</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
            </div>
            
            {/* Advanced Filters - Shown when expanded */}
            {filterOpen && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any Size (sq ft)</option>
                    <option value="0-500">Up to 500 sq ft</option>
                    <option value="500-1000">500 - 1000 sq ft</option>
                    <option value="1000-2000">1000 - 2000 sq ft</option>
                    <option value="2000+">Above 2000 sq ft</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any Location</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">For Sale / Rent</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Property Listings */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                <span style={{ color: 'rgb(28, 110, 164)' }}>{properties.length}</span> Properties Available
              </h2>
              
              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none text-gray-800">
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size-asc">Size: Small to Large</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                {error}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl text-gray-600">No properties found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onAuthRequired={() => setShowAuthPrompt(true)}
                />
              ))}
            </div>
            )}
          </div>
        </section>
        
        <Footer />

        {/* Auth Prompt Modal */}
        <AuthPrompt
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          title="Sign in to save properties"
          feature="wishlist"
        />
        
        {/* Scroll to Bottom Button */}
        <ScrollToBottom showProgress={true} />
      </ClientOnly>
    </main>
  );
} 