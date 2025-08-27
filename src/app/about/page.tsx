"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaBuilding, FaHandshake, FaUsers, FaChartLine, FaMapMarkerAlt, FaBriefcase, FaHotel, FaTools, FaRegLightbulb, FaAward, FaLeaf, FaShieldAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';
import Link from 'next/link';

export default function AboutPage() {
  const offices = [
    {
      location: 'Delhi',
      address: '406, Roots Tower, Nirman Vihar, Delhi-110092',
      phone: '',
      email: ''
    },
    {
      location: 'Noida',
      address: '2nd Floor, Block A, Ofis Square, The Iconic Corenthum, Noida Sector - 62, Uttar Pradesh - 201301',
      phone: '',
      email: ''
    },
    {
      location: 'Gurugram',
      address: '401, Suncity Trade Tower, Gurugram Sector - 21, Haryana-122016',
      phone: '',
      email: ''
    },
    {
      location: 'UAE',
      address: 'Aspin Commercial Tower, Sheikh Zayed Road, Dubai-500001',
      phone: '',
      email: ''
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Enhanced Hero Section with Compact Height */}
        <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)]">
          {/* Advanced Background Elements */}
          <div className="absolute inset-0">
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(21,77,113)]/50 via-transparent to-[rgb(51,161,224)]/50 animate-pulse"></div>
            
            {/* Floating Geometric Elements */}
            <div className="absolute top-1/4 right-1/4 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full blur-xl animate-bounce"></div>
            <div className="absolute bottom-1/3 left-1/4 w-16 h-16 md:w-24 md:h-24 bg-[#8CCDEB]/20 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full blur-md animate-bounce" style={{animationDelay: '1s'}}></div>
            
            {/* Diagonal Glass Effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-white/10 via-white/5 to-transparent backdrop-blur-sm transform skew-x-12"></div>
            
            {/* Corner Orbs with Enhanced Effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-white/15 via-[#8CCDEB]/10 to-transparent rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-tr from-white/15 via-[#8CCDEB]/10 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Enhanced Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">About Us</span>
              </h1>
              
              {/* Animated Divider */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-6 h-0.5 bg-white/30 rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-white/60 via-[#8CCDEB] to-white/60 rounded-full mx-3 shadow-lg"></div>
                <div className="w-6 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              
              {/* Enhanced Description */}
              <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
                <span className="text-[#8CCDEB] font-bold">Steal Deals</span> - Your trusted partner for 
                <span className="bg-gradient-to-r from-white to-[#8CCDEB] bg-clip-text text-transparent font-semibold"> real estate investment</span>, 
                leasing, and development
              </p>
            </div>
          </div>
          
          {/* Bottom Wave Effect */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V120L1200,120V0C1200,0,1000,60,600,60C200,60,0,0,0,0Z" fill="white" fillOpacity="0.1"></path>
            </svg>
          </div>
        </section>
        
        {/* About Company Section - Enhanced UI/UX with Theme Colors */}
        <section className="py-20 bg-gradient-to-br from-white via-[#8CCDEB]/20 to-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-40 h-40 bg-[rgb(51,161,224)]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 right-16 w-56 h-56 bg-[rgb(28,110,164)]/15 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#8CCDEB]/25 rounded-full blur-xl animate-bounce"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                {/* Premium Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[rgb(21,77,113)] to-[rgb(28,110,164)] text-white rounded-full text-sm font-semibold mb-8 shadow-lg">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Commercial Real Estate Leaders
                </div>
                
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] bg-clip-text text-transparent mb-8 leading-tight">
                  STEAL DEALS
                </h2>

                
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[rgb(28,110,164)] to-[rgb(51,161,224)] bg-clip-text mb-6">
                  Empowering Investments. Enabling Growth.
                </h3>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    Steal Deals is a modern-day commercial real estate and franchise
                    consulting firm that bridges the gap between aspiration and execution. With a sharp focus on
                    franchise expansion and leasing solutions, we empower individuals and businesses to unlock
                    long-term income opportunities through strategic investments and partnerships.
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">
                      At our core, we specialize in:
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[rgb(21,77,113)]">
                        <span className="font-semibold text-[rgb(21,77,113)]">Franchise Consulting</span>
                        <span className="text-gray-600"> - Helping you invest in and grow top-performing franchises across India, whether in retail, food & beverage, or emerging sectors.</span>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[rgb(21,77,113)]">
                        <span className="font-semibold text-[rgb(21,77,113)]">Leasing Solutions</span>
                        <span className="text-gray-600"> - Curating the perfect spaces for national and regional brands, ensuring high-visibility, high-footfall locations across urban markets.</span>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[rgb(21,77,113)]">
                        <span className="font-semibold text-[rgb(21,77,113)]">Real Estate Investments</span>
                        <span className="text-gray-600"> - Offering handpicked pre-leased commercial assets and plots (residential, commercial, industrial) in Delhi NCR that ensure stable, long-term returns.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                    <p>
                      Whether you're a first-time investor exploring alternative income streams or an established
                      entrepreneur looking to diversify your portfolio, Steal Deals is your trusted partner in navigating the
                      world of commercial growth.
                    </p>
                    <p className="font-medium text-gray-800">
                      We don't just close transactions - we build ecosystems where brands thrive, landlords profit, and
                      investors flourish.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link 
                    href="/contact" 
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[rgb(21,77,113)] to-[rgb(28,110,164)] text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgb(28,110,164)] to-[rgb(51,161,224)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 mr-2">Get In Touch</span>
                    <svg className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="relative group">
                {/* Enhanced Image Container with Glassmorphism */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(51,161,224)]/20 via-[#8CCDEB]/20 to-[rgb(28,110,164)]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-[rgb(51,161,224)]/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[rgb(28,110,164)]/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Image with Overlay */}
                  <div className="relative z-10">
                    <img 
                      src="/images/about_us/ishank kohli (1).png" 
                      alt="Ishank Kohli - Thought Leader" 
                      className="rounded-3xl w-full h-auto object-cover filter group-hover:brightness-110 transition-all duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgb(21,77,113)]/20 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Professional Badge */}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-[rgb(51,161,224)] rounded-full animate-pulse"></div>
                        <span className="text-gray-800 font-semibold text-sm">CEO & Founder</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-700">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Quote Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#8CCDEB]/30 max-w-xs transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-start space-x-3">
                    <svg className="w-8 h-8 text-[rgb(51,161,224)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">"Building bridges between dreams and reality"</p>
                      <p className="text-gray-500 text-xs">- Leadership Vision</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Remarkable Achievements</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600">
                Our track record of success in the commercial real estate sector
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
              <div className="bg-white rounded-lg p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2 break-all">₹1000Cr+</div>
                <div className="text-gray-600 text-xs md:text-base">Transaction Value</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">5M+</div>
                <div className="text-gray-600 text-xs md:text-base">Sq Ft Sold</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">15M+</div>
                <div className="text-gray-600 text-xs md:text-base">Sq Ft Leased</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">95%</div>
                <div className="text-gray-600 text-xs md:text-base">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recognition Section - Enhanced with Innovative UI/UX */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
          {/* Animated Background Elements - Responsive for Mobile and Tablet */}
          <div className="absolute inset-0">
            <div className="absolute top-5 left-5 md:top-10 md:left-10 w-16 h-16 md:w-32 md:h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-10 md:top-40 md:right-20 w-12 h-12 md:w-24 md:h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-10 left-1/4 md:bottom-20 w-20 h-20 md:w-40 md:h-40 bg-indigo-200/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 w-14 h-14 md:w-28 md:h-28 bg-pink-200/30 rounded-full blur-xl animate-bounce"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-20">
              {/* Premium Badge */}
              <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Industry Recognition & Awards
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                Trusted Partners
              </h2>
              <div className="w-32 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full mb-8 shadow-lg"></div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Recognized by India's leading real estate developers as their
                <span className="font-semibold text-blue-600"> preferred consulting partner</span>
              </p>
            </div>

            {/* Enhanced Cards Grid with Equal Heights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
              {/* Hero Homes Card */}
              <div className="group relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-4 h-80">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 h-full flex flex-col justify-between">
                  {/* Floating Logo Container */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-3 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-6">
                      <img 
                        src="https://play-lh.googleusercontent.com/Ku2Q0NmJHJ1gvPS4zq-1AcxnHTvzlL3VJRk9OnsIZIkGbmegJOfyXt19QbdmqOZeAJ4" 
                        alt="Hero Homes Logo" 
                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-500"
                      />
                    </div>
                    {/* Animated Ring */}
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-200 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">
                    Hero Homes
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Recognized as a trusted consultant partner for premium residential projects
                  </p>
                  
                  {/* Achievement Badge */}
                  <div className="mt-2 flex justify-center">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full">
                      Premium Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Earth Card */}
              <div className="group relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-4 h-80">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 h-full flex flex-col justify-between">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-3 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-6">
                      <img 
                        src="https://i.ytimg.com/vi/UBb5g35LdPI/maxresdefault.jpg" 
                        alt="Hero Earth Logo" 
                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl border-2 border-green-200 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center group-hover:text-green-600 transition-colors duration-300">
                    Hero Earth
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Top consultant for sustainable and eco-friendly development projects
                  </p>
                  
                  <div className="mt-2 flex justify-center">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-sm font-semibold rounded-full">
                      Eco Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Spaze Group Card */}
              <div className="group relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-4 h-80">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 h-full flex flex-col justify-between">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-3 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-6">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjhJTHizESz6tcC-64bB3BMhoL1GnxPMXRkw&s" 
                        alt="Spaze Group Logo" 
                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl border-2 border-purple-200 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center group-hover:text-purple-600 transition-colors duration-300">
                    Spaze Group
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Preferred partner for commercial and mixed-use developments in the NCR
                  </p>
                  
                  <div className="mt-2 flex justify-center">
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold rounded-full">
                      NCR Leader
                    </span>
                  </div>
                </div>
              </div>

              {/* Omaxe Group Card */}
              <div className="group relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-4 h-80">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 h-full flex flex-col justify-between">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-3 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-6">
                      <img 
                        src="https://media.licdn.com/dms/image/v2/C560BAQFT-Y1k4tR72Q/company-logo_200_200/company-logo_200_200/0/1630604507827/omaxe_limited_logo?e=2147483647&v=beta&t=_WpxKrOEY80a1jc39SXm9LZzYDnLElykebxkX9-fBa8" 
                        alt="Omaxe Group Logo" 
                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl border-2 border-orange-200 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center group-hover:text-orange-600 transition-colors duration-300">
                    Omaxe Group
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Trusted consultant for residential and commercial projects across cities
                  </p>
                  
                  <div className="mt-2 flex justify-center">
                    <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-sm font-semibold rounded-full">
                      Multi-City
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats Section - Hidden on Mobile */}
            <div className="mt-16 text-center hidden sm:block">
              <div className="inline-flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 bg-white/60 backdrop-blur-sm rounded-2xl px-4 sm:px-8 py-4 sm:py-6 shadow-xl max-w-4xl mx-auto">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">Active Partnerships</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">Trusted Since 2008</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">Pan-India Presence</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600">
                The principles that guide our business operations and client relationships
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-highlight/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaRegLightbulb className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Expertise & Knowledge</h3>
                <p className="text-gray-600">
                  Our team brings decades of specialized knowledge and market insight to every transaction, ensuring informed decisions.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaAward className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Integrity & Transparency</h3>
                <p className="text-gray-600">
                  We operate with complete transparency, providing honest advice and ensuring clients have all the information they need.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-accent-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaHandshake className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Client-Focused Approach</h3>
                <p className="text-gray-600">
                  We prioritize our clients' needs, tailoring our services to achieve their specific real estate and investment goals.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Leadership Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="bg-primary absolute top-0 left-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform -translate-x-4 -translate-y-4"></div>
                <img 
                  src="/images/about_us/image 2.png" 
                  alt="Ishank Kohli - Thought Leader" 
                  className="rounded-lg shadow-xl w-full h-auto object-cover z-10"
                />
                <div className="bg-highlight absolute bottom-0 right-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform translate-x-4 translate-y-4"></div>
              </div>
            
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">A Thought Leader in Franchising and Business Expansion</h2>
                <div className="w-20 h-1 bg-primary mb-6"></div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Beyond real estate, Ishank Kohli has emerged as a thought leader in the franchising space. With a keen interest in educating entrepreneurs, he is set to launch engaging Hindi reels that demystify the franchising business model in an entertaining yet informative manner.
                </p>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  His content aims to make franchise investments more accessible to aspiring business owners while showcasing lucrative opportunities in the market.
                </p>
                <h3 className="text-xl font-bold text-primary mb-4">A Vision for the Future</h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  With a relentless commitment to growth and innovation, Ishank Kohli continues to expand his influence in the commercial real estate domain. His future plans include scaling Steal Deals' reach to newer geographies and driving awareness around high-return investment opportunities in real estate.
                </p>
                </div>
            </div>
          </div>
        </section>
        
        {/* Office Locations */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-50 rounded-full opacity-30 -ml-32 -mt-16 z-0"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-50 rounded-full opacity-30 -mr-40 -mb-20 z-0"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-1 bg-gray-200"></div>
                <div className="mx-4 text-primary">
                  <FaMapMarkerAlt size={24} />
                </div>
                <div className="w-12 h-1 bg-gray-200"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Offices</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">
                Visit us at our strategic locations across India and UAE
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {offices.map((office, index) => {
                // Assign different accent colors to each office
                const colors = [
                  { bg: "bg-primary/5", border: "border-primary/20", accent: "bg-primary", text: "text-primary" },
                  { bg: "bg-secondary/5", border: "border-secondary/20", accent: "bg-secondary", text: "text-secondary" },
                  { bg: "bg-accent/5", border: "border-accent/20", accent: "bg-accent", text: "text-accent" },
                  { bg: "bg-highlight/10", border: "border-highlight/40", accent: "bg-primary", text: "text-primary" },
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div 
                    key={index} 
                    className={`${color.bg} p-8 rounded-xl shadow-lg border ${color.border} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}
                  >
                    {/* Decorative corner */}
                    <div className={`absolute top-0 right-0 w-16 h-16 ${color.accent} opacity-10 rounded-bl-3xl`}></div>
                    
                    <div className="relative">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full -mt-10 -mr-10 z-0"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/20 rounded-full -mb-8 -ml-6 z-0"></div>
                      
                      <div className="flex flex-col h-full relative z-10">
                        <div className="mb-5">
                          <div className="text-2xl font-bold mb-2 flex items-center text-gray-800">
                            <FaMapMarkerAlt className={`${color.text} mr-3 flex-shrink-0`} size={24} />
                            {office.location}
                          </div>
                          <div className={`w-12 h-0.5 ${color.accent} my-3 opacity-70`}></div>
                        </div>
                        
                        <div className="space-y-4 text-gray-700">
                    <p className="flex items-start">
                            <FaMapMarkerAlt className={`${color.text} mr-3 mt-1 flex-shrink-0`} />
                      <span>{office.address}</span>
                    </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Find Your Next Investment?</h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Whether you're looking for pre-leased properties, commercial plots, or development opportunities, we have the expertise to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="/inventory" 
                  className="bg-white text-[rgb(21,77,113)] hover:bg-white/90 hover:text-[rgb(28,110,164)] px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Browse Properties
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[rgb(21,77,113)] px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 