"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PropertyCard } from '@/components/property';
import { VacantModal } from '@/components/vacant';
import { ScrollToBottom } from '@/components/ui/ScrollToBottom';
import { FaSearch, FaFilter, FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaChevronDown, FaChevronUp, FaSort, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { Property } from '@/lib/firebase';
import { trackSearch } from '@/lib/activity-tracker';

interface VacantPropertiesClientProps {
  properties: Property[];
}

export default function VacantPropertiesClient({ properties }: VacantPropertiesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized filter options to prevent recalculation on each render
  const filterOptions = useMemo(() => ({
    categories: Array.from(new Set(properties.map(p => p.category))).filter(Boolean),
    cities: Array.from(new Set(properties.map(p => p.city))).filter(Boolean),
    propertyTypes: Array.from(new Set(properties.map(p => p.propertyType))).filter(Boolean),
  }), [properties]);

  // Helper function to extract numeric value from price/area strings
  const extractNumber = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numStr = value.toString().replace(/[^0-9.]/g, '');
    return parseFloat(numStr) || 0;
  };

  // Memoized filtered and sorted properties
  const filteredAndSortedProperties = useMemo(() => {
    // Filter properties
    const filtered = properties.filter(property => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        (property.location?.toLowerCase().includes(searchStr) || '') ||
        (property.category?.toLowerCase().includes(searchStr) || '') ||
        (property.city?.toLowerCase().includes(searchStr) || '') ||
        (property.contactName?.toLowerCase().includes(searchStr) || '') ||
        (property.propertyType?.toLowerCase().includes(searchStr) || '');
        
      const matchesCategory = selectedCategory ? property.category === selectedCategory : true;
      const matchesCity = selectedCity ? property.city === selectedCity : true;
      const matchesPropertyType = selectedPropertyType ? property.propertyType === selectedPropertyType : true;
      
      // Price filtering
      const propertyPrice = extractNumber(property.rent || property.price);
      const minPriceNum = minPrice ? extractNumber(minPrice) : 0;
      const maxPriceNum = maxPrice ? extractNumber(maxPrice) : Infinity;
      const matchesPrice = propertyPrice >= minPriceNum && propertyPrice <= maxPriceNum;
      
      // Area filtering
      const propertyArea = extractNumber(property.superArea || property.carpetArea);
      const minAreaNum = minArea ? extractNumber(minArea) : 0;
      const maxAreaNum = maxArea ? extractNumber(maxArea) : Infinity;
      const matchesArea = propertyArea >= minAreaNum && propertyArea <= maxAreaNum;
      
      return matchesSearch && matchesCategory && matchesCity && matchesPropertyType && matchesPrice && matchesArea;
    });

    // Sort filtered properties
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return extractNumber(a.rent || a.price) - extractNumber(b.rent || b.price);
        case 'price-high':
          return extractNumber(b.rent || b.price) - extractNumber(a.rent || a.price);
        case 'area-low':
          return extractNumber(a.superArea || a.carpetArea) - extractNumber(b.superArea || b.carpetArea);
        case 'area-high':
          return extractNumber(b.superArea || b.carpetArea) - extractNumber(a.superArea || a.carpetArea);
        case 'name':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });
  }, [properties, searchTerm, selectedCategory, selectedCity, selectedPropertyType, minPrice, maxPrice, minArea, maxArea, sortBy]);

  // Track search activity with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout to track search after user stops typing
    const timeout = setTimeout(() => {
      if (value.trim()) {
        trackSearch(value, {
          category: selectedCategory,
          city: selectedCity,
          propertyType: selectedPropertyType || 'Vacant',
          priceRange: minPrice || maxPrice ? `${minPrice}-${maxPrice}` : undefined,
          areaRange: minArea || maxArea ? `${minArea}-${maxArea}` : undefined,
          sortBy
        }, filteredAndSortedProperties.length);
      }
    }, 1000);
    
    setSearchTimeout(timeout);
  };

  // Track filter changes
  const trackFilterChange = () => {
    if (searchTerm.trim() || selectedCategory || selectedCity || selectedPropertyType || minPrice || maxPrice || minArea || maxArea) {
      trackSearch(searchTerm, {
        category: selectedCategory,
        city: selectedCity,
        propertyType: selectedPropertyType || 'Vacant',
        priceRange: minPrice || maxPrice ? `${minPrice}-${maxPrice}` : undefined,
        areaRange: minArea || maxArea ? `${minArea}-${maxArea}` : undefined,
        sortBy
      }, filteredAndSortedProperties.length);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setSortBy('default');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCity || selectedPropertyType || minPrice || maxPrice || minArea || maxArea || sortBy !== 'default';

  // Handle property card click to open modal
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <>
      {/* Filter Section */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          {/* Main Filter Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search properties by location, category, contact..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
              <div className="relative w-full sm:w-48">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); trackFilterChange(); }}
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((category, index) => (
                    <option key={`category-${category}-${index}`} value={category}>{category}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); trackFilterChange(); }}
                >
                  <option value="">All Cities</option>
                  {filterOptions.cities.map((city, index) => (
                    <option key={`city-${city}-${index}`} value={city}>{city}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); trackFilterChange(); }}
                >
                  <option value="default">Sort By</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="area-low">Area: Small to Large</option>
                  <option value="area-high">Area: Large to Small</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FaFilter className="text-gray-500" />
              Advanced Filters
              {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
              <span className="text-sm text-gray-600">
                {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? 'property' : 'properties'} found
              </span>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-6 p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    value={selectedPropertyType}
                    onChange={(e) => { setSelectedPropertyType(e.target.value); trackFilterChange(); }}
                  >
                    <option value="">All Types</option>
                    {filterOptions.propertyTypes.map((type, index) => (
                      <option key={`type-${type}-${index}`} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                </div>
                
                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Range (sq ft)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMinPrice('0');
                        setMaxPrice('50000');
                      }}
                      className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Budget Friendly (₹0-50k)
                    </button>
                    <button
                      onClick={() => {
                        setMinArea('1000');
                        setMaxArea('5000');
                      }}
                      className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Medium Size (1k-5k sq ft)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Properties Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? 'Property' : 'Properties'} Available
              </h2>
              
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      City: {selectedCity}
                    </span>
                  )}
                  {selectedPropertyType && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Type: {selectedPropertyType}
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                    </span>
                  )}
                  {(minArea || maxArea) && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      Area: {minArea || '0'} - {maxArea || '∞'} sq ft
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {filteredAndSortedProperties.length === 0 ? (
            <div className="text-center py-20">
              <FaBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSortedProperties.map((property, index) => (
                <PropertyCard
                  key={property.id ? `property-${property.id}` : `property-index-${index}`}
                  property={property}
                  linkPath={null}
                  showWishlist={true}
                  onClick={() => handlePropertyClick(property)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Vacant Property Modal */}
      <VacantModal
        vacant={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      
      {/* Scroll to Bottom Button */}
      <ScrollToBottom showProgress={true} />
    </>
  );
}