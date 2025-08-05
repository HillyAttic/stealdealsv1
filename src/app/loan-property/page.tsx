"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaHome } from 'react-icons/fa';

export default function LoanProperty() {
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-emerald-700/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Property Financing"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-green-300 text-lg mb-4 font-medium tracking-wider">PROPERTY FINANCING SOLUTIONS</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Unlock Your Property Investment Potential
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Tailored property financing solutions with competitive rates, flexible terms, and personalized service to help you achieve your real estate goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Apply Now
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Calculate EMI
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Empty State Notice */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="ml-3 text-gray-600">Loading loan opportunities...</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl shadow-sm max-w-4xl mx-auto">
                <img 
                  src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="No loan options available" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-6 opacity-50"
                />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Property Financing Coming Soon</h3>
                <p className="text-gray-600 text-lg font-medium mb-2">Our loan services are currently under preparation</p>
                <p className="text-gray-500 max-w-md mx-auto mb-8">We are working with top financial institutions to bring you the best property financing solutions. Please check back soon or contact us for early information.</p>
                <button 
                  className="px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                >
                  Get Notified About New Loan Options
                </button>
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 