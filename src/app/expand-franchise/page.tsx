"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaChartLine, FaHandshake, FaGlobe, FaMapMarkedAlt, FaStore, FaCogs, FaUsers, FaFileContract, FaChartBar, FaRegLightbulb, FaShieldAlt, FaCheckCircle, FaHome, FaUtensils } from 'react-icons/fa';
import { MdBusinessCenter, MdGroups, MdOutlineStorefront, MdSupportAgent } from 'react-icons/md';
import { BsFillPatchCheckFill, BsGraphUp, BsBuildingFill } from 'react-icons/bs';
import { HiCubeTransparent } from 'react-icons/hi';

export default function ExpandFranchise() {
  const franchiseModels = [
    {
      title: "Single-Unit Franchise",
      description: "Operate a single franchise location with exclusive territory rights and complete operational control.",
      icon: <MdOutlineStorefront className="w-10 h-10" />
    },
    {
      title: "Multi-Unit Development",
      description: "Secure rights to develop multiple franchise units across a designated territory within a specified timeframe.",
      icon: <BsBuildingFill className="w-10 h-10" />
    },
    {
      title: "Area Development",
      description: "Gain exclusive rights to develop and operate all franchise units within a specified geographic area.",
      icon: <FaMapMarkedAlt className="w-10 h-10" />
    },
    {
      title: "Master Franchise",
      description: "Acquire rights to sub-franchise within a territory, earning revenue from both unit operations and franchise sales.",
      icon: <FaGlobe className="w-10 h-10" />
    }
  ];

  const expansionSteps = [
    {
      title: "Market Analysis",
      description: "Comprehensive market research to identify optimal expansion locations and target demographics.",
      icon: <FaChartBar className="w-8 h-8" />
    },
    {
      title: "Business Model Optimization",
      description: "Refining your franchise model for scalability, profitability, and operational efficiency.",
      icon: <FaCogs className="w-8 h-8" />
    },
    {
      title: "Legal Documentation",
      description: "Development of compliant franchise disclosure documents and agreements tailored to your business.",
      icon: <FaFileContract className="w-8 h-8" />
    },
    {
      title: "Franchisee Recruitment",
      description: "Strategic recruitment and vetting of qualified franchisees who align with your brand vision.",
      icon: <FaUsers className="w-8 h-8" />
    },
    {
      title: "Training & Support Systems",
      description: "Creating comprehensive training programs and ongoing support infrastructure for franchisees.",
      icon: <MdSupportAgent className="w-8 h-8" />
    },
    {
      title: "Growth Management",
      description: "Strategic oversight of expansion to ensure sustainable growth and brand consistency.",
      icon: <BsGraphUp className="w-8 h-8" />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-800/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Franchise Expansion"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-purple-300 text-lg mb-4 font-medium tracking-wider">SCALE YOUR BUSINESS</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Expand Your Business Through Franchising
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Transform your successful business model into a thriving franchise network with our proven expansion strategies and comprehensive support.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Schedule Consultation
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Franchise Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Expand Through Franchising?</h2>
              <p className="text-lg text-gray-700">
                Franchising offers a capital-efficient pathway to rapid business expansion while maintaining brand integrity and creating multiple revenue streams.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                  <FaChartLine className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Accelerated Growth</h3>
                <p className="text-gray-700">
                  Expand your business footprint rapidly across multiple locations while leveraging franchisee capital and local market expertise.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                  <MdGroups className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Motivated Operators</h3>
                <p className="text-gray-700">
                  Franchisees invest their own capital and are highly motivated to succeed, typically outperforming company-owned locations.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                  <HiCubeTransparent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Revenue Streams</h3>
                <p className="text-gray-700">
                  Generate income through franchise fees, ongoing royalties, supply chain markups, and other franchise-related services.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Franchise Models Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Franchise Expansion Models</h2>
              <p className="text-lg text-gray-700">
                We design customized franchise programs tailored to your specific business model, growth objectives, and target markets.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {franchiseModels.map((model, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex">
                  <div className="text-indigo-600 mr-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      {model.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{model.title}</h3>
                    <p className="text-gray-700">{model.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Approach Section */}
        <section className="py-20 bg-indigo-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Franchise Development Approach</h2>
              <p className="text-lg opacity-90">
                We implement a proven, systematic methodology to transform your business into a successful franchise operation while preserving your unique brand identity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {expansionSteps.map((step, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20 hover:bg-white/15 transition duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-700 rounded-full flex items-center justify-center mr-4 text-white">
                      {step.icon}
                    </div>
                    <span className="text-2xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="opacity-80">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Success Indicators Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-8">
                <div className="text-5xl font-bold text-indigo-600 mb-3">200+</div>
                <p className="text-xl text-gray-700">Franchise Systems Developed</p>
              </div>
              <div className="p-8">
                <div className="text-5xl font-bold text-indigo-600 mb-3">₹500Cr+</div>
                <p className="text-xl text-gray-700">Generated in Franchise Sales</p>
              </div>
              <div className="p-8">
                <div className="text-5xl font-bold text-indigo-600 mb-3">92%</div>
                <p className="text-xl text-gray-700">Franchisee Success Rate</p>
              </div>
              <div className="p-8">
                <div className="text-5xl font-bold text-indigo-600 mb-3">15+</div>
                <p className="text-xl text-gray-700">Years of Expertise</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Industries Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Industries We Serve</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <FaStore className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Retail</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <FaUtensils className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Food & Beverage</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <MdBusinessCenter className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Business Services</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <FaHome className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Home Services</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <FaUsers className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Education</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  <FaRegLightbulb className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Innovation & Tech</h3>
              </div>
            </div>
          </div>
        </section>
        
        {/* Client Success Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Client Success Stories</h2>
              
              <div className="mb-16 bg-gray-50 rounded-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                <div className="sm:flex items-start">
                  <div className="mb-6 sm:mb-0 sm:mr-8 flex-shrink-0">
                    <div className="w-20 h-20 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FaStore className="w-10 h-10 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Urban Brew Coffee</h3>
                    <p className="text-gray-700 mb-4">
                      From a single location to 38 franchised stores across India in just 4 years. Our franchise development program helped Urban Brew standardize operations, build a compelling franchise offering, and create a rigorous franchisee selection process.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">38 Units</span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">4 Years</span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Food & Beverage</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-yellow-400 text-sm mr-2">★★★★★</div>
                      <p className="text-gray-500 text-sm">"The franchise expansion program transformed our business. The team's expertise was invaluable in helping us scale rapidly while maintaining quality."</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                <div className="sm:flex items-start">
                  <div className="mb-6 sm:mb-0 sm:mr-8 flex-shrink-0">
                    <div className="w-20 h-20 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <MdBusinessCenter className="w-10 h-10 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">QuickFix Home Services</h3>
                    <p className="text-gray-700 mb-4">
                      We helped this home services company develop a franchise system that now spans 25 cities with 120+ franchise territories. Their streamlined operations model and comprehensive training program have achieved a 94% franchisee satisfaction rate.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">120+ Territories</span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">25 Cities</span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Home Services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-yellow-400 text-sm mr-2">★★★★★</div>
                      <p className="text-gray-500 text-sm">"Their franchise development expertise helped us create a scalable model that attracts quality franchisees and delivers consistent results across all locations."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Is my business suitable for franchising?</h3>
                  <p className="text-gray-700">
                    Ideal franchise candidates have a proven business model, strong brand identity, systematized operations, healthy profitability, and potential for geographic expansion. Our assessment process helps determine if franchising is the right growth strategy for your business.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">How long does it take to launch a franchise program?</h3>
                  <p className="text-gray-700">
                    Developing a comprehensive franchise program typically takes 4-6 months, including legal documentation, operations manuals, training programs, and marketing materials. The timeline can vary based on your business complexity and readiness.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">What legal requirements must be met for franchising?</h3>
                  <p className="text-gray-700">
                    In India, franchisors must comply with various regulations including the Indian Contract Act, Intellectual Property laws, and specific industry regulations. Our legal experts ensure your franchise documentation meets all compliance requirements.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">How do you help attract quality franchisees?</h3>
                  <p className="text-gray-700">
                    We develop comprehensive franchisee recruitment strategies including ideal candidate profiles, targeted marketing campaigns, qualification processes, and discovery day protocols to ensure you attract franchisees who align with your brand values and business objectives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business Into a Franchise Empire?</h2>
              <p className="text-xl mb-10 opacity-90">
                Schedule a free franchise feasibility consultation with our expert team to discuss your business and expansion goals.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl border border-white/20">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white placeholder-white/60"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white placeholder-white/60"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white placeholder-white/60"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium mb-1">Business Type</label>
                      <select
                        id="businessType"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white"
                      >
                        <option value="" className="bg-indigo-800">Select business type</option>
                        <option value="retail" className="bg-indigo-800">Retail</option>
                        <option value="restaurant" className="bg-indigo-800">Restaurant/Food Service</option>
                        <option value="services" className="bg-indigo-800">Service Business</option>
                        <option value="education" className="bg-indigo-800">Education/Training</option>
                        <option value="technology" className="bg-indigo-800">Technology/Innovation</option>
                        <option value="other" className="bg-indigo-800">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="businessStage" className="block text-sm font-medium mb-1">Current Business Stage</label>
                    <select
                      id="businessStage"
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white"
                    >
                      <option value="" className="bg-indigo-800">Select current stage</option>
                      <option value="single-unit" className="bg-indigo-800">Single Location</option>
                      <option value="multi-unit" className="bg-indigo-800">Multiple Company-owned Locations</option>
                      <option value="early-franchise" className="bg-indigo-800">Early-stage Franchise (1-5 units)</option>
                      <option value="established" className="bg-indigo-800">Established Franchise</option>
                      <option value="concept" className="bg-indigo-800">Concept Stage</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Tell Us About Your Business</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-purple-300 focus:border-purple-300 text-white placeholder-white/60"
                      placeholder="Brief description of your business and franchise expansion goals"
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      Request Franchise Consultation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 