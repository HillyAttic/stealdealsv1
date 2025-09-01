"use client";

import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaHome, FaBuilding, FaDollarSign, FaArrowRight, FaListUl } from 'react-icons/fa';
import Link from 'next/link';
// import { useActivity } from '@/hooks/useActivity';

const Hero = () => {
  const [searchType, setSearchType] = useState('buy');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  // const { logSearch } = useActivity();

  // Handle search functionality
  const handleSearch = async () => {
    // Create search query
    const searchQuery = [location, propertyType, priceRange].filter(Boolean).join(' ');
    
    if (!searchQuery.trim()) {
      // If no search criteria, still log the search attempt
      // Removed activity logging since we're removing the activity context
      // await logSearch('empty search', {
      //   searchType,
      //   source: 'hero_search',
      //   timestamp: new Date().toISOString()
      // });
      return;
    }

    // Log the search activity
    // Removed activity logging since we're removing the activity context
    // await logSearch(searchQuery, {
    //   searchType,
    //   location: location || undefined,
    //   propertyType: propertyType || undefined,
    //   priceRange: priceRange || undefined,
    //   source: 'hero_search',
    //   timestamp: new Date().toISOString()
    // });

    // Here you would typically navigate to search results or trigger search
    console.log('Search performed:', { searchType, location, propertyType, priceRange });
  };
  
  // Hero background style
  const backgroundStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  return (
    <div className="relative text-white min-h-[600px] flex items-center justify-center pt-24" style={backgroundStyle}>
      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-3 text-blue-300 text-3xl md:text-3xl">
            WELCOME TO
          </div>
          <h1 className="text-5xl md:text-7xl font-normal mb-4 leading-tight uppercase tracking-wide">
            STEAL DEALS
          </h1>
          
          <p className="text-lg md:text-2xl mb-6 text-gray-200 max-w-2xl mx-auto font-light">
            Lease with Confidence, Grow with Ease
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <Link 
              href="/listings" 
              className="group relative overflow-hidden inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute -inset-x-1 bottom-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="flex items-center justify-center relative z-10">
                <FaListUl className="mr-2 group-hover:animate-pulse" />
                <span className="font-medium">View all listings</span>
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </span>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-2xl p-6">
            {/* Search Type Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1 text-gray-700 mb-6">
              <button
                className={`flex-1 py-3 text-center font-medium rounded-lg transition-all duration-300 ${
                  searchType === 'buy'
                    ? 'bg-blue-900 text-white shadow-lg'
                    : 'bg-transparent hover:bg-gray-200'
                }`}
                onClick={() => setSearchType('buy')}
              >
                Buy
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium rounded-lg transition-all duration-300 ${
                  searchType === 'rent'
                    ? 'bg-blue-900 text-white shadow-lg'
                    : 'bg-transparent hover:bg-gray-200'
                }`}
                onClick={() => setSearchType('rent')}
              >
                Rent
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium rounded-lg transition-all duration-300 ${
                  searchType === 'sell'
                    ? 'bg-blue-900 text-white shadow-lg'
                    : 'bg-transparent hover:bg-gray-200'
                }`}
                onClick={() => setSearchType('sell')}
              >
                Sell
              </button>
            </div>
            
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City, Neighborhood"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">Property Type</label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
                  >
                    <option value="">Any Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">Price Range</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
                  >
                    <option value="">Any Price</option>
                    <option value="10L-50L">₹10L - ₹50L</option>
                    <option value="50L-1Cr">₹50L - ₹1Cr</option>
                    <option value="1Cr-2Cr">₹1Cr - ₹2Cr</option>
                    <option value="2Cr+">₹2Cr+</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handleSearch}
                className="bg-blue-900 text-white py-3 px-6 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center font-medium self-end mt-7"
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;