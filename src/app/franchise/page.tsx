"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaChevronDown, FaBuilding, FaMoneyBillWave, FaUsers, FaHandshake, FaStar, FaBriefcase, FaChartLine } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

// Sample franchise data
const franchiseOptions = [
  {
    id: 1,
    title: 'Premium Coffee Shop',
    investment: '₹15-20 Lakhs',
    location: 'Pan India',
    category: 'Food & Beverage',
    returns: '25-30% ROI',
    area: '800-1200 sq ft',
    established: 2015,
    outlets: 45,
    rating: 4.8,
    featured: true,
    image: 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    title: 'Wellness & Fitness Center',
    investment: '₹30-40 Lakhs',
    location: 'Tier 1 & 2 Cities',
    category: 'Health & Fitness',
    returns: '22-28% ROI',
    area: '2000-3000 sq ft',
    established: 2012,
    outlets: 75,
    rating: 4.7,
    featured: true,
    image: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    title: 'Premium Preschool',
    investment: '₹25-35 Lakhs',
    location: 'Metro Cities',
    category: 'Education',
    returns: '20-25% ROI',
    area: '3000-5000 sq ft',
    established: 2010,
    outlets: 120,
    rating: 4.9,
    featured: true,
    image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    title: 'Fast Food Restaurant',
    investment: '₹20-30 Lakhs',
    location: 'Pan India',
    category: 'Food & Beverage',
    returns: '30-35% ROI',
    area: '1000-1500 sq ft',
    established: 2016,
    outlets: 85,
    rating: 4.5,
    featured: false,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 5,
    title: 'Fashion Retail Chain',
    investment: '₹40-50 Lakhs',
    location: 'Metro Cities',
    category: 'Retail',
    returns: '18-24% ROI',
    area: '1500-2500 sq ft',
    established: 2009,
    outlets: 150,
    rating: 4.6,
    featured: false,
    image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 6,
    title: 'Beauty & Spa Salon',
    investment: '₹10-15 Lakhs',
    location: 'Pan India',
    category: 'Beauty & Wellness',
    returns: '25-30% ROI',
    area: '600-1000 sq ft',
    established: 2014,
    outlets: 95,
    rating: 4.7,
    featured: false,
    image: 'https://images.pexels.com/photos/705255/pexels-photo-705255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 7,
    title: 'Home Services & Repairs',
    investment: '₹5-10 Lakhs',
    location: 'Pan India',
    category: 'Services',
    returns: '35-40% ROI',
    area: '300-500 sq ft',
    established: 2018,
    outlets: 60,
    rating: 4.3,
    featured: false,
    image: 'https://images.pexels.com/photos/8486972/pexels-photo-8486972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 8,
    title: 'Digital Marketing Agency',
    investment: '₹8-12 Lakhs',
    location: 'Metro Cities',
    category: 'Services',
    returns: '30-35% ROI',
    area: '500-800 sq ft',
    established: 2017,
    outlets: 30,
    rating: 4.4,
    featured: true,
    image: 'https://images.pexels.com/photos/1447418/pexels-photo-1447418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const FranchiseCard = ({ franchise }: { franchise: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="h-56 relative overflow-hidden">
          <img 
            src={franchise.image} 
            alt={franchise.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {franchise.featured && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              Featured
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-white text-yellow-500 px-2 py-1 rounded-md text-sm font-bold flex items-center">
            <FaStar className="mr-1" />
            {franchise.rating}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-900 transition-colors">
            {franchise.title}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {franchise.category}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          {franchise.location}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <FaMoneyBillWave className="mr-2 text-green-600" />
            <span>{franchise.investment}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FaChartLine className="mr-2 text-green-600" />
            <span>{franchise.returns}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FaBuilding className="mr-2 text-blue-600" />
            <span>{franchise.area}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FaUsers className="mr-2 text-blue-600" />
            <span>{franchise.outlets} Outlets</span>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Link 
            href={`/franchise/${franchise.id}`} 
            className="w-full flex justify-center items-center bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
          >
            <FaHandshake className="mr-2" />
            Request Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function FranchisePage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Be a Franchise Partner</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-8">
              Start your business with India's top brands and become a successful entrepreneur
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link 
                href="#browse-franchises" 
                className="bg-white text-blue-900 hover:bg-blue-50 py-3 px-6 rounded-md font-semibold transition-colors"
              >
                Browse Franchises
              </Link>
              <Link 
                href="#contact-form" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-6 rounded-md font-semibold transition-colors"
              >
                List Your Brand
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
                <div className="text-gray-600">Brand Partners</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">10,000+</div>
                <div className="text-gray-600">Franchise Outlets</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">100+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl font-bold text-blue-900 mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white shadow-md py-6" id="browse-franchises">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search franchises..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
              </div>
              
              <button 
                className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-md w-full md:w-auto"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FaFilter className="mr-2 text-gray-800" />
                <span className="text-gray-800">Filters</span>
                <FaChevronDown className={`ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''} text-gray-800`} />
              </button>
              
              {/* Category Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="">All Categories</option>
                  <option value="food">Food & Beverage</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="health">Health & Fitness</option>
                  <option value="beauty">Beauty & Wellness</option>
                  <option value="services">Services</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
              
              {/* Investment Range Selector */}
              <div className="relative w-full md:w-1/4">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="">Any Investment</option>
                  <option value="0-10">Up to ₹10 Lakhs</option>
                  <option value="10-25">₹10 - ₹25 Lakhs</option>
                  <option value="25-50">₹25 - ₹50 Lakhs</option>
                  <option value="50+">Above ₹50 Lakhs</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
            </div>
            
            {/* Advanced Filters - Shown when expanded */}
            {filterOpen && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any Location</option>
                    <option value="pan-india">Pan India</option>
                    <option value="metro">Metro Cities</option>
                    <option value="tier1">Tier 1 Cities</option>
                    <option value="tier2">Tier 2 Cities</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any Space Requirement</option>
                    <option value="0-500">Up to 500 sq ft</option>
                    <option value="500-1000">500 - 1000 sq ft</option>
                    <option value="1000-2000">1000 - 2000 sq ft</option>
                    <option value="2000+">Above 2000 sq ft</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Any ROI</option>
                    <option value="15-20">15% - 20%</option>
                    <option value="20-30">20% - 30%</option>
                    <option value="30+">Above 30%</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Franchise Listings */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-blue-900">{franchiseOptions.length}</span> Franchise Opportunities
              </h2>
              
              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none text-gray-800">
                  <option value="featured">Featured First</option>
                  <option value="investment-asc">Investment: Low to High</option>
                  <option value="investment-desc">Investment: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {franchiseOptions.map((franchise) => (
                <FranchiseCard key={franchise.id} franchise={franchise} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Form */}
        <section className="py-16 bg-white" id="contact-form">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-lg shadow-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">List Your Brand With Us</h2>
                <p className="text-gray-600">
                  Want to expand your business through franchising? Fill out the form below and our team will get in touch with you.
                </p>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="name">Brand Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="industry">Industry</label>
                    <select 
                      id="industry" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select industry</option>
                      <option value="food">Food & Beverage</option>
                      <option value="retail">Retail</option>
                      <option value="education">Education</option>
                      <option value="health">Health & Fitness</option>
                      <option value="beauty">Beauty & Wellness</option>
                      <option value="services">Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="phone">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Tell us about your franchise opportunity"
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button 
                    type="submit" 
                    className="bg-blue-900 hover:bg-blue-800 text-white py-3 px-8 rounded-md font-semibold transition-colors"
                  >
                    Submit Franchise Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Partner With Us?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide end-to-end support to ensure your franchise business is successful
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaBriefcase className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Business Expertise</h3>
                <p className="text-gray-600">
                  Get guidance from experienced franchise professionals who understand your industry
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaUsers className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Operational Support</h3>
                <p className="text-gray-600">
                  Receive ongoing operational support, training, and resources to run your business
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaChartLine className="text-blue-900 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Marketing Assistance</h3>
                <p className="text-gray-600">
                  Benefit from established brand recognition and marketing strategies
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 