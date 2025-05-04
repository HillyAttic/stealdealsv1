"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaCheckCircle, FaFileContract, FaHandshake, FaChartLine, FaShieldAlt, FaGlobe, FaTshirt, FaUtensils, FaHome, FaShoppingBag, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaRegLightbulb, FaClipboardCheck } from 'react-icons/fa';
import { MdSecurity, MdAttachMoney, MdOutlineAssessment } from 'react-icons/md';
import { BsFillBriefcaseFill } from 'react-icons/bs';
import { GiClothes, GiHamburger } from 'react-icons/gi';
import { IoMdHome } from 'react-icons/io';
import { RiBook2Fill } from 'react-icons/ri';

export default function BrandLicense() {
  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="/images/licensing-hero.jpg" 
              alt="Brand Licensing"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Brand Licensing Solutions</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Expand your brand's reach and create new revenue streams through strategic licensing partnerships
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                Get Started
              </button>
              <button className="bg-white hover:bg-gray-100 text-indigo-700 font-semibold py-3 px-6 rounded-lg transition duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>
        
        {/* Introduction Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Your Brand, New Markets</h2>
              <p className="text-lg text-gray-700 mb-8">
                At Steal Deals, we specialize in developing tailored brand licensing strategies that 
                extend your brand's influence while generating new revenue opportunities. Our approach focuses 
                on finding the perfect partnership match that maintains brand integrity while reaching new audiences.
              </p>
              <div className="border-t border-gray-200 w-24 mx-auto pt-6">
                <p className="text-indigo-600 font-semibold">TRUSTED BY LEADING BRANDS</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Benefits of Brand Licensing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-indigo-600 mb-4">
                  <MdAttachMoney className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-3">New Revenue Streams</h3>
                <p className="text-gray-700">
                  Create additional income without the overhead costs of developing new product lines internally.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-indigo-600 mb-4">
                  <FaGlobe className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Market Expansion</h3>
                <p className="text-gray-700">
                  Reach new geographical markets and customer segments through strategic partnerships.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-indigo-600 mb-4">
                  <FaChartLine className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Brand Growth</h3>
                <p className="text-gray-700">
                  Increase brand visibility and awareness by extending into complementary product categories.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-indigo-600 mb-4">
                  <MdSecurity className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Reduced Risk</h3>
                <p className="text-gray-700">
                  Minimize financial risk by leveraging licensees' manufacturing and distribution expertise.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Process Section */}
        <section className="py-16 bg-indigo-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Licensing Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                <div className="p-6">
                  <div className="text-indigo-600 mb-4 flex justify-center">
                    <MdOutlineAssessment className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Brand Assessment</h3>
                  <p className="text-gray-700">
                    We evaluate your brand's strengths, values, and potential for licensing opportunities.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                <div className="p-6">
                  <div className="text-indigo-600 mb-4 flex justify-center">
                    <FaRegLightbulb className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Strategy Development</h3>
                  <p className="text-gray-700">
                    Creating a tailored licensing roadmap aligned with your brand goals and market opportunities.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                <div className="p-6">
                  <div className="text-indigo-600 mb-4 flex justify-center">
                    <FaHandshake className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Partner Matching</h3>
                  <p className="text-gray-700">
                    Identifying and vetting potential licensees that align with your brand values and quality standards.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
                <div className="p-6">
                  <div className="text-indigo-600 mb-4 flex justify-center">
                    <FaClipboardCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Agreement & Launch</h3>
                  <p className="text-gray-700">
                    Negotiating favorable terms, finalizing agreements, and supporting successful product launches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Industries Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Industries We Serve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <GiHamburger className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Food & Beverage</h3>
                <p className="text-gray-700">
                  Extend your culinary brand through packaged products, restaurant concepts, and kitchen accessories.
                </p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <GiClothes className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fashion & Apparel</h3>
                <p className="text-gray-700">
                  Expand your fashion brand through new product categories, accessories, and international markets.
                </p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <IoMdHome className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Home & Decor</h3>
                <p className="text-gray-700">
                  Bring your aesthetic to home furnishings, décor items, and lifestyle products.
                </p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <BsFillBriefcaseFill className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Business Services</h3>
                <p className="text-gray-700">
                  License your business methodology, training programs, or proprietary systems.
                </p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <RiBook2Fill className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Education & Publishing</h3>
                <p className="text-gray-700">
                  Extend your educational content through various formats and international adaptations.
                </p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4">
                  <FaHandshake className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Hospitality</h3>
                <p className="text-gray-700">
                  License your hospitality concept for hotels, resorts, and experience-based ventures.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Ready to Explore Licensing Opportunities?</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about your licensing needs and interests"
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 