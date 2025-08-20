"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientOnly from '../components/ClientOnly';
import AuthModal from '../components/auth/AuthModal';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaBuilding, FaUsers, FaStar, FaCheck, FaClipboardList, FaSearch, FaListUl, FaHome } from 'react-icons/fa';
import { FaUtensils, FaHotel, FaStore, FaArrowRight, FaQuoteLeft, FaChevronRight, FaHandshake, FaPhone, FaEnvelope, FaChartLine } from 'react-icons/fa';
import TrustedBrands from '@/components/TrustedBrands';

// Component to handle search params with Suspense boundary
function SearchParamsHandler({ setShowAuthModal }: { setShowAuthModal: (show: boolean) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const loginRequired = searchParams.get('login') === 'required';
    if (loginRequired) {
      setShowAuthModal(true);
    }
  }, [searchParams, setShowAuthModal]);
  
  return null;
}

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Add custom styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .clip-path-diagonal {
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Sample property categories data
  const categories = [
    {
      id: 1,
      title: 'Pre-Leased Inventory',
      count: 20,
      icon: <FaBuilding className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/inventory',
      description: 'Premium commercial properties with long-term tenants and stable rental income'
    },
    {
      id: 2,
      title: 'Vacant',
      count: 15,
      icon: <FaStore className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/vacant',
      description: 'Ready-to-occupy commercial spaces for your business or investment'
    },
    {
      id: 3,
      title: 'Plots',
      count: 10,
      icon: <FaMapMarkerAlt className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/462331/pexels-photo-462331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/plots',
      description: 'Premium land plots for commercial and industrial development'
    },
    {
      id: 4,
      title: 'Be a Franchise',
      count: 25,
      icon: <FaHandshake className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/franchise',
      description: 'Top franchise opportunities across various industries and investment levels'
    }
  ];
  
  const bestServices = [
    {
      id: 1,
      title: 'Plots',
      count: 0,
      icon: <FaMapMarkerAlt className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/462331/pexels-photo-462331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/plots'
    },
    {
      id: 2,
      title: 'Be a Franchise',
      count: 110,
      icon: <FaHandshake className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/franchise'
    }
  ];
  
  const testimonials = [
    {
      id: 1,
      name: 'Priya Kapoor',
      position: 'Investor',
      testimonial: 'Investing in a pre-leased retail property with Steal Deals was an excellent choice for us. Their expertise in the retail market ensured we found a property in a high-footfall area, which translated into steady rental income from day one. We highly recommend them for anyone looking to make smart retail investments.',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      position: 'Restaurant Owner',
      testimonial: 'Our experience with Steal Deals for leasing a restaurant space was outstanding. They helped us find a location that perfectly matched our target market and budget. Their knowledge of F&B leasing, coupled with their network of trusted landlords, made the process smooth and efficient.',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 3,
      name: 'Ravi Mehta',
      position: 'Investor',
      testimonial: 'Steal Deals made our investment in a pre-leased bank property seamless and profitable. Their in-depth market knowledge and meticulous attention to detail helped us secure a prime location with a stable rental income. We couldn\'t be happier with the returns and peace of mind that comes with a reliable tenant like a bank.',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  ];
  
  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section - Enhanced with overlay, animations and better typography */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-blue-900/50 z-10"></div>
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              <Image 
                src="https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Hero Background"
                fill
                style={{ objectFit: 'cover' }}
                quality={100}
                priority
                className="brightness-75"
                sizes="100vw"
              />
            </div>
          </div>
          
          <div className="relative z-20 min-h-[90vh] flex items-center justify-center">
            <div className="container mx-auto px-4 py-20">
              <div className="max-w-2xl mx-auto text-center animate-fadeIn">
                <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-lg border border-white/20 shadow-2xl">
                  <h5 className="text-white text-lg mb-4 font-light tracking-wider animate-slideUp">Welcome to</h5>
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <span className="inline-block relative">
                      <span className="relative z-10">STEAL DEALS</span>
                    </span>
                  </h1>
                  <p className="text-white text-xl md:text-2xl mb-10 font-light leading-relaxed animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    Lease with Confidence, <span className="text-blue-300">Grow with Ease</span>
                  </p>
                  <div className="flex gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.6s' }}>
                    <Link 
                      href="/inventory" 
                      className="group inline-flex items-center bg-blue-900 hover:bg-blue-800 text-white py-3 px-8 rounded-md text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      View all listings
                      <FaChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center bg-transparent border-2 border-white text-white py-3 px-8 rounded-md text-lg font-medium transition-all duration-300 hover:bg-white/10"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Premium features section */}
          <div className="relative z-20 bg-gradient-to-r from-blue-800 to-indigo-900 py-6 border-t border-blue-700 shadow-lg">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
                <div className="flex flex-col items-center md:flex-row md:items-center group hover:bg-blue-700/20 p-2 rounded-lg transition-all duration-300">
                  <div className="bg-blue-700/50 p-3 rounded-full mr-0 md:mr-4 mb-3 md:mb-0 group-hover:bg-blue-600 transition-all duration-300">
                    <FaBuilding className="text-2xl" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold">Premium Locations</h3>
                    <p className="text-blue-200 text-sm">Prime real estate</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:flex-row md:items-center group hover:bg-blue-700/20 p-2 rounded-lg transition-all duration-300">
                  <div className="bg-blue-700/50 p-3 rounded-full mr-0 md:mr-4 mb-3 md:mb-0 group-hover:bg-blue-600 transition-all duration-300">
                    <FaHandshake className="text-2xl" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold">Expert Advisors</h3>
                    <p className="text-blue-200 text-sm">Personal guidance</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:flex-row md:items-center group hover:bg-blue-700/20 p-2 rounded-lg transition-all duration-300">
                  <div className="bg-blue-700/50 p-3 rounded-full mr-0 md:mr-4 mb-3 md:mb-0 group-hover:bg-blue-600 transition-all duration-300">
                    <FaStar className="text-2xl" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold">Top Rated</h3>
                    <p className="text-blue-200 text-sm">Client satisfaction</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:flex-row md:items-center group hover:bg-blue-700/20 p-2 rounded-lg transition-all duration-300">
                  <div className="bg-blue-700/50 p-3 rounded-full mr-0 md:mr-4 mb-3 md:mb-0 group-hover:bg-blue-600 transition-all duration-300">
                    <FaPhone className="text-2xl" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold">24/7 Support</h3>
                    <p className="text-blue-200 text-sm">Always available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section - Updated with new styling structure */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Who We Are</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About <span className="text-blue-900">Steal Deals</span></h2>
              <div className="w-24 h-1 bg-blue-900 mx-auto"></div>
              <p className="mt-6 text-gray-600 max-w-3xl mx-auto text-base md:text-lg">Real Estate Investments. Leasing.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-stretch gap-8 md:gap-10">
              <div className="lg:w-2/5">
                <div className="relative h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-[300px] md:h-[400px] lg:h-full">
                    <Image 
                      src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                      alt="About Steal Deals"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl md:text-2xl font-bold mb-2">Steal Deals</h3>
                      <p className="text-sm md:text-base mb-3">Founded by experienced Real Estate Professionals having over 20 years of combined industry exposure across RE verticals primarily in Wealth Creation, Leasing and Investments.</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-1 text-yellow-400" />
                          <span>East Delhi</span>
                        </div>
                        <div className="flex items-center">
                          <FaBuilding className="mr-1 text-yellow-400" />
                          <span>Since 2008</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-5 -right-5 bg-blue-900 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg transform rotate-12">
                    <p className="text-xl font-bold">20+</p>
                    <p className="text-xs">Years Exp</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-3/5">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 h-full">
                  <p className="text-gray-700 mb-6 text-base md:text-lg">We have our offices in Delhi, Noida, Gurugram and Dubai. We provide advisory services in the following corridors:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaBuilding className="inline-block mr-2" />
                        <span className="font-bold">Frachise Expansion</span>
                      </div>
                      <p className="text-sm text-gray-700">Scalable franchise opportunities across sectors, connecting investors with profitable, growth-ready brands.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaHome className="inline-block mr-2" />
                        <span className="font-bold">Investment in Plots</span>
                      </div>
                      <p className="text-sm text-gray-700">Prime plots for development with strong potential for appreciation and versatile use.x`</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaHotel className="inline-block mr-2" />
                        <span className="font-bold">Vacant Land</span>
                      </div>
                      <p className="text-sm text-gray-700">Strategic land parcels ideal for new projects, joint ventures, or long-term investments.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaStore className="inline-block mr-2" />
                        <span className="font-bold">Pre-Leased Properties</span>
                      </div>
                      <p className="text-sm text-gray-700">Assets with established tenants ensuring stable rental income and lower investment risk.</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link 
                      href="/about" 
                      className="inline-flex items-center bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-900/20"
                    >
                      Learn More About Us
                      <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Expertise Section - Completely rebuilt with proper CSS */}
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-sm font-semibold rounded-full mb-3">
                WHY CHOOSE US
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="text-blue-900">Expertise</span></h2>
              <p className="text-gray-600 text-lg">
                We've helped thousands of clients find their perfect investment property
              </p>
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left Column - Image */}
              <div className="relative order-2 lg:order-1">
                <div className="relative bg-white p-1 rounded-lg shadow-xl">
                  <img 
                    src="https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Featured Property" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                {/* Stats Card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg p-6 shadow-xl max-w-[240px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center border-r border-gray-200 pr-2">
                      <p className="text-3xl font-bold text-blue-900">15+</p>
                      <p className="text-gray-500 text-sm">Years Experience</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-900">1200+</p>
                      <p className="text-gray-500 text-sm">Properties Sold</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-900 rounded-full opacity-10"></div>
              </div>
              
              {/* Right Column - Content */}
              <div className="order-1 lg:order-2 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Premium Real Estate <span className="text-blue-900">Investment Partner</span></h3>
                <p className="text-gray-600">
                  At Steal Deals, we provide expert guidance and market intelligence to help you make informed real estate investment decisions.
                </p>
                
                {/* Feature Cards */}
                <div className="space-y-4 mt-8">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="bg-blue-100 text-blue-900 rounded-full p-3">
                          <FaHandshake className="text-xl" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Expert Advisory</h4>
                        <p className="text-gray-600 text-sm">Our seasoned consultants analyze market trends and provide tailored guidance.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="bg-blue-100 text-blue-900 rounded-full p-3">
                          <FaChartLine className="text-xl" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Market Intelligence</h4>
                        <p className="text-gray-600 text-sm">Access our proprietary data and insights for the best investment decisions.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="bg-blue-100 text-blue-900 rounded-full p-3">
                          <FaSearch className="text-xl" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Property Selection</h4>
                        <p className="text-gray-600 text-sm">We handpick premium properties that match your investment criteria.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="mt-8">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center bg-blue-900 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors shadow-md"
                  >
                    Schedule a Consultation
                    <FaChevronRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trust Badges Section - New premium section */}
        <TrustedBrands />
        
        {/* Categories Section - Enhanced with premium styling */}
        {/* <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Explore Our Services</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                Our Categories
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-900"></span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto mt-8 text-lg">
                Discover our comprehensive range of commercial real estate and franchise services
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-52 relative overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-5 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.count}+ Listings</h3>
                    <p className="text-blue-900 font-semibold mb-3 text-lg">{category.title}</p>
                    <p className="text-gray-600 mb-4 text-sm">{category.description}</p>
                    <Link 
                      href={category.link} 
                      className="inline-flex items-center text-blue-900 font-medium hover:text-blue-700 transition-colors group"
                    >
                      Explore
                      <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}
        
        {/* Best Services Section - Enhanced with premium styling */}
        <section className="py-20 bg-white relative">
          {/* Decorative elements */}
          <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-1/2 bg-blue-50 rounded-bl-[100px] -z-10"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-1/4 h-1/3 bg-blue-50 rounded-tr-[100px] -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Excellence in</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                Best Services
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-900"></span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto mt-8 text-lg">
                Our website is dedicated to providing a comprehensive and user-friendly experience for 
                individuals and businesses looking to rent or lease properties for commercial purposes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {bestServices.map((service) => (
                <div key={service.id} className="relative bg-white rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="h-72 relative overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl font-bold mb-2">{service.title}</h3>
                      <p className="text-lg mb-4">{service.count}+ Spaces Available</p>
                      <Link 
                        href={service.link} 
                        className="inline-flex items-center text-white border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-300"
                      >
                        Explore Now
                        <FaArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Updated with premium styling */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Success Stories</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                What Our Clients Say
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-900"></span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="mb-6">
                    <FaQuoteLeft className="text-blue-900 text-3xl opacity-20" />
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{testimonial.testimonial}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                        <p className="text-blue-900 text-sm">{testimonial.position}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className={`text-yellow-400 ${star <= testimonial.rating ? 'opacity-100' : 'opacity-30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action Section - Enhanced with premium design */}
        <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h6 className="text-blue-300 font-semibold mb-3 uppercase tracking-wider">Get Started Today</h6>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Make Your Next <span className="text-blue-300">Investment</span>?
              </h2>
              <p className="text-blue-100 text-lg mb-10 leading-relaxed">
                Join thousands of satisfied investors who have found their perfect properties with Steal Deals. 
                Our expert team is ready to guide you through every step of your investment journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="/contact" 
                  className="group inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <FaPhone className="mr-3 group-hover:animate-pulse" />
                  Schedule Consultation
                  <FaArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <Link 
                  href="/inventory" 
                  className="inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  <FaListUl className="mr-3" />
                  Browse Properties
                </Link>
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="text-white">
                  <p className="text-3xl font-bold mb-2">500+</p>
                  <p className="text-blue-200">Properties Listed</p>
                </div>
                <div className="text-white">
                  <p className="text-3xl font-bold mb-2">1000+</p>
                  <p className="text-blue-200">Happy Clients</p>
                </div>
                <div className="text-white">
                  <p className="text-3xl font-bold mb-2">15+</p>
                  <p className="text-blue-200">Years Experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
        
        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}
      </ClientOnly>
    </main>
  );
}