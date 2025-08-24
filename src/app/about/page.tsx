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
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-r from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-6">About Us</h1>
              <div className="w-24 h-1 bg-white/30 mx-auto mb-6"></div>
              <p className="text-white/80 max-w-3xl mx-auto text-lg">
                Steal Deals - Your trusted partner for real estate investment, leasing, and development
              </p>
            </div>
          </div>
        </section>
        
        {/* About Company Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">STEAL DEALS</h2>
                <div className="w-20 h-1 bg-primary mb-6"></div>
                <h3 className="text-xl font-bold text-primary mb-4">Empowering Investments. Enabling Growth.</h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Steal Deals is a modern-day commercial real estate and franchise
                  consulting firm that bridges the gap between aspiration and execution. With a sharp focus on
                  franchise expansion and leasing solutions, we empower individuals and businesses to unlock
                  long-term income opportunities through strategic investments and partnerships.
                </p>
                <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                  At our core, we specialize in:
                </p>
                <ul className="text-gray-600 mb-6 text-lg leading-relaxed list-disc pl-6">
                  <li className="mb-2">
                    <span className="font-semibold">Franchise Consulting</span> - Helping you invest in and grow top-performing franchises across India,
                    whether in retail, food & beverage, or emerging sectors.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">Leasing Solutions</span> - Curating the perfect spaces for national and regional brands, ensuring
                    high-visibility, high-footfall locations across urban markets.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">Real Estate Investments</span> - Offering handpicked pre-leased commercial assets and plots
                    (residential, commercial, industrial) in Delhi NCR that ensure stable, long-term returns.
                  </li>
                </ul>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Whether you're a first-time investor exploring alternative income streams or an established
                  entrepreneur looking to diversify your portfolio, Steal Deals is your trusted partner in navigating the
                  world of commercial growth.
                </p>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  We don't just close transactions - we build ecosystems where brands thrive, landlords profit, and
                  investors flourish.
                </p>
                <div className="mt-8">
                  <Link 
                    href="/contact" 
                    className="bg-primary text-white hover:bg-secondary px-6 py-3 rounded-md font-medium transition-colors inline-block"
                  >
                    Get In Touch
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-primary absolute top-0 left-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform -translate-x-4 -translate-y-4"></div>
                <img 
                  src="/images/about_us/ishank kohli (1).png" 
                  alt="Ishank Kohli - Thought Leader" 
                  className="rounded-lg shadow-xl w-full h-auto object-cover z-10"
                />
                <div className="bg-highlight absolute bottom-0 right-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform translate-x-4 translate-y-4"></div>
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
        
        {/* Recognition Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Industry Recognition</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600">
                Steal Deals has been honored as one of the Top Consultants for leading developers across India
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaBuilding className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Hero Homes</h3>
                <p className="text-gray-600 text-center">
                  Recognized as a trusted consultant partner for premium residential projects
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaLeaf className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Hero Earth</h3>
                <p className="text-gray-600 text-center">
                  Top consultant for sustainable and eco-friendly development projects
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all">
                <div className="bg-accent-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaBuilding className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Spaze Group</h3>
                <p className="text-gray-600 text-center">
                  Preferred partner for commercial and mixed-use developments in the NCR region
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all">
                <div className="bg-highlight/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaBuilding className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Omaxe Group</h3>
                <p className="text-gray-600 text-center">
                  Trusted consultant for residential and commercial projects across multiple cities
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600">
                We offer comprehensive real estate solutions across multiple verticals to meet all your property needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaBuilding className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Pre-Leased Properties</h3>
                <p className="text-gray-600 text-center">
                  Banks, insurance companies, independent buildings, offices, and retail showrooms across Delhi, Noida, Ghaziabad, and Gurgaon.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaMapMarkerAlt className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Commercial & Industrial Plots</h3>
                <p className="text-gray-600 text-center">
                  Prime locations in Udyog Vihar, Golf Course Road, Infocity, Manesar, Sahibabad, Jhilmil, Patparganj, Faridabad, and Noida.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-accent-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaHotel className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Hotel & Banquet Transactions</h3>
                <p className="text-gray-600 text-center">
                  Land acquisition, project feasibility studies, joint ventures, and existing property leasing solutions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-highlight/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaTools className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Construction & Development</h3>
                <p className="text-gray-600 text-center">
                  Residential builder floor construction in Rajgarh Colony, Krishna Nagar, with investment opportunities at land stage and floor bookings.
                </p>
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
        <section className="py-16 bg-gradient-to-r from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Investment?</h2>
              <p className="text-white/80 mb-8 text-lg">
                Whether you're looking for pre-leased properties, commercial plots, or development opportunities, we have the expertise to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/inventory" 
                  className="bg-white text-[rgb(21,77,113)] hover:bg-white/90 hover:text-[rgb(28,110,164)] py-3 px-8 rounded-md font-semibold transition-all duration-300"
                >
                  Browse Properties
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[rgb(21,77,113)] py-3 px-8 rounded-md font-semibold transition-all duration-300"
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