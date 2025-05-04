"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaUtensils, FaHotel, FaCoffee, FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaHeart, FaSearch, FaFilter, FaChevronDown, FaStar } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

// Sample HoReCa property data
const horecaProperties = [
  {
    id: 1,
    title: 'Premium Restaurant Space',
    price: '₹95,000/month',
    location: 'Mumbai, Maharashtra',
    area: '2,200 sq ft',
    type: 'For Rent',
    isNew: true,
    rating: 4.8,
    category: 'Restaurant',
    subCategory: 'Fine Dining',
    image: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    title: 'Hotel Property with Pool',
    price: '₹2,75,00,000',
    location: 'Goa',
    area: '8,500 sq ft',
    type: 'For Sale',
    isNew: false,
    rating: 4.5,
    category: 'Hotel',
    subCategory: 'Resort',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    title: 'Modern Café Location',
    price: '₹65,000/month',
    location: 'Bangalore, Karnataka',
    area: '1,200 sq ft',
    type: 'For Rent',
    isNew: true,
    rating: 4.2,
    category: 'Cafe',
    subCategory: 'Coffee Shop',
    image: 'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    title: 'Rooftop Restaurant',
    price: '₹1,25,00,000',
    location: 'Delhi, NCR',
    area: '3,000 sq ft',
    type: 'For Sale',
    isNew: false,
    rating: 4.7,
    category: 'Restaurant',
    subCategory: 'Rooftop',
    image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 5,
    title: 'Boutique Hotel Property',
    price: '₹1,85,00,000',
    location: 'Jaipur, Rajasthan',
    area: '5,800 sq ft',
    type: 'For Sale',
    isNew: true,
    rating: 4.6,
    category: 'Hotel',
    subCategory: 'Boutique',
    image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 6,
    title: 'High Street Bakery & Café',
    price: '₹85,000/month',
    location: 'Chennai, Tamil Nadu',
    area: '1,500 sq ft',
    type: 'For Rent',
    isNew: false,
    rating: 4.3,
    category: 'Cafe',
    subCategory: 'Bakery',
    image: 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 7,
    title: 'Lounge Bar Space',
    price: '₹1,45,00,000',
    location: 'Hyderabad, Telangana',
    area: '2,800 sq ft',
    type: 'For Sale',
    isNew: true,
    rating: 4.4,
    category: 'Restaurant',
    subCategory: 'Bar & Lounge',
    image: 'https://images.pexels.com/photos/34650/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 8,
    title: 'Luxury Hotel with Conference Facilities',
    price: '₹3,50,00,000',
    location: 'Pune, Maharashtra',
    area: '12,000 sq ft',
    type: 'For Sale',
    isNew: false,
    rating: 4.9,
    category: 'Hotel',
    subCategory: 'Business Hotel',
    image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const PropertyCard = ({ property }: { property: any }) => {
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Restaurant':
        return <FaUtensils className="mr-1 text-white" />;
      case 'Hotel':
        return <FaHotel className="mr-1 text-white" />;
      case 'Cafe':
        return <FaCoffee className="mr-1 text-white" />;
      default:
        return <FaBuilding className="mr-1 text-white" />;
    }
  };

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
          <div className="absolute bottom-4 left-4 flex items-center bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            {getCategoryIcon(property.category)}
            {property.category}
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
        <div className="flex justify-between items-center mb-3">
          <p className="text-blue-900 font-bold text-xl">{property.price}</p>
          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-sm">
            <FaStar className="text-yellow-500 mr-1" />
            <span className="font-medium text-gray-700">{property.rating}</span>
          </div>
        </div>
        
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-md">{property.subCategory}</span>
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

export default function HorecaPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Restaurant', 'Hotel', 'Cafe'];
  
  // Filter properties based on selected category
  const filteredProperties = activeCategory === 'All' 
    ? horecaProperties 
    : horecaProperties.filter(property => property.category === activeCategory);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">HoReCa Properties</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Discover premium Hotel, Restaurant, and Café properties for your business
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
                  placeholder="Search HoReCa properties..."
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
              
              {/* Category Selector */}
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Cafe">Café</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
              
              {/* Deal Type Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="">Any Deal Type</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
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
                    <option value="0-1000">Up to 1000 sq ft</option>
                    <option value="1000-2000">1000 - 2000 sq ft</option>
                    <option value="2000-5000">2000 - 5000 sq ft</option>
                    <option value="5000+">Above 5000 sq ft</option>
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
                    <option value="hyderabad">Hyderabad</option>
                    <option value="goa">Goa</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Rating</option>
                    <option value="4.5+">4.5 & Above</option>
                    <option value="4+">4.0 & Above</option>
                    <option value="3.5+">3.5 & Above</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Category Highlights */}
        <div className="bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-900">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FaHotel className="text-blue-900 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Hotels</h3>
                </div>
                <p className="text-gray-600 mb-4">Premium hotel properties in top tourist and business destinations. From boutique hotels to luxury resorts.</p>
                <button
                  onClick={() => setActiveCategory('Hotel')}
                  className="text-blue-900 font-medium hover:underline flex items-center"
                >
                  View Hotel Properties
                  <FaChevronDown className="ml-1 transform rotate-[-90deg]" />
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-900">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FaUtensils className="text-blue-900 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Restaurants</h3>
                </div>
                <p className="text-gray-600 mb-4">Strategically located restaurant spaces in high-footfall areas. From fine dining to rooftop venues.</p>
                <button
                  onClick={() => setActiveCategory('Restaurant')}
                  className="text-blue-900 font-medium hover:underline flex items-center"
                >
                  View Restaurant Properties
                  <FaChevronDown className="ml-1 transform rotate-[-90deg]" />
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-900">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FaCoffee className="text-blue-900 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Cafés</h3>
                </div>
                <p className="text-gray-600 mb-4">Prime café locations in urban and suburban areas. Perfect for coffee shops, bakeries, and bistros.</p>
                <button
                  onClick={() => setActiveCategory('Cafe')}
                  className="text-blue-900 font-medium hover:underline flex items-center"
                >
                  View Café Properties
                  <FaChevronDown className="ml-1 transform rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Properties Grid */}
        <div className="bg-gray-50 py-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeCategory === 'All' ? 'Featured HoReCa Properties' : `${activeCategory} Properties`}
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredProperties.length} listings)</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Sort by:</span>
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800">
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map(property => (
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
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Own a HoReCa Property?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              List your hotel, restaurant, or café property with us and reach thousands of potential buyers and tenants.
            </p>
            <Link 
              href="/add-property" 
              className="inline-flex items-center bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg"
            >
              List Your Property
            </Link>
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 