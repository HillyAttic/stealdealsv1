"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaBuilding, FaHandshake, FaUsers, FaChartLine, FaMapMarkerAlt, FaBriefcase, FaHotel, FaTools, FaRegLightbulb, FaAward, FaLeaf, FaShieldAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Rajiv Sharma',
      position: 'Founder & CEO',
      bio: 'Over 12 years of experience in commercial real estate and investment advisory.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'Priya Verma',
      position: 'Director, Leasing',
      bio: 'Specialist in commercial leasing with 8 years of experience across NCR.',
      image: 'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'Amit Kapoor',
      position: 'Head of Investment Advisory',
      bio: 'Financial analyst with expertise in pre-leased property investments.',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'Neha Singh',
      position: 'Project Development Manager',
      bio: 'Manages turnkey construction projects and builder floor developments.',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  ];
  
  const offices = [
    {
      location: 'Laxmi Nagar Office',
      address: 'C-15, Laxmi Nagar Commercial Complex, Delhi - 110092',
      phone: '+91 9876543210',
      email: 'laxminagar@stealdeals.co.in'
    },
    {
      location: 'Vivek Vihar Office',
      address: 'B-2, Block B, Vivek Vihar Phase 1, Delhi - 110095',
      phone: '+91 9630403080',
      email: 'hello@stealdeals.co.in'
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">About Us</h1>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-blue-100 max-w-3xl mx-auto text-lg">
              Steal Deals - Your trusted partner for real estate investment, leasing, and development
            </p>
          </div>
        </div>
        
        {/* About Company Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">STEAL DEALS</h2>
                <div className="w-20 h-1 bg-blue-900 mb-6"></div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Founded by experienced Real Estate Professionals having over 20 years of combined industry 
                  exposure across RE verticals primarily in Wealth Creation, Leasing and Investments. 
                  We have our offices in Laxmi Nagar and Vivek Vihar, East Delhi.
                </p>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  We provide advisory services in the following corridors: Pre-Leased/Rented Properties 
                  across Delhi, Noida, Ghaziabad and Gurgaon: Banks / Insurance Cos. / Independent Buildings / 
                  Offices / Retail showrooms etc.
                </p>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Commercial and Industrial Plots: Udyog Vihar/Golf Course Road/Infocity/Manesar – Gurgaon, 
                  Sahibabad Industrial Area, Jhilmil/Friends Colony, Patparganj, Faridabad and Noida. Hotel and 
                  Banquet Transactions: Land Acquisition, Project Feasibility, Joint Ventures, Existing Property 
                  leasing etc. Construction and Turnkey Development: Residential Builder floor Construction in 
                  Rajgarh Colony, Krishna Nagar, Project Investment at land stage and floor bookings.
                </p>
                <div className="mt-8">
                  <Link 
                    href="/contact" 
                    className="bg-blue-900 text-white hover:bg-blue-800 px-6 py-3 rounded-md font-medium transition-colors inline-block"
                  >
                    Get In Touch
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-blue-900 absolute top-0 left-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform -translate-x-4 -translate-y-4"></div>
                <img 
                  src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Steal Deals Team" 
                  className="rounded-lg shadow-xl w-full h-auto object-cover z-10"
                />
                <div className="bg-yellow-500 absolute bottom-0 right-0 w-64 h-64 rounded-lg opacity-20 -z-10 transform translate-x-4 translate-y-4"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-900 mb-2">20+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-900 mb-2">300+</div>
                <div className="text-gray-600">Deals Closed</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-900 mb-2">₹500Cr+</div>
                <div className="text-gray-600">Transaction Value</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-900 mb-2">95%</div>
                <div className="text-gray-600">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
              <div className="w-20 h-1 bg-blue-900 mx-auto mb-6"></div>
              <p className="text-gray-600">
                We offer comprehensive real estate solutions across multiple verticals to meet all your property needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaBuilding className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Pre-Leased Properties</h3>
                <p className="text-gray-600 text-center">
                  Banks, insurance companies, independent buildings, offices, and retail showrooms across Delhi, Noida, Ghaziabad, and Gurgaon.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaMapMarkerAlt className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Commercial & Industrial Plots</h3>
                <p className="text-gray-600 text-center">
                  Prime locations in Udyog Vihar, Golf Course Road, Infocity, Manesar, Sahibabad, Jhilmil, Patparganj, Faridabad, and Noida.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaHotel className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Hotel & Banquet Transactions</h3>
                <p className="text-gray-600 text-center">
                  Land acquisition, project feasibility studies, joint ventures, and existing property leasing solutions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <FaTools className="text-blue-900 text-2xl" />
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
              <div className="w-20 h-1 bg-blue-900 mx-auto mb-6"></div>
              <p className="text-gray-600">
                The principles that guide our business operations and client relationships
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaRegLightbulb className="text-yellow-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Expertise & Knowledge</h3>
                <p className="text-gray-600">
                  Our team brings decades of specialized knowledge and market insight to every transaction, ensuring informed decisions.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaAward className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Integrity & Transparency</h3>
                <p className="text-gray-600">
                  We operate with complete transparency, providing honest advice and ensuring clients have all the information they need.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <FaHandshake className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Client-Focused Approach</h3>
                <p className="text-gray-600">
                  We prioritize our clients' needs, tailoring our services to achieve their specific real estate and investment goals.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Leadership Team</h2>
              <div className="w-20 h-1 bg-blue-900 mx-auto mb-6"></div>
              <p className="text-gray-600">
                Meet the experienced professionals who lead our company
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden group">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Office Locations */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Offices</h2>
              <div className="w-20 h-1 bg-blue-900 mx-auto mb-6"></div>
              <p className="text-gray-600">
                Visit us at our convenient locations in East Delhi
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offices.map((office, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{office.location}</h3>
                  <div className="space-y-3 text-gray-600">
                    <p className="flex items-start">
                      <FaMapMarkerAlt className="text-blue-900 mr-3 mt-1" />
                      <span>{office.address}</span>
                    </p>
                    <p className="flex items-start">
                      <FaPhone className="text-blue-900 mr-3 mt-1" />
                      <span>{office.phone}</span>
                    </p>
                    <p className="flex items-start">
                      <FaEnvelope className="text-blue-900 mr-3 mt-1" />
                      <span>{office.email}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Investment?</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Whether you're looking for pre-leased properties, commercial plots, or development opportunities, we have the expertise to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/inventory" 
                  className="bg-white text-blue-900 hover:bg-blue-50 py-3 px-8 rounded-md font-semibold transition-colors"
                >
                  Browse Properties
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-8 rounded-md font-semibold transition-colors"
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