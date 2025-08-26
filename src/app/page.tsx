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
  const [plotsCount, setPlotsCount] = useState(0);
  const [franchisesCount, setFranchisesCount] = useState(110);
  const [vacantCount, setVacantCount] = useState(15);
  const [preLeasedCount, setPreLeasedCount] = useState(20);

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


  
  // Fetch dynamic counts from APIs
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch plots count
        const plotsResponse = await fetch('/api/plots');
        if (plotsResponse.ok) {
          const plotsData = await plotsResponse.json();
          setPlotsCount(plotsData.total || 0);
        }
        
        // Fetch franchises count
        const franchisesResponse = await fetch('/api/franchises');
        if (franchisesResponse.ok) {
          const franchisesData = await franchisesResponse.json();
          setFranchisesCount(franchisesData.total || 110);
        }
        
        // Fetch vacant properties count
        const vacantResponse = await fetch('/api/properties?propertyType=Vacant');
        if (vacantResponse.ok) {
          const vacantData = await vacantResponse.json();
          setVacantCount(vacantData.total || 15);
        }
        
        // Use static count for pre-leased properties to avoid unnecessary API calls
        setPreLeasedCount(45);
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Keep default values on error
      }
    };
    
    fetchCounts();
  }, []);
  
  const bestServices = [
    {
      id: 1,
      title: 'Plots',
      count: plotsCount,
      icon: <FaMapMarkerAlt className="text-3xl" style={{ color: 'rgb(28, 110, 164)' }} />,
      image: 'https://prestigeprelaunchprojects.com/images/prestige-plots-devanahallii.jpg',
      link: '/plots'
    },
    {
      id: 2,
      title: 'Be a Franchise',
      count: franchisesCount,
      icon: <FaHandshake className="text-3xl" style={{ color: 'rgb(28, 110, 164)' }} />,
      image: 'https://specials-images.forbesimg.com/imageserve/65bba21b5b2d37f74a168e56/960x0.jpg',
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
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.6s' }}>
                    <Link 
                      href="/franchise" 
                      className="group inline-flex items-center justify-center text-white py-2.5 px-4 sm:py-3 sm:px-8 rounded-md text-sm sm:text-lg font-medium transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: 'rgb(28, 110, 164)',
                        boxShadow: '0 4px 14px 0 rgba(28, 110, 164, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
                        e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(21, 77, 113, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
                        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(28, 110, 164, 0.2)';
                      }}
                    >
                      <span className="hidden sm:inline">View all Franchises</span>
                      <span className="sm:hidden">All Franchises</span>
                      <FaChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link 
                      href="/plots" 
                      className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white py-2.5 px-4 sm:py-3 sm:px-8 rounded-md text-sm sm:text-lg font-medium transition-all duration-300 hover:bg-white/10"
                    >
                      <span className="hidden sm:inline">View all Plots</span>
                      <span className="sm:hidden">View all Plots</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Premium features section - Enhanced with glassmorphism and better UX */}
          <div className="relative z-20 py-6 overflow-hidden border-t shadow-lg" style={{ 
            background: 'linear-gradient(135deg, rgb(28, 110, 164) 0%, rgb(21, 77, 113) 50%, rgb(51, 161, 224) 100%)',
            borderTopColor: 'rgba(21, 77, 113, 0.5)'
          }}>
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-5 -left-5 w-20 h-20 md:w-40 md:h-40 rounded-full opacity-20" style={{ backgroundColor: '#8CCDEB' }}></div>
              <div className="absolute top-10 right-5 w-16 h-16 md:w-32 md:h-32 rounded-full opacity-15" style={{ backgroundColor: 'rgb(51, 161, 224)' }}></div>
              <div className="absolute -bottom-5 left-1/3 w-24 h-24 md:w-48 md:h-48 rounded-full opacity-10" style={{ backgroundColor: 'white' }}></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Premium Locations */}
                <div className="group">
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="mb-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ 
                          background: 'linear-gradient(135deg, rgb(28, 110, 164) 0%, rgb(21, 77, 113) 40%, rgb(28, 110, 164) 100%)',
                          boxShadow: '0 4px 15px rgba(28, 110, 164, 0.4)'
                        }}>
                          <FaBuilding className="text-lg md:text-xl text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">Premium Locations</h3>
                        <p className="text-white/80 text-xs md:text-sm leading-relaxed">Prime real estate</p>
                        <div className="mt-2 w-6 h-0.5 mx-auto rounded-full transition-all duration-300 group-hover:w-8" style={{ backgroundColor: '#8CCDEB' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expert Advisors */}
                <div className="group">
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="mb-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ 
                          background: 'linear-gradient(135deg, rgb(28, 110, 164) 0%, rgb(21, 77, 113) 40%, rgb(28, 110, 164) 100%)',
                          boxShadow: '0 4px 15px rgba(28, 110, 164, 0.4)'
                        }}>
                          <FaHandshake className="text-lg md:text-xl text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">Expert Advisors</h3>
                        <p className="text-white/80 text-xs md:text-sm leading-relaxed">Personal guidance</p>
                        <div className="mt-2 w-6 h-0.5 mx-auto rounded-full transition-all duration-300 group-hover:w-8" style={{ backgroundColor: '#8CCDEB' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Top Rated */}
                <div className="group">
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="mb-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ 
                          background: 'linear-gradient(135deg, rgb(28, 110, 164) 0%, rgb(21, 77, 113) 40%, rgb(28, 110, 164) 100%)',
                          boxShadow: '0 4px 15px rgba(28, 110, 164, 0.4)'
                        }}>
                          <FaStar className="text-lg md:text-xl text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">Top Rated</h3>
                        <p className="text-white/80 text-xs md:text-sm leading-relaxed">Client satisfaction</p>
                        <div className="mt-2 w-6 h-0.5 mx-auto rounded-full transition-all duration-300 group-hover:w-8" style={{ backgroundColor: '#8CCDEB' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 24/7 Support */}
                <div className="group">
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="mb-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ 
                          background: 'linear-gradient(135deg, rgb(28, 110, 164) 0%, rgb(21, 77, 113) 40%, rgb(28, 110, 164) 100%)',
                          boxShadow: '0 4px 15px rgba(28, 110, 164, 0.4)'
                        }}>
                          <FaPhone className="text-lg md:text-xl text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">24/7 Support</h3>
                        <p className="text-white/80 text-xs md:text-sm leading-relaxed">Always available</p>
                        <div className="mt-2 w-6 h-0.5 mx-auto rounded-full transition-all duration-300 group-hover:w-8" style={{ backgroundColor: '#8CCDEB' }}></div>
                      </div>
                    </div>
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
              <h6 className="font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgb(28, 110, 164)' }}>Who We Are</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About <span style={{ color: 'rgb(28, 110, 164)' }}>Steal Deals</span></h2>
              <div className="w-24 h-1 mx-auto" style={{ backgroundColor: 'rgb(28, 110, 164)' }}></div>
              <p className="mt-6 text-gray-600 max-w-3xl mx-auto text-base md:text-lg">Real Estate Investments. Leasing.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-stretch gap-8 md:gap-10">
              <div className="lg:w-2/5">
                <div className="relative h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-[300px] md:h-[400px] lg:h-full">
                    <Image 
                      src="/images/about_us/ishank kohli (1).png"
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
                  <div className="absolute -top-5 -right-5 text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg transform rotate-12"
                    style={{
                      backgroundColor: 'rgb(28, 110, 164)'
                    }}
                  >
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
                      <div className="mb-3 text-xl" style={{ color: 'rgb(28, 110, 164)' }}>
                        <FaBuilding className="inline-block mr-2" />
                        <span className="font-bold">Frachise Expansion</span>
                      </div>
                      <p className="text-sm text-gray-700">Scalable franchise opportunities across sectors, connecting investors with profitable, growth-ready brands.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="mb-3 text-xl" style={{ color: 'rgb(28, 110, 164)' }}>
                        <FaHome className="inline-block mr-2" />
                        <span className="font-bold">Investment in Plots</span>
                      </div>
                      <p className="text-sm text-gray-700">Prime plots for development with strong potential for appreciation and versatile use.x`</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="mb-3 text-xl" style={{ color: 'rgb(28, 110, 164)' }}>
                        <FaHotel className="inline-block mr-2" />
                        <span className="font-bold">Vacant Land</span>
                      </div>
                      <p className="text-sm text-gray-700">Strategic land parcels ideal for new projects, joint ventures, or long-term investments.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <div className="mb-3 text-xl" style={{ color: 'rgb(28, 110, 164)' }}>
                        <FaStore className="inline-block mr-2" />
                        <span className="font-bold">Pre-Leased Properties</span>
                      </div>
                      <p className="text-sm text-gray-700">Assets with established tenants ensuring stable rental income and lower investment risk.</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link 
                      href="/about" 
                      className="inline-flex items-center text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg"
                      style={{
                        backgroundColor: 'rgb(28, 110, 164)',
                        boxShadow: '0 4px 14px 0 rgba(28, 110, 164, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
                        e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(21, 77, 113, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
                        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(28, 110, 164, 0.2)';
                      }}
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
              <div className="inline-block px-3 py-1 bg-blue-100 text-sm font-semibold rounded-full mb-3" style={{ color: 'rgb(28, 110, 164)' }}>
                WHY CHOOSE US
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our <span style={{ color: 'rgb(28, 110, 164)' }}>Expertise</span></h2>
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
                      <p className="text-3xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>15+</p>
                      <p className="text-gray-500 text-sm">Years Experience</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>1200+</p>
                      <p className="text-gray-500 text-sm">Properties Sold</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: 'rgb(28, 110, 164)' }}></div>
              </div>
              
              {/* Right Column - Content */}
              <div className="order-1 lg:order-2 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Premium Real Estate <span style={{ color: 'rgb(28, 110, 164)' }}>Investment Partner</span></h3>
                <p className="text-gray-600">
                  At Steal Deals, we provide expert guidance and market intelligence to help you make informed real estate investment decisions.
                </p>
                
                {/* Feature Cards */}
                <div className="space-y-4 mt-8">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="bg-blue-100 rounded-full p-3" style={{ color: 'rgb(28, 110, 164)' }}>
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
                        <div className="bg-blue-100 rounded-full p-3" style={{ color: 'rgb(28, 110, 164)' }}>
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
                        <div className="bg-blue-100 rounded-full p-3" style={{ color: 'rgb(28, 110, 164)' }}>
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
                    className="inline-flex items-center text-white py-3 px-6 rounded-lg transition-colors shadow-md"
                    style={{
                      backgroundColor: 'rgb(28, 110, 164)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
                    }}
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
        

        
        {/* Best Services Section - Enhanced with premium styling */}
        <section className="py-20 bg-white relative">
          {/* Decorative elements */}
          <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-1/2 bg-blue-50 rounded-bl-[100px] -z-10"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-1/4 h-1/3 bg-blue-50 rounded-tr-[100px] -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h6 className="font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgb(28, 110, 164)' }}>Excellence in</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                Best Services
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1" style={{ backgroundColor: 'rgb(28, 110, 164)' }}></span>
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
              <h6 className="font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgb(28, 110, 164)' }}>Success Stories</h6>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                What Our Clients Say
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1" style={{ backgroundColor: 'rgb(28, 110, 164)' }}></span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="mb-6">
                    <FaQuoteLeft className="text-3xl opacity-20" style={{ color: 'rgb(28, 110, 164)' }} />
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
                        <p className="text-sm" style={{ color: 'rgb(28, 110, 164)' }}>{testimonial.position}</p>
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
        <section className="py-20 bg-gradient-to-r from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h6 className="text-white/80 font-semibold mb-3 uppercase tracking-wider">Get Started Today</h6>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Make Your Next <span className="text-white/90">Investment</span>?
              </h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Join thousands of satisfied investors who have found their perfect properties with Steal Deals. 
                Our expert team is ready to guide you through every step of your investment journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
                <Link 
                  href="/contact" 
                  className="group flex-1 inline-flex items-center justify-center bg-white text-[rgb(21,77,113)] px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-white/90 hover:text-[rgb(28,110,164)] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 min-w-0"
                >
                  <FaPhone className="mr-2 sm:mr-3 group-hover:animate-pulse flex-shrink-0" />
                  <span className="truncate">Schedule Consultation</span>
                  <FaArrowRight className="ml-2 sm:ml-3 transform group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                </Link>
                
                <Link 
                  href="/franchise" 
                  className="flex-1 inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-white hover:text-[rgb(21,77,113)] transition-all duration-300 min-w-0"
                >
                  <FaListUl className="mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">Browse Properties</span>
                </Link>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 text-center">
                <div className="text-white">
                  <p className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">500+</p>
                  <p className="text-white/80 text-xs sm:text-base">Properties Listed</p>
                </div>
                <div className="text-white">
                  <p className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">1000+</p>
                  <p className="text-white/80 text-xs sm:text-base">Happy Clients</p>
                </div>
                <div className="text-white">
                  <p className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">15+</p>
                  <p className="text-white/80 text-xs sm:text-base">Years Experience</p>
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