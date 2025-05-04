"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaChartLine, FaBullhorn, FaChartBar, FaRegLightbulb, FaUsers, FaGlobe, FaMobileAlt, FaDesktop, FaTabletAlt, FaNewspaper, FaRegHandshake, FaCheckCircle, FaPaintBrush, FaSearchDollar, FaStore, FaUtensils, FaHome } from 'react-icons/fa';
import { MdCampaign, MdOutlineAnalytics, MdGpsFixed, MdRadar, MdOutlineRateReview, MdBusinessCenter } from 'react-icons/md';
import { BsGraphUp, BsMegaphone, BsBroadcast } from 'react-icons/bs';
import { TbTarget } from 'react-icons/tb';
import { HiOutlineSpeakerphone } from 'react-icons/hi';

export default function Advertise() {
  const adChannels = [
    {
      title: "Digital Display",
      description: "Visually engaging ads displayed across premium websites, mobile apps, and social media platforms",
      icon: <FaDesktop className="w-10 h-10" />
    },
    {
      title: "Search Marketing",
      description: "Targeted ads appearing on search engines when users look for relevant terms and services",
      icon: <FaSearchDollar className="w-10 h-10" />
    },
    {
      title: "Social Media",
      description: "Native advertisements and sponsored content across all major social platforms",
      icon: <FaUsers className="w-10 h-10" />
    },
    {
      title: "Mobile Advertising",
      description: "Location-based and in-app advertising solutions targeting mobile users",
      icon: <FaMobileAlt className="w-10 h-10" />
    },
    {
      title: "Content Marketing",
      description: "Sponsored articles, blogs, and native content that engage and inform your target audience",
      icon: <FaNewspaper className="w-10 h-10" />
    },
    {
      title: "Video Campaigns",
      description: "Compelling video advertisements for streaming platforms and social media channels",
      icon: <BsBroadcast className="w-10 h-10" />
    }
  ];

  const adProcess = [
    {
      title: "Strategy Development",
      description: "We develop a customized advertising strategy based on your business goals, target audience, and budget.",
      icon: <FaRegLightbulb className="w-8 h-8" />
    },
    {
      title: "Creative Production",
      description: "Our team creates compelling ad creatives that capture attention and communicate your key messages.",
      icon: <FaPaintBrush className="w-8 h-8" />
    },
    {
      title: "Audience Targeting",
      description: "We identify and target your ideal customers using advanced demographic and behavioral data.",
      icon: <TbTarget className="w-8 h-8" />
    },
    {
      title: "Campaign Launch",
      description: "Your campaigns are deployed across selected channels with optimal timing and frequency.",
      icon: <MdCampaign className="w-8 h-8" />
    },
    {
      title: "Performance Monitoring",
      description: "Real-time tracking and optimization ensures your campaigns consistently deliver results.",
      icon: <MdOutlineAnalytics className="w-8 h-8" />
    },
    {
      title: "Reporting & Insights",
      description: "Comprehensive analytics and actionable insights to improve future campaign performance.",
      icon: <BsGraphUp className="w-8 h-8" />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-amber-700/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/7484818/pexels-photo-7484818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Advertising"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-amber-300 text-lg mb-4 font-medium tracking-wider">AMPLIFY YOUR REACH</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Strategic Advertising Solutions That Drive Results
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Connect with your target audience through data-driven campaigns that increase brand awareness, engagement, and conversions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Get Started
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  View Services
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Advertise With Us?</h2>
              <p className="text-lg text-gray-700">
                Our data-driven approach and industry expertise enable us to craft advertising campaigns that deliver measurable results and exceptional ROI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
                  <MdGpsFixed className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Precision Targeting</h3>
                <p className="text-gray-700">
                  Reach your ideal customers with advanced targeting based on demographics, behavior, interests, and purchase intent.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
                  <BsGraphUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Measurable Results</h3>
                <p className="text-gray-700">
                  Track campaign performance in real-time with comprehensive analytics and transparent reporting on key metrics.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
                  <FaRegHandshake className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Full-Service Approach</h3>
                <p className="text-gray-700">
                  From strategy development to creative production and campaign optimization, we handle every aspect of your advertising needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advertising Channels Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Advertising Channels</h2>
              <p className="text-lg text-gray-700">
                We offer a comprehensive range of advertising solutions across digital and traditional media to help you reach your target audience wherever they are.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adChannels.map((channel, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <div className="text-amber-600 mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                      {channel.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{channel.title}</h3>
                  <p className="text-gray-700">{channel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-amber-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">500+</div>
                <p className="text-xl opacity-80">Successful Campaigns</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">94%</div>
                <p className="text-xl opacity-80">Client Satisfaction</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">40M+</div>
                <p className="text-xl opacity-80">Monthly Impressions</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">18+</div>
                <p className="text-xl opacity-80">Industries Served</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Process Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Advertising Process</h2>
              <p className="text-lg text-gray-700">
                We follow a proven, data-driven approach to create and optimize advertising campaigns that consistently deliver results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {adProcess.map((step, index) => (
                <div key={index} className="flex">
                  <div className="mr-5">
                    <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full text-amber-600">
                      {step.icon}
                    </div>
                    <div className="h-full w-0.5 bg-amber-100 mx-auto mt-4 hidden md:block"></div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-amber-600 font-bold text-xl mr-2">{index + 1}.</span>
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-700 mt-3">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Industries Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Industries We Serve</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <FaStore className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Retail</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <FaUtensils className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Food & Beverage</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <MdBusinessCenter className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Business Services</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <FaHome className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Real Estate</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <FaUsers className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Education</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-amber-600 mb-4 flex justify-center">
                  <FaRegLightbulb className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Technology</h3>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Client Success Stories</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 shadow-md">
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-2xl">★★★★★</div>
                  <div className="ml-4">
                    <MdOutlineRateReview className="text-amber-600 w-8 h-8" />
                  </div>
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "Their strategic approach to our digital advertising helped us achieve a 215% increase in qualified leads while reducing our cost per acquisition by 43%. The team's attention to detail and continuous optimization made all the difference."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-amber-700 font-bold">RS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Rohit Sharma</h4>
                    <p className="text-sm text-gray-600">Marketing Director, TechVision Solutions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 shadow-md">
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-2xl">★★★★★</div>
                  <div className="ml-4">
                    <MdOutlineRateReview className="text-amber-600 w-8 h-8" />
                  </div>
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "We've worked with several advertising agencies before, but none delivered results like Steal Deals. Their multi-channel campaign increased our brand awareness by 78% and drove a 32% increase in sales during what is typically our slow season."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-amber-700 font-bold">PK</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Priya Kumar</h4>
                    <p className="text-sm text-gray-600">CEO, Elegance Home Furnishings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Flexible Advertising Packages</h2>
              <p className="text-lg text-gray-700">
                Choose from our range of advertising packages or let us create a custom solution tailored to your specific business goals and budget.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-xl">
                <div className="p-8 bg-amber-50 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">₹25,000</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="mt-4 text-gray-600">Perfect for small businesses looking to establish a digital presence</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Social media advertising</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Google Search campaigns</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Basic ad creative design</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Monthly performance reporting</span>
                    </li>
                  </ul>
                  <button className="w-full mt-8 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition duration-300">
                    Get Started
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-200 transition duration-300 hover:shadow-xl relative transform scale-105 z-10">
                <div className="absolute top-0 right-0 bg-amber-600 text-white py-1 px-4 text-sm font-medium">
                  POPULAR
                </div>
                <div className="p-8 bg-amber-50 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">₹75,000</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="mt-4 text-gray-600">Ideal for growing businesses looking to expand market reach</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">All Starter features</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Display advertising network</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Premium ad creative design</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Remarketing campaigns</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Weekly performance reporting</span>
                    </li>
                  </ul>
                  <button className="w-full mt-8 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition duration-300">
                    Get Started
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-xl">
                <div className="p-8 bg-amber-50 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">₹1,50,000</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="mt-4 text-gray-600">Comprehensive solution for established businesses with aggressive growth goals</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">All Growth features</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Video advertising campaigns</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Programmatic advertising</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Advanced audience targeting</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">Custom analytics dashboard</span>
                    </li>
                  </ul>
                  <button className="w-full mt-8 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition duration-300">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
            
            <div className="max-w-xl mx-auto text-center mt-12">
              <p className="text-gray-700">
                Need a custom solution? 
                <button className="text-amber-600 hover:text-amber-700 font-medium ml-2">
                  Contact us for a tailored quote.
                </button>
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-amber-700 to-orange-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Amplify Your Brand's Reach?</h2>
              <p className="text-xl mb-10 opacity-90">
                Get in touch with our team to discuss your advertising goals and how we can help you achieve them.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl border border-white/20">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-amber-300 focus:border-amber-300 text-white placeholder-white/60"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-amber-300 focus:border-amber-300 text-white placeholder-white/60"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-1">Company</label>
                      <input
                        type="text"
                        id="company"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-amber-300 focus:border-amber-300 text-white placeholder-white/60"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium mb-1">Monthly Budget</label>
                      <select
                        id="budget"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-amber-300 focus:border-amber-300 text-white"
                      >
                        <option value="" className="bg-amber-800">Select budget range</option>
                        <option value="25k-50k" className="bg-amber-800">₹25,000 - ₹50,000</option>
                        <option value="50k-1L" className="bg-amber-800">₹50,000 - ₹1,00,000</option>
                        <option value="1L-2L" className="bg-amber-800">₹1,00,000 - ₹2,00,000</option>
                        <option value="2L+" className="bg-amber-800">₹2,00,000+</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="goals" className="block text-sm font-medium mb-1">Advertising Goals</label>
                    <textarea
                      id="goals"
                      rows={4}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-amber-300 focus:border-amber-300 text-white placeholder-white/60"
                      placeholder="Describe your advertising objectives and target audience"
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-white text-amber-700 hover:bg-amber-50 font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      Request Proposal
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