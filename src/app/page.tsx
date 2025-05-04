"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientOnly from '../components/ClientOnly';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaBuilding, FaUsers, FaStar, FaCheck, FaClipboardList, FaSearch, FaListUl, FaHome } from 'react-icons/fa';
import { FaUtensils, FaHotel, FaStore, FaArrowRight, FaQuoteLeft, FaChevronRight, FaHandshake, FaPhone, FaEnvelope, FaChartLine } from 'react-icons/fa';
import TrustedBrands from '@/components/TrustedBrands';

export default function Home() {
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
      title: 'Banks',
      count: 5,
      icon: <FaBuilding className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/banks'
    },
    {
      id: 2,
      title: 'Residential',
      count: 5,
      icon: <FaHome className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/residential'
    },
    {
      id: 3,
      title: 'Banquet',
      count: 3,
      icon: <FaHotel className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/banquet'
    },
    {
      id: 4,
      title: 'Retail Stores',
      count: 5,
      icon: <FaStore className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/retail-stores'
    }
  ];
  
  const bestServices = [
    {
      id: 1,
      title: 'Food & Beverages',
      count: 5,
      icon: <FaUtensils className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/food-beverages'
    },
    {
      id: 2,
      title: 'Hotel',
      count: 3,
      icon: <FaHotel className="text-3xl text-blue-900" />,
      image: 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/hotel'
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
            <div className="w-full h-full">
              <Image 
                src="https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Hero Background"
                layout="fill"
                objectFit="cover"
                quality={100}
                priority
                className="brightness-75"
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
        
        {/* About Section - Completely redesigned with card-based layout */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Who We Are</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About <span className="text-blue-900">Steal Deals</span></h2>
              <div className="w-24 h-1 bg-blue-900 mx-auto"></div>
              <p className="mt-6 text-gray-600 max-w-3xl mx-auto text-base md:text-lg">
                Real Estate Investments. Leasing.
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-stretch gap-8 md:gap-10">
              {/* Image column with overlays */}
              <div className="lg:w-2/5">
                <div className="relative h-full">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[300px] md:h-[400px] lg:h-full">
                    <Image 
                      src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                      alt="About Steal Deals"
                      layout="fill"
                      objectFit="cover"
                      quality={100}
                      className="transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                    
                    {/* Company overview card */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl md:text-2xl font-bold mb-2">Steal Deals</h3>
                      <p className="text-sm md:text-base mb-3">
                        Founded by experienced Real Estate Professionals having over 20 years of combined industry 
                        exposure across RE verticals primarily in Wealth Creation, Leasing and Investments.
                      </p>
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
                  
                  {/* Experience badge */}
                  <div className="absolute -top-5 -right-5 bg-blue-900 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg transform rotate-12">
                    <p className="text-xl font-bold">20+</p>
                    <p className="text-xs">Years Exp</p>
                  </div>
                </div>
              </div>
              
              {/* Content column with services */}
              <div className="lg:w-3/5">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 h-full">
                  <p className="text-gray-700 mb-6 text-base md:text-lg">
                    We have our offices in Laxmi Nagar and Vivek Vihar, East Delhi. We provide advisory services 
                    in the following corridors:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaBuilding className="inline-block mr-2" />
                        <span className="font-bold">Pre-Leased Properties</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Across Delhi, Noida, Ghaziabad and Gurgaon: Banks / Insurance Cos. / Independent Buildings / 
                        Offices / Retail showrooms etc.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaHome className="inline-block mr-2" />
                        <span className="font-bold">Commercial Plots</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Udyog Vihar/Golf Course Road/Infocity/Manesar – Gurgaon, Sahibabad Industrial Area, 
                        Jhilmil/Friends Colony, Patparganj and Noida.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaHotel className="inline-block mr-2" />
                        <span className="font-bold">Hotel Transactions</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Land Acquisition, Project Feasibility, Joint Ventures, Existing Property leasing etc.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="text-blue-900 mb-3 text-xl">
                        <FaStore className="inline-block mr-2" />
                        <span className="font-bold">Turnkey Development</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Residential Builder floor Construction in Rajgarh Colony, Krishna Nagar, Project 
                        Investment at land stage and floor bookings.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link 
                      href="/about" 
                      className="inline-flex items-center bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-900/20"
                    >
                      Learn More About Us
                      <FaChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
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
        
        {/* Featured In */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h6 className="text-gray-500 text-sm uppercase font-medium tracking-wider">Featured In:</h6>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div className="w-32 h-12 bg-white shadow-sm rounded flex items-center justify-center">
                <div className="text-gray-400 font-medium">Communities</div>
              </div>
              {/* Add more featured logos/companies as needed */}
            </div>
          </div>
        </section>
        
        {/* Explore Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore the neighborhood</h2>
            </div>
          </div>
        </section>
        
        {/* Categories Section - Enhanced with premium styling */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">Diverse Options</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                Our Categories
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-900"></span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto mt-8 text-lg">
                Steal Deal is a revolutionary online platform that has transformed the way businesses 
                approach commercial leasing and pre-leasing
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.count} Properties</h3>
                    <p className="text-blue-900 font-semibold mb-4 text-lg">{category.title}</p>
                    <Link 
                      href={category.link} 
                      className="inline-flex items-center text-blue-900 font-medium hover:text-blue-700 transition-colors group"
                    >
                      More Details
                      <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
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
                      <p className="text-blue-100 text-lg mb-4">{service.count} Properties Available</p>
                      <Link 
                        href={service.link} 
                        className="inline-flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 px-5 rounded-full text-sm font-medium transition-all group"
                      >
                        Explore Options
                        <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="absolute top-6 right-6 bg-blue-900 text-white p-4 rounded-full shadow-lg z-10">
                    {service.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Counter Section - New premium section */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Success Story</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Counter 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition duration-500 hover:scale-105 hover:bg-white/20">
                <div className="text-5xl text-yellow-400 mx-auto mb-4">
                  <FaBuilding className="inline-block" />
                </div>
                <div className="text-4xl font-bold mb-2">1500+</div>
                <div className="text-xl">Properties Sold</div>
              </div>
              
              {/* Counter 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition duration-500 hover:scale-105 hover:bg-white/20">
                <div className="text-5xl text-yellow-400 mx-auto mb-4">
                  <FaUsers className="inline-block" />
                </div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div className="text-xl">Happy Clients</div>
              </div>
              
              {/* Counter 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition duration-500 hover:scale-105 hover:bg-white/20">
                <div className="text-5xl text-yellow-400 mx-auto mb-4">
                  <FaStar className="inline-block" />
                </div>
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-xl">Years Experience</div>
              </div>
              
              {/* Counter 4 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition duration-500 hover:scale-105 hover:bg-white/20">
                <div className="text-5xl text-yellow-400 mx-auto mb-4">
                  <FaMapMarkerAlt className="inline-block" />
                </div>
                <div className="text-4xl font-bold mb-2">25+</div>
                <div className="text-xl">Cities Covered</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Enhanced with premium styling */}
        <section className="py-20 bg-gray-50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h6 className="text-blue-900 font-semibold mb-3 uppercase tracking-wider">What They Say</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                Testimonials
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-900"></span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto mt-8 text-lg">
                What Our Clients Are Saying About Our Services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 relative">
                  <div className="absolute -top-5 left-8 text-blue-900 opacity-30">
                    <FaQuoteLeft className="text-5xl" />
                  </div>
                  
                  <div className="flex items-center mb-6 relative z-10">
                    <div className="w-20 h-20 rounded-full overflow-hidden mr-5 border-4 border-blue-50 shadow-md">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-blue-900">{testimonial.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`${
                          i < Math.floor(testimonial.rating) 
                            ? 'text-yellow-500' 
                            : i < testimonial.rating 
                              ? 'text-yellow-500' 
                              : 'text-gray-300'
                        } mr-1 text-lg`}
                      />
                    ))}
                    <span className="text-gray-600 ml-2 font-medium">{testimonial.rating}/5</span>
                  </div>
                  
                  <p className="text-gray-700">
                    {testimonial.testimonial}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced Call-to-Action Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800">How We Can Help You</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Property Owners */}
              <div className="bg-white rounded-lg shadow-xl p-8 transform transition duration-500 hover:shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-blue-900">For Property Owners</h3>
                <p className="text-gray-600 mb-6">Looking to sell or lease your property? Let our experts help you get the best value.</p>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Professional property valuation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Strategic marketing to qualified buyers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Negotiation expertise to maximize returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">End-to-end documentation support</span>
                  </li>
                </ul>
                
                <button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 flex items-center justify-center">
                  <FaClipboardList className="mr-2" /> List Your Property
                </button>
              </div>
              
              {/* For Property Seekers */}
              <div className="bg-white rounded-lg shadow-xl p-8 transform transition duration-500 hover:shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-blue-900">For Property Seekers</h3>
                <p className="text-gray-600 mb-6">Find your perfect property with our extensive inventory and personalized service.</p>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Access to exclusive pre-leased properties</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Personalized property search assistance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Investment advisory for best returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-900 mr-2 mt-1"><FaCheck /></span>
                    <span className="text-gray-800">Seamless transaction process</span>
                  </li>
                </ul>
                
                <button className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 flex items-center justify-center">
                  <FaSearch className="mr-2" /> Find Your Property
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated with Market Insights</h2>
              <p className="text-lg mb-8">Subscribe to our newsletter for the latest property trends, investment opportunities, and market updates.</p>
              
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-grow py-3 px-4 rounded-lg text-gray-800 focus:outline-none"
                />
                <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-300">
                  Subscribe Now
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
