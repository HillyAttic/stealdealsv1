"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';

export default function HorecaPage() {
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
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">HoReCa Properties</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Discover premium Hotel, Restaurant, and Café properties for your business
            </p>
          </div>
        </div>
        
        {/* Properties Notice - Always shows empty state */}
        <div className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="ml-3 text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <img 
                  src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="No HoReCa properties available" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-6 opacity-50"
                />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">HoReCa Properties Coming Soon</h3>
                <p className="text-gray-600 text-lg font-medium mb-2">No HoReCa properties available at the moment</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Our team is currently preparing premium Hotel, Restaurant, and Café property listings for you. Please check back soon or contact us for early information.</p>
                <Link 
                  href="#contact"
                  className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Get Notified About New Properties
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Looking to Sell or Rent Your Property?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              List your Hotel, Restaurant, or Café property with us and reach thousands of potential buyers looking for HoReCa properties just like yours.
            </p>
            <div id="contact">
              <Link 
                href="/add-property" 
                className="inline-flex items-center bg-white hover:bg-blue-50 px-6 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg"
                style={{ color: 'rgb(28, 110, 164)' }}
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 