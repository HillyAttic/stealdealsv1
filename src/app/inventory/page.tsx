"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

// Property interface reflecting the structure from API
interface Property {
  id: number;
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

const PropertyCard = ({ property }: { property: any }) => {
  // Format price based on what's available (askingPrice, rent, or price)
  const formatPrice = (property: any) => {
    if (property.askingPrice) {
      return `₹${property.askingPrice.toLocaleString('en-IN')}`;
    } else if (property.rent) {
      return `₹${property.rent.toLocaleString('en-IN')}/month`;
    } else if (property.price) {
      return `₹${property.price.toLocaleString('en-IN')}`;
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
          <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer">
            <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" />
          </div>
          <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            {getPropertyType(property)}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
          {getPropertyTitle(property)}
        </h3>
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          {getPropertyLocation(property)}
        </p>
        <p className="text-blue-900 font-bold text-xl mb-4">{formatPrice(property)}</p>
        
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-md">{property.category}</span>
          </div>
          <div className="flex items-center text-sm">
            <FaRulerCombined className="mr-1 text-blue-900" />
            <span>{getPropertyArea(property)}</span>
          </div>
        </div>

        {/* Additional labels for Pre-Leased properties */}
        {property.tenant && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm mb-2">
              <span className="text-blue-900 font-medium mr-1">Tenant:</span>
              <span className="font-semibold">{property.tenant}</span>
            </div>
            
            {property.leaseTerm && (
              <div className="flex items-center text-sm mb-2">
                <span className="text-blue-900 font-medium mr-1">Lease Term:</span>
                <span>{property.leaseTerm}</span>
              </div>
            )}
            
            {property.roi && (
              <div className="flex items-center text-sm">
                <span className="text-blue-900 font-medium mr-1">ROI:</span>
                <span className="font-bold text-green-600">{property.roi}%</span>
              </div>
            )}
            
            {(property.propertyType === 'Pre-Leased' || property.tenant) && (
              <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Pre-Leased Property
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreLeased, setShowPreLeased] = useState(true); // Show Pre-Leased properties by default

  // Fetch properties from API - handle both Firebase and local data structures
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // Build URL with query parameters
        const queryParams = new URLSearchParams();
        if (selectedCategory) {
          queryParams.append('category', selectedCategory);
        }
        
        const url = `/api/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        console.log('Fetching from:', url);
        
        // Add retry logic for better reliability
        let retries = 3;
        let response;
        
        while (retries > 0) {
          try {
            response = await fetch(url);
            
            // If successful, break out of retry loop
            if (response.status !== 401) break;
            
            // If unauthorized but we have retries left, try again
            console.log(`Authentication error (${retries} retries left), retrying...`);
            retries--;
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (err) {
            console.error('Fetch attempt failed:', err);
            retries--;
            if (retries === 0) throw err;
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // If we don't have a response by now, throw an error
        if (!response) {
          throw new Error('Failed to connect to the server');
        }
        
        if (!response.ok) {
          // For 401 errors, handle them specially
          if (response.status === 401) {
            console.error('Authentication error, using sample data instead');
            setProperties(sampleProperties.map(p => ({ 
              id: p.id, 
              category: p.category, 
              location: p.location,
              title: p.title,
              price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^\d]/g, '')) : undefined,
              propertyType: p.type
            })));
            return;
          }
          
          console.error('API Error:', response.status, response.statusText);
          throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received properties data:', data);
        
        // Apply filters
        let filteredProperties = data.properties || [];
        
        // Filter Pre-Leased properties if toggle is enabled
        if (showPreLeased) {
          // Include properties with Pre-Leased in propertyType OR properties with tenant field
          filteredProperties = filteredProperties.filter((property: any) => {
            const isPreLeased = 
              (property.propertyType === 'Pre-Leased') || 
              (property.tenant && property.tenant.trim() !== '');
            
            return isPreLeased;
          });
        }
        
        // Further filter by search term if present
        if (searchTerm) {
          filteredProperties = filteredProperties.filter((property: any) => {
            const propertyTitle = getPropertyTitle(property).toLowerCase();
            const propertyLocation = property.location.toLowerCase();
            const propertyCategory = property.category.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            return (
              propertyTitle.includes(searchLower) || 
              propertyLocation.includes(searchLower) || 
              propertyCategory.includes(searchLower) ||
              (property.tenant && property.tenant.toLowerCase().includes(searchLower))
            );
          });
        }
        
        console.log('Filtered properties count:', filteredProperties.length);
        
        // Map properties to a standard format that works with the PropertyCard component
        const formattedProperties = filteredProperties.map((property: any) => {
          // For properties from Firebase, ensure we have a numeric ID
          const id = typeof property.id === 'string' ? parseInt(property.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000) : property.id;
          
          return {
            ...property,
            id
          };
        });
        
        setProperties(formattedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again later.');
        // Use sample data as fallback by converting to match Property interface
        setProperties(sampleProperties.map(p => ({ 
          id: p.id, 
          category: p.category, 
          location: p.location,
          title: p.title,
          price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^\d]/g, '')) : undefined,
          propertyType: p.type
        })));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [selectedCategory, searchTerm, showPreLeased]);

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
              
              {/* Pre-Leased Toggle Switch */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-800">Pre-Leased Only</span>
                <button 
                  onClick={() => setShowPreLeased(!showPreLeased)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${showPreLeased ? 'bg-blue-900' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPreLeased ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              
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
                <span className="text-blue-900">{properties.length}</span> Properties Available
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
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            )}
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 