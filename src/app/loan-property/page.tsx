"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaHome, FaChartLine, FaMoneyBillWave, FaCalculator, FaRegFileAlt, FaCheck, FaShieldAlt, FaClock, FaPercentage, FaHandshake, FaBuilding, FaRegLightbulb, FaChartBar, FaCity } from 'react-icons/fa';
import { MdAttachMoney, MdBusinessCenter, MdShowChart, MdAccountBalance, MdCompareArrows, MdOutlineAssignment } from 'react-icons/md';
import { BsGraphUp, BsCashCoin, BsBuildingCheck, BsBank } from 'react-icons/bs';
import { HiDocumentText, HiCurrencyRupee } from 'react-icons/hi';
import { GiReceiveMoney, GiPayMoney } from 'react-icons/gi';

export default function LoanProperty() {
  const loanTypes = [
    {
      title: "Home Loans",
      description: "Financing solutions for purchasing, constructing or renovating residential properties with competitive interest rates and flexible repayment options.",
      icon: <FaHome className="w-10 h-10" />
    },
    {
      title: "Commercial Property Loans",
      description: "Tailored financial solutions for businesses looking to purchase office spaces, retail outlets, warehouses, and other commercial properties.",
      icon: <MdBusinessCenter className="w-10 h-10" />
    },
    {
      title: "Construction Loans",
      description: "Specialized funding for new construction projects with milestone-based disbursements and conversion options to long-term mortgages.",
      icon: <FaBuilding className="w-10 h-10" />
    },
    {
      title: "Land Purchase Loans",
      description: "Financing for acquiring land for future development or investment with specialized terms suited for undeveloped properties.",
      icon: <FaCity className="w-10 h-10" />
    },
    {
      title: "Property Refinancing",
      description: "Options to refinance existing property loans to secure better interest rates, lower monthly payments, or access equity.",
      icon: <MdCompareArrows className="w-10 h-10" />
    },
    {
      title: "Loan Against Property",
      description: "Leverage your existing property to secure funds for personal or business needs with attractive loan-to-value ratios.",
      icon: <GiReceiveMoney className="w-10 h-10" />
    }
  ];

  const applicationSteps = [
    {
      title: "Initial Consultation",
      description: "Discuss your financial needs and property requirements with our loan experts who will guide you through available options.",
      icon: <FaHandshake className="w-8 h-8" />
    },
    {
      title: "Documentation Preparation",
      description: "Compile necessary documents including income proof, property details, and identification papers for loan processing.",
      icon: <HiDocumentText className="w-8 h-8" />
    },
    {
      title: "Property Evaluation",
      description: "Our team conducts a thorough assessment of the property to determine its market value and loan eligibility.",
      icon: <BsBuildingCheck className="w-8 h-8" />
    },
    {
      title: "Credit Assessment",
      description: "Comprehensive evaluation of your credit history, income stability, and repayment capacity for appropriate loan structuring.",
      icon: <MdShowChart className="w-8 h-8" />
    },
    {
      title: "Loan Approval",
      description: "Receive your customized loan offer with detailed terms, conditions, and repayment schedule for your consideration.",
      icon: <MdOutlineAssignment className="w-8 h-8" />
    },
    {
      title: "Disbursement",
      description: "After agreement signing and legal verification, funds are transferred according to the disbursement schedule.",
      icon: <GiPayMoney className="w-8 h-8" />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-emerald-700/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Property Financing"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-green-300 text-lg mb-4 font-medium tracking-wider">PROPERTY FINANCING SOLUTIONS</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Unlock Your Property Investment Potential
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Tailored property financing solutions with competitive rates, flexible terms, and personalized service to help you achieve your real estate goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Apply Now
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Calculate EMI
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Our Property Loans?</h2>
              <p className="text-lg text-gray-700">
                Experience the advantage of working with a lender committed to providing transparent, flexible, and customer-focused property financing solutions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                  <FaPercentage className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Competitive Interest Rates</h3>
                <p className="text-gray-700">
                  Benefit from our industry-leading interest rates, starting from just 7.5% p.a., optimized for different property types and borrower profiles.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                  <FaRegFileAlt className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Minimal Documentation</h3>
                <p className="text-gray-700">
                  Our streamlined application process requires minimal paperwork, with digital verification options for faster processing and approval.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                  <FaClock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Disbursement</h3>
                <p className="text-gray-700">
                  Experience rapid loan processing with approval in as little as 3 days and disbursement within a week for qualifying applications.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Loan Types Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Comprehensive Property Loan Solutions</h2>
              <p className="text-lg text-gray-700">
                From residential purchases to commercial investments, we offer specialized financing options tailored to various property types and ownership goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loanTypes.map((loan, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <div className="text-green-600 mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      {loan.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{loan.title}</h3>
                  <p className="text-gray-700">{loan.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-green-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">₹5000Cr+</div>
                <p className="text-xl opacity-80">Loan Disbursed</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">15,000+</div>
                <p className="text-xl opacity-80">Happy Customers</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">25+</div>
                <p className="text-xl opacity-80">Cities Served</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">4.8/5</div>
                <p className="text-xl opacity-80">Customer Rating</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Eligibility Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Loan Eligibility & Requirements</h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  Our inclusive eligibility criteria are designed to make property financing accessible to a wide range of customers.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <MdAccountBalance className="mr-3 text-green-600 w-7 h-7" />
                      Eligibility Criteria
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Age:</span>
                          <p className="text-gray-800">21-65 years (at loan maturity)</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Income:</span>
                          <p className="text-gray-800">Minimum ₹25,000 monthly (individuals) or ₹50,000 (businesses)</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Credit Score:</span>
                          <p className="text-gray-800">700+ for best rates (options available for lower scores)</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Employment/Business:</span>
                          <p className="text-gray-800">Minimum 2 years of experience or business operation</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <HiDocumentText className="mr-3 text-green-600 w-7 h-7" />
                      Required Documents
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Identity Proof:</span>
                          <p className="text-gray-800">Aadhaar, PAN, Passport, Voter ID</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Income Documents:</span>
                          <p className="text-gray-800">Salary slips, ITR, Form 16, Business financials</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Property Documents:</span>
                          <p className="text-gray-800">Sale deed, property tax receipts, NOC from builder</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Banking Details:</span>
                          <p className="text-gray-800">6 months bank statements, loan statements (if refinancing)</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Application Process */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Simplified Application Process</h2>
              <p className="text-lg text-gray-700">
                Our streamlined loan application process is designed to be hassle-free, transparent, and efficient from start to finish.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {applicationSteps.map((step, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 text-green-600">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-bold text-green-600">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Loan Calculator Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">EMI Calculator</h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  Use our calculator to estimate your monthly installments based on loan amount, interest rate, and tenure.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 md:p-12 rounded-xl shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <FaCalculator className="mr-3 text-green-600 w-6 h-6" />
                      Loan Parameters
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Loan Amount (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiCurrencyRupee className="text-gray-500" />
                          </div>
                          <input
                            type="number"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter loan amount"
                            defaultValue="2500000"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Interest Rate (% p.a.)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPercentage className="text-gray-500" />
                          </div>
                          <input
                            type="number"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter interest rate"
                            defaultValue="8.5"
                            step="0.1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Loan Tenure (Years)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaClock className="text-gray-500" />
                          </div>
                          <input
                            type="number"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter loan tenure"
                            defaultValue="20"
                          />
                        </div>
                      </div>
                      
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 mt-4">
                        Calculate EMI
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <MdAttachMoney className="mr-3 text-green-600 w-6 h-6" />
                      Loan Summary
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <span className="text-gray-700">Monthly EMI:</span>
                        <span className="text-2xl font-bold text-green-700">₹21,733</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <span className="text-gray-700">Total Interest Payable:</span>
                        <span className="text-xl font-semibold text-gray-900">₹27,15,920</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <span className="text-gray-700">Total Payment:</span>
                        <span className="text-xl font-semibold text-gray-900">₹52,15,920</span>
                      </div>
                      
                      <div className="mt-6">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Principal Amount</span>
                            <span className="text-sm text-gray-600">Interest Amount</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div className="flex h-full">
                              <div className="bg-green-600 h-full" style={{ width: '48%' }}></div>
                              <div className="bg-red-500 h-full" style={{ width: '52%' }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-600">48%</span>
                            <span className="text-sm text-gray-600">52%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8 text-gray-600 text-sm">
                <p>Note: This calculator provides an estimation. Actual EMI may vary based on processing fees, prepayment options, and other factors.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "The streamlined application process and competitive interest rates made my first home purchase a breeze. The team provided personalized guidance throughout the journey, from application to disbursement."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold">AK</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ankit Kumar</h4>
                    <p className="text-sm text-gray-600">First-time Homeowner</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "As a property investor, I've worked with multiple lenders. The speed of approval and flexible terms offered here are unmatched. Their commercial property loans helped me expand my portfolio with confidence."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold">PS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Priya Singh</h4>
                    <p className="text-sm text-gray-600">Property Investor</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Their loan against property option provided the capital I needed to expand my business. The team structured a repayment plan that aligned perfectly with my cash flow, making the whole process stress-free."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold">RT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Rajesh Tiwari</h4>
                    <p className="text-sm text-gray-600">Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-700 to-emerald-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your Property Journey?</h2>
              <p className="text-xl mb-10 opacity-90">
                Get in touch with our loan experts to discuss your property financing needs and receive a personalized quote.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl border border-white/20">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white placeholder-white/60"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white placeholder-white/60"
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
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white placeholder-white/60"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="loanType" className="block text-sm font-medium mb-1">Loan Type</label>
                      <select
                        id="loanType"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white"
                      >
                        <option value="" className="bg-green-800">Select loan type</option>
                        <option value="home" className="bg-green-800">Home Loan</option>
                        <option value="commercial" className="bg-green-800">Commercial Property Loan</option>
                        <option value="construction" className="bg-green-800">Construction Loan</option>
                        <option value="land" className="bg-green-800">Land Purchase Loan</option>
                        <option value="refinance" className="bg-green-800">Property Refinancing</option>
                        <option value="lap" className="bg-green-800">Loan Against Property</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium mb-1">Loan Amount (₹)</label>
                      <input
                        type="number"
                        id="amount"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white placeholder-white/60"
                        placeholder="Approx. loan amount"
                      />
                    </div>
                    <div>
                      <label htmlFor="propertyType" className="block text-sm font-medium mb-1">Property Type</label>
                      <select
                        id="propertyType"
                        className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white"
                      >
                        <option value="" className="bg-green-800">Select property type</option>
                        <option value="residential" className="bg-green-800">Residential Property</option>
                        <option value="commercial" className="bg-green-800">Commercial Property</option>
                        <option value="industrial" className="bg-green-800">Industrial Property</option>
                        <option value="land" className="bg-green-800">Vacant Land</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Additional Information</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-green-300 focus:border-green-300 text-white placeholder-white/60"
                      placeholder="Tell us more about your requirements and property details"
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-white text-green-700 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      Submit Application
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