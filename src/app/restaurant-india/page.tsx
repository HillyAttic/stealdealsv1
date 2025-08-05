"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaSearch } from 'react-icons/fa';

export default function RestaurantIndia() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading then show empty state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-orange-700/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Indian Restaurant"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-yellow-300 text-lg mb-4 font-medium tracking-wider">DISCOVER THE FLAVORS OF INDIA</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                India's Best Restaurants & Culinary Experiences
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Explore authentic Indian cuisine from award-winning restaurants across the country. From street food to fine dining, experience the rich flavors of India.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="relative w-full md:w-96 bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg p-2 border border-white/30">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Search restaurants or cuisines..." 
                        className="w-full bg-transparent text-white placeholder-white/70 border-none outline-none py-2 pl-10 pr-4"
                      />
                      <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/70" />
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition duration-300 shadow-sm">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Empty State Notice */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="ml-3 text-gray-600">Loading restaurant information...</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl shadow-sm max-w-4xl mx-auto">
                <img 
                  src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="No restaurants available" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-6 opacity-50"
                />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Listings Coming Soon</h3>
                <p className="text-gray-600 text-lg font-medium mb-2">Our restaurant directory is currently under preparation</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">We're working with top restaurants across India to bring you the best dining experiences. Please check back soon or contact us for early information.</p>
                <button 
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Get Notified About New Restaurant Listings
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-800 to-orange-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Own a Restaurant? List With Us</h2>
              <p className="text-xl mb-10 opacity-90">
                Join our network of top-rated restaurants and reach thousands of food lovers across India
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button className="bg-white text-red-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Register Your Restaurant
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 