"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

// Sample plot property data
const plotProperties = [
  {
    id: 1,
    title: 'Premium Residential Plot',
    price: '₹75,00,000',
    location: 'Noida, Uttar Pradesh',
    area: '1,200 sq ft',
    type: 'For Sale',
    isNew: true,
    category: 'Residential',
    image: 'https://images.pexels.com/photos/7031404/pexels-photo-7031404.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    title: 'Commercial Plot in Business District',
    price: '₹1,25,00,000',
    location: 'Gurgaon, Haryana',
    area: '2,500 sq ft',
    type: 'For Sale',
    isNew: false,
    category: 'Commercial',
    image: 'https://images.pexels.com/photos/3998394/pexels-photo-3998394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    title: 'Industrial Plot with Highway Access',
    price: '₹1,50,00,000',
    location: 'Greater Noida, Uttar Pradesh',
    area: '5,000 sq ft',
    type: 'For Sale',
    isNew: true,
    category: 'Industrial',
    image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    title: 'Residential Corner Plot',
    price: '₹60,00,000',
    location: 'Delhi NCR',
    area: '900 sq ft',
    type: 'For Sale',
    isNew: false,
    category: 'Residential',
    image: 'https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 5,
    title: 'Mixed-Use Development Plot',
    price: '₹2,75,00,000',
    location: 'Ghaziabad, Uttar Pradesh',
    area: '3,200 sq ft',
    type: 'For Sale',
    isNew: true,
    category: 'Mixed-Use',
    image: 'https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 6,
    title: 'Premium Society Plot',
    price: '₹95,00,000',
    location: 'Faridabad, Haryana',
    area: '1,500 sq ft',
    type: 'For Sale',
    isNew: false,
    category: 'Residential',
    image: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 7,
    title: 'Shopping Mall Plot',
    price: '₹3,25,00,000',
    location: 'Noida Extension, Uttar Pradesh',
    area: '8,000 sq ft',
    type: 'For Sale',
    isNew: true,
    category: 'Commercial',
    image: 'https://images.pexels.com/photos/3970330/pexels-photo-3970330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 8,
    title: 'Warehouse Plot with Connectivity',
    price: '₹1,80,00,000',
    location: 'Manesar, Haryana',
    area: '6,500 sq ft',
    type: 'For Sale',
    isNew: false,
    category: 'Industrial',
    image: 'https://images.pexels.com/photos/1238865/pexels-photo-1238865.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const PropertyCard = ({ property }: { property: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="h-64 relative overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {property.isNew && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              New
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer">
            <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" />
          </div>
          <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            {property.type}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
          {property.title}
        </h3>
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          {property.location}
        </p>
        <p className="text-blue-900 font-bold text-xl mb-4">{property.price}</p>
        
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-md">{property.category}</span>
          </div>
          <div className="flex items-center text-sm">
            <FaRulerCombined className="mr-1 text-blue-900" />
            <span>{property.area}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlotsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Premium Plots</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Explore our selection of residential and commercial plots for investment and development
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
                  placeholder="Search plots..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <button 
                className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-md w-full md:w-auto"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FaFilter className="mr-2" />
                <span>Filters</span>
                <FaChevronDown className={`ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Plot Type Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Plot Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed-use">Mixed-Use</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Price Range Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Any Price Range</option>
                  <option value="0-5000000">Up to ₹50 Lakhs</option>
                  <option value="5000000-10000000">₹50 Lakhs - ₹1 Crore</option>
                  <option value="10000000-20000000">₹1 Crore - ₹2 Crore</option>
                  <option value="20000000+">Above ₹2 Crore</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Advanced Filters - Shown when expanded */}
            {filterOpen && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Size (sq ft)</option>
                    <option value="0-1000">Up to 1000 sq ft</option>
                    <option value="1000-3000">1000 - 3000 sq ft</option>
                    <option value="3000-5000">3000 - 5000 sq ft</option>
                    <option value="5000+">Above 5000 sq ft</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Location</option>
                    <option value="delhi">Delhi</option>
                    <option value="noida">Noida</option>
                    <option value="gurgaon">Gurgaon</option>
                    <option value="faridabad">Faridabad</option>
                    <option value="ghaziabad">Ghaziabad</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Plot Features</option>
                    <option value="corner">Corner Plot</option>
                    <option value="gated">Gated Community</option>
                    <option value="highway">Highway Access</option>
                    <option value="approved">RERA Approved</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Properties Grid */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Available Plots</h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Sort by:</span>
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size-asc">Size: Small to Large</option>
                  <option value="size-desc">Size: Large to Small</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plotProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex space-x-1">
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-blue-900 text-white">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Looking to Sell Your Plot?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              List your plot with us and reach thousands of potential buyers looking for properties just like yours.
            </p>
            <Link 
              href="/add-property" 
              className="inline-flex items-center bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg"
            >
              List Your Plot
            </Link>
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 