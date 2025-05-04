"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaSearch, FaFilter, FaChevronDown, FaHeart, FaExpandAlt } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

// Sample gallery images data
const galleryImages = [
  {
    id: 1,
    title: 'Modern Commercial Building',
    location: 'Mumbai, Maharashtra',
    category: 'Commercial',
    image: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    title: 'Retail Shop Interior',
    location: 'Bangalore, Karnataka',
    category: 'Retail',
    image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    title: 'Office Space with View',
    location: 'Delhi, NCR',
    category: 'Office',
    image: 'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    title: 'Industrial Warehouse',
    location: 'Pune, Maharashtra',
    category: 'Industrial',
    image: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 5,
    title: 'Corner Retail Space',
    location: 'Hyderabad, Telangana',
    category: 'Retail',
    image: 'https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 6,
    title: 'Prime Office Suite',
    location: 'Chennai, Tamil Nadu',
    category: 'Office',
    image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 7,
    title: 'Branded Retail Space',
    location: 'Ahmedabad, Gujarat',
    category: 'Retail',
    image: 'https://images.pexels.com/photos/1910236/pexels-photo-1910236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 8,
    title: 'Commercial Complex',
    location: 'Kolkata, West Bengal',
    category: 'Commercial',
    image: 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 9,
    title: 'Residential Property',
    location: 'Noida, Uttar Pradesh',
    category: 'Residential',
    image: 'https://images.pexels.com/photos/7031404/pexels-photo-7031404.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 10,
    title: 'Commercial Plot',
    location: 'Gurgaon, Haryana',
    category: 'Plot',
    image: 'https://images.pexels.com/photos/3998394/pexels-photo-3998394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 11,
    title: 'Industrial Plot',
    location: 'Greater Noida, Uttar Pradesh',
    category: 'Plot',
    image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 12,
    title: 'Residential Corner Plot',
    location: 'Delhi NCR',
    category: 'Plot',
    image: 'https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 13,
    title: 'HoReCa Location',
    location: 'Delhi, NCR',
    category: 'HoReCa',
    image: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 14,
    title: 'Restaurant Space',
    location: 'Mumbai, Maharashtra',
    category: 'HoReCa',
    image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 15,
    title: 'Cafe Location',
    location: 'Bangalore, Karnataka',
    category: 'HoReCa',
    image: 'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 16,
    title: 'Hotel Property',
    location: 'Goa',
    category: 'HoReCa',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

// Gallery Image component
const GalleryImage = ({ image }: { image: any }) => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-md group">
      <div className="h-64 relative overflow-hidden">
        <img 
          src={image.image} 
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute bottom-0 left-0 p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
          <p className="text-gray-200 text-sm">{image.location}</p>
        </div>
        
        <div className="absolute top-0 right-0 p-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 rounded-full text-blue-900 hover:bg-white transition-colors">
            <FaHeart className="text-sm" />
          </button>
          <button className="p-2 bg-white/90 rounded-full text-blue-900 hover:bg-white transition-colors">
            <FaExpandAlt className="text-sm" />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 bg-blue-900/80 text-white px-3 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {image.category}
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Commercial', 'Retail', 'Office', 'Industrial', 'Residential', 'Plot', 'HoReCa'];
  
  // Filter images based on selected category
  const filteredImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Property Gallery</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Browse our collection of premium properties and plots across India
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow-md sticky top-[57px] z-40">
          <div className="container mx-auto py-4 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search gallery..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
              </div>
              
              <button 
                className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-md w-full md:w-auto"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FaFilter className="mr-2 text-gray-800" />
                <span className="text-gray-800">Advanced Filters</span>
                <FaChevronDown className={`ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''} text-gray-800`} />
              </button>
            </div>
            
            {/* Category Filters */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Advanced Filters */}
            {filterOpen && (
              <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any Location</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                    <option value="hyderabad">Hyderabad</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Sort By</option>
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="az">A to Z</option>
                    <option value="za">Z to A</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">View</option>
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="map">Map View</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Gallery Grid */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeCategory === 'All' ? 'All Properties' : `${activeCategory} Properties`}
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredImages.length} items)</span>
              </h2>
            </div>
            
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map(image => (
                  <GalleryImage key={image.id} image={image} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No images found for this category.</p>
              </div>
            )}
            
            {/* Pagination */}
            {filteredImages.length > 0 && (
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
            )}
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Want to List Your Property?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Join our extensive property marketplace and reach thousands of potential buyers and investors
            </p>
            <Link 
              href="/add-property" 
              className="inline-flex items-center bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg"
            >
              Add Your Property
            </Link>
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 