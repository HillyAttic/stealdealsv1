"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaChartLine, FaHandshake, FaMoneyBillWave, FaUserTie, FaSearchDollar, FaFileContract, FaBalanceScale, FaBuilding, FaChartBar, FaClock, FaLock, FaQuestionCircle, FaHome, FaUtensils } from 'react-icons/fa';
import { MdAttachMoney, MdSecurity, MdBusinessCenter, MdAnalytics } from 'react-icons/md';
import { BsFillCalendarCheckFill, BsGraphUp } from 'react-icons/bs';

export default function SellBusiness() {
  const testimonials = [
    {
      quote: "Steal Deals helped me sell my restaurant chain at a premium valuation. Their market knowledge and negotiation skills were invaluable.",
      author: "Rajiv Mehta",
      position: "Former Owner, Spice Garden Restaurants",
      image: "/images/testimonial-1.jpg"
    },
    {
      quote: "The team guided me through every step of selling my manufacturing business. They found the perfect buyer who shared my vision for the company's future.",
      author: "Ananya Sharma",
      position: "CEO, Precision Tools Ltd.",
      image: "/images/testimonial-2.jpg"
    },
    {
      quote: "What impressed me most was their ability to maintain confidentiality while still attracting multiple qualified buyers for my tech startup.",
      author: "Vikram Singh",
      position: "Founder, CloudSphere Technologies",
      image: "/images/testimonial-3.jpg"
    }
  ];

  const processSteps = [
    {
      icon: <FaSearchDollar className="w-10 h-10" />,
      title: "Valuation",
      description: "We conduct a comprehensive valuation of your business using industry-standard methods and market analysis."
    },
    {
      icon: <FaFileContract className="w-10 h-10" />,
      title: "Documentation",
      description: "Our team prepares professional marketing materials and necessary documentation for potential buyers."
    },
    {
      icon: <FaUserTie className="w-10 h-10" />,
      title: "Buyer Matching",
      description: "We identify and connect with qualified buyers from our extensive network while maintaining confidentiality."
    },
    {
      icon: <FaHandshake className="w-10 h-10" />,
      title: "Negotiation",
      description: "Our experienced negotiators work to secure the best possible terms and price for your business."
    },
    {
      icon: <FaBalanceScale className="w-10 h-10" />,
      title: "Due Diligence",
      description: "We guide you through the due diligence process, addressing concerns and facilitating information exchange."
    },
    {
      icon: <MdAttachMoney className="w-10 h-10" />,
      title: "Closing",
      description: "Our team ensures a smooth closing process, from final agreement to funds transfer and ownership transition."
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-blue-800/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/3184603/pexels-photo-3184603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Business Sale"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-blue-300 text-lg mb-4 font-medium tracking-wider">MAXIMIZE YOUR EXIT VALUE</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Sell Your Business at Premium Valuation
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Partner with our expert team to navigate the complex process of selling your business while maximizing its value and ensuring a smooth transition.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Request Valuation
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Sell With Us Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Steal Deals to Sell Your Business?</h2>
              <p className="text-lg text-gray-700">
                We provide comprehensive business selling services tailored to your unique needs, ensuring confidentiality, maximum value, and a smooth transition process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  <MdBusinessCenter className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Industry Expertise</h3>
                <p className="text-gray-700">
                  Our team brings deep industry knowledge across sectors, enabling accurate valuations and access to qualified buyers in your specific market.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  <FaMoneyBillWave className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Maximum Value</h3>
                <p className="text-gray-700">
                  Our proven valuation and marketing strategies consistently result in premium selling prices compared to industry averages.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  <MdSecurity className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confidentiality</h3>
                <p className="text-gray-700">
                  We maintain strict confidentiality throughout the sales process, protecting your business operations and stakeholder relationships.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Business Selling Process</h2>
              <p className="text-lg text-gray-700">
                We follow a structured, proven approach to selling your business that maximizes value while minimizing disruption to your operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <div className="text-blue-600 mb-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-bold text-blue-200">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-blue-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">₹250Cr+</div>
                <p className="text-xl opacity-80">Transaction Value</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">98%</div>
                <p className="text-xl opacity-80">Success Rate</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">150+</div>
                <p className="text-xl opacity-80">Businesses Sold</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">12+</div>
                <p className="text-xl opacity-80">Industries Served</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Industries Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Industries We Serve</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <FaBuilding className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Real Estate</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <FaUtensils className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Restaurants</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <MdBusinessCenter className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Retail</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <FaChartBar className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Technology</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <FaHome className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Manufacturing</h3>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <FaUserTie className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold">Services</h3>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                  <div className="flex items-center mb-6">
                    <div className="text-yellow-400 text-2xl">★★★★★</div>
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden mr-4 bg-gray-200">
                      <Image 
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600">{testimonial.position}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">How long does it typically take to sell a business?</h3>
                  <p className="text-gray-700">
                    While each business sale is unique, our average transaction time is 6-9 months from initial valuation to closing. Factors affecting timeline include industry, business size, market conditions, and deal complexity.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">How do you maintain confidentiality during the sale process?</h3>
                  <p className="text-gray-700">
                    We implement strict confidentiality measures including NDAs with all potential buyers, blind business profiles, controlled information release, and vetting of buyers before disclosing sensitive information.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">What factors affect my business valuation?</h3>
                  <p className="text-gray-700">
                    Key valuation factors include financial performance (revenue, profitability), growth trends, customer diversity, industry outlook, proprietary assets, management team strength, and market competition.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Can I continue running my business during the sale process?</h3>
                  <p className="text-gray-700">
                    Yes, and it's essential that you do. Maintaining or improving business performance during the sale process helps preserve and potentially increase the final selling price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Explore Selling Your Business?</h2>
              <p className="text-xl mb-10 opacity-90">
                Schedule a confidential consultation with our expert team to discuss your goals and options.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl border border-white/20">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white placeholder-white/60"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white placeholder-white/60"
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
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white placeholder-white/60"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium mb-1">Business Industry</label>
                      <select
                        id="industry"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white"
                      >
                        <option value="" className="bg-blue-800">Select your industry</option>
                        <option value="retail" className="bg-blue-800">Retail</option>
                        <option value="manufacturing" className="bg-blue-800">Manufacturing</option>
                        <option value="technology" className="bg-blue-800">Technology</option>
                        <option value="food" className="bg-blue-800">Restaurant/Food</option>
                        <option value="services" className="bg-blue-800">Services</option>
                        <option value="real-estate" className="bg-blue-800">Real Estate</option>
                        <option value="other" className="bg-blue-800">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="revenue" className="block text-sm font-medium mb-1">Annual Revenue (Approximate)</label>
                    <select
                      id="revenue"
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white"
                    >
                      <option value="" className="bg-blue-800">Select revenue range</option>
                      <option value="under-1cr" className="bg-blue-800">Under ₹1 Crore</option>
                      <option value="1-5cr" className="bg-blue-800">₹1-5 Crore</option>
                      <option value="5-10cr" className="bg-blue-800">₹5-10 Crore</option>
                      <option value="10-50cr" className="bg-blue-800">₹10-50 Crore</option>
                      <option value="50-100cr" className="bg-blue-800">₹50-100 Crore</option>
                      <option value="over-100cr" className="bg-blue-800">Over ₹100 Crore</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Additional Information</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-blue-300 focus:border-blue-300 text-white placeholder-white/60"
                      placeholder="Tell us briefly about your business and your goals for selling"
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      Request Consultation
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