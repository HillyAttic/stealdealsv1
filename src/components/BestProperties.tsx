"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const BestProperties = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Best Properties</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Explore our wide variety of properties to find your dream home today.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <div className="text-5xl font-bold text-blue-600 mr-4">280+</div>
              <div className="text-gray-700">Properties Listed</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Featured property card 1 */}
          <div className="w-full lg:w-1/3 max-w-md">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative h-64 sm:h-72 bg-gray-300">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Villa One Hyde Park Image
                </div>
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Featured
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Villa One Hyde Park</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span>2020 Bloomingdale Ave, Mumbai</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-blue-600 font-bold text-xl">₹4.5 Crore</div>
                  <Link 
                    href="/property/villa-one-hyde-park" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured property card 2 */}
          <div className="w-full lg:w-1/3 max-w-md mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative h-64 sm:h-72 bg-gray-300">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Luxury Apartment Image
                </div>
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  New
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Luxury Apartment</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span>1010 Park Avenue, Delhi</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-blue-600 font-bold text-xl">₹2.8 Crore</div>
                  <Link 
                    href="/property/luxury-apartment" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/listings" 
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            View All Properties
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestProperties; 