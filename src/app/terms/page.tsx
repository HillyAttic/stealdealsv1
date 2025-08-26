"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaFileContract, FaEnvelope, FaMapMarkerAlt, FaUserCheck, FaGavel, FaGlobe } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] text-white py-12 sm:py-16 md:py-20">
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(21,77,113)]/50 via-transparent to-[rgb(51,161,224)]/50 animate-pulse"></div>
          
          {/* Decorative Elements - Responsive positioning and sizes */}
          <div className="absolute top-6 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-6 sm:top-32 sm:right-16 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-full animate-pulse"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <FaFileContract className="text-3xl sm:text-4xl md:text-5xl mx-auto mb-4 sm:mb-6 text-[#8CCDEB]" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">
                  Terms of Service
                </span>
              </h1>
              
              {/* Animated Divider - Mobile optimized */}
              <div className="flex items-center justify-center mb-4 sm:mb-6 space-x-1 sm:space-x-2">
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#8CCDEB] animate-pulse"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#8CCDEB] rounded-full animate-bounce"></div>
                <div className="h-0.5 sm:h-1 w-16 sm:w-24 bg-gradient-to-r from-[#8CCDEB] to-transparent animate-pulse"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#8CCDEB] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#8CCDEB] to-transparent animate-pulse"></div>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-3 sm:mb-4 px-2 leading-relaxed">
                Please read these terms carefully before using our services and platform.
              </p>
              <p className="text-xs sm:text-sm text-gray-300 px-2">
                Last Updated: January 01, 2025
              </p>
            </div>
          </div>
        </div>
        
        {/* Terms of Service Content */}
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            
            {/* Introduction */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <FaFileContract className="text-sm sm:text-lg md:text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                </div>
                Introduction
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6">
                These Terms of Service ("Terms") govern your use of the <span className="font-semibold" style={{color: 'rgb(28, 110, 164)'}}>Steal Deals</span> website and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not access or use our Services.
              </p>
              <div className="border-l-4 p-2 sm:p-3 md:p-6 rounded-r-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgb(28, 110, 164)'}}>
                <p className="text-gray-700 font-medium flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-base">
                  <FaEnvelope className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit" style={{color: 'rgb(28, 110, 164)'}} />
                  For any questions about these Terms, contact us at <a href="mailto:hello@stealdeals.co.in" className="hover:underline font-semibold break-all" style={{ color: 'rgb(28, 110, 164)' }}>hello@stealdeals.co.in</a>.
                </p>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>1</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Acceptance of Terms</h2>
              </div>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  By accessing and using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms:
                </p>
                <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs sm:text-sm md:text-lg">
                  <li>You are at least 18 years old or have parental consent</li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>You understand that these Terms may be updated from time to time</li>
                </ul>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                  <div className="p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)'}}>
                    <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-lg">Legal Agreement:</h4>
                    <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                      These Terms constitute a legally binding agreement between you and Steal Deals.
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)'}}>
                    <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-lg">Updates and Changes:</h4>
                    <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                      We reserve the right to modify these Terms at any time. Continued use constitutes acceptance.
                    </p>
                  </div>
                </div>

                <div className="border border-yellow-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(255, 193, 7, 0.05)'}}>
                  <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-lg">
                    <FaUserCheck className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    User Responsibility:
                  </h4>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                    You are responsible for regularly reviewing these Terms and staying informed of any updates or changes that may affect your use of our Services.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Use of Services */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>2</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Use of Services</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  You may use our Services for the following permitted purposes:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                  <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs md:text-base">
                    <li>Browse and search for real estate properties</li>
                    <li>Contact property owners or agents</li>
                    <li>Create and maintain user accounts</li>
                    <li>Access property listings and information</li>
                  </ul>
                  <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs md:text-base">
                    <li>Receive updates and notifications</li>
                    <li>Use our customer support services</li>
                    <li>Participate in community features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: User Accounts and Responsibilities */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>3</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">User Accounts and Responsibilities</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  When you create an account with us, you must provide accurate and complete information:
                </p>
                <div className="border border-red-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.05)'}}>
                  <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-lg">
                    <FaGavel className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    Account Security:
                  </h4>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections 4-10: Combined Card Layout */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                {/* Section 4: Prohibited Uses */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>4</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Prohibited Uses</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    You may not use our Services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our Services. Prohibited activities include but are not limited to fraud, harassment, spamming, or attempting to gain unauthorized access to our systems.
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Section 5: Intellectual Property */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>5</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Intellectual Property</h2>
                  </div>
                  <div className="ml-0 md:ml-16 space-y-2 sm:space-y-3 md:space-y-4">
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                      All content on our website, including text, graphics, logos, images, and software, is the property of Steal Deals or its licensors and is protected by copyright and other intellectual property laws.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                      You may not reproduce, distribute, modify, or create derivative works from our content without explicit written permission.
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 6: Property Listings */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>6</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Property Listings</h2>
                  </div>
                  <div className="ml-0 md:ml-16">
                    <div className="border p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgba(28, 110, 164, 0.2)'}}>
                      <div className="flex flex-col sm:flex-row sm:items-start">
                        <FaGlobe className="mr-0 sm:mr-3 mb-1.5 sm:mb-0 sm:mt-1 flex-shrink-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                        <div>
                          <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs md:text-base">
                            We provide a platform for property listings but do not guarantee the accuracy, completeness, or reliability of any property information. All transactions are between users and property owners.
                          </p>
                          <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                            Users are responsible for verifying all property details before making any commitments or transactions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 7: User Content */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>7</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">User Content</h2>
                  </div>
                  <div className="ml-0 md:ml-16">
                    <div className="border border-orange-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(251, 146, 60, 0.05)'}}>
                      <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs md:text-base">
                        By submitting content to our platform, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute such content in connection with our Services.
                      </p>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                        You warrant that you own or have the necessary rights to submit such content and that it does not violate any third-party rights.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 8: Disclaimers and Limitations */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>8</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Disclaimers and Limitations</h2>
                  </div>
                  <div className="ml-0 md:ml-16 space-y-3 sm:space-y-4 md:space-y-6">
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                      Our Services are provided on an "as is" and "as available" basis. We disclaim all warranties:
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 md:gap-4">
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">No Warranties</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">We make no express or implied warranties about our Services</p>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">Limited Liability</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Our liability is limited to the maximum extent permitted by law</p>
                      </div>
                    </div>
                    <div className="border-l-4 p-2 sm:p-3 md:p-6 rounded-r-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgb(28, 110, 164)'}}>
                      <p className="text-gray-700 text-xs md:text-base flex flex-col sm:flex-row sm:items-center leading-relaxed">
                        <FaGavel className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                        We shall not be liable for any indirect, incidental, or consequential damages arising from your use of our Services.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 9: Termination */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>9</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Termination</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    We may terminate or suspend your account and access to our Services immediately, without prior notice, for any breach of these Terms. You may also terminate your account at any time by contacting us.
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Section 10: Governing Law */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>10</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Governing Law</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>11</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Contact Information</h2>
              </div>
              <div className="ml-0 md:ml-16">
                <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed text-xs sm:text-sm md:text-lg">
                  If you have questions or concerns about these Terms of Service, you may contact us at:
                </p>
                <div className="bg-gradient-to-r p-3 sm:p-4 md:p-8 rounded-xl border" style={{background: 'linear-gradient(to right, rgba(28, 110, 164, 0.05), rgba(51, 161, 224, 0.05))', borderColor: 'rgba(28, 110, 164, 0.2)'}}>
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-center" style={{ color: 'rgb(28, 110, 164)' }}>Steal Deals</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaMapMarkerAlt className="text-sm sm:text-lg md:text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs sm:text-sm md:text-lg">Office Address</h4>
                        <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                          2nd Floor, Block A, Ofis Square,<br/>
                          The Iconic Corenthum, Noida Sector - 62,<br/>
                          Uttar Pradesh - 201301, India
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaEnvelope className="text-sm sm:text-lg md:text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs sm:text-sm md:text-lg">Email Address</h4>
                        <a href="mailto:hello@stealdeals.co.in" className="hover:underline font-semibold break-all text-xs sm:text-sm md:text-lg" style={{ color: 'rgb(28, 110, 164)' }}>
                          hello@stealdeals.co.in
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 12: Changes to Terms */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>12</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Changes to Terms</h2>
              </div>
              <div className="ml-0 md:ml-16">
                <div className="border border-purple-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(147, 51, 234, 0.05)'}}>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <FaUserCheck className="mr-0 sm:mr-3 mb-1.5 sm:mb-0 sm:mt-1 flex-shrink-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    <div>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 sm:py-16" style={{background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164), rgb(51, 161, 224))'}}>
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto backdrop-blur-sm">
                <FaFileContract className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight px-2">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">Questions About Our Terms?</span>
              </h2>
              
              {/* Animated Divider - Mobile optimized */}
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-4 sm:w-6 h-0.5 bg-white/30 rounded-full"></div>
                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-white/60 via-[#8CCDEB] to-white/60 rounded-full mx-2 sm:mx-3 shadow-lg"></div>
                <div className="w-4 sm:w-6 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              
              <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg md:text-xl leading-relaxed font-medium px-3 sm:px-4">
                We're committed to ensuring these terms are clear and fair.
                <span className="bg-gradient-to-r from-white to-[#8CCDEB] bg-clip-text text-transparent font-semibold"> Legal clarity</span> helps build trust.
                If you have any questions or concerns, don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <a 
                  href="mailto:hello@stealdeals.co.in" 
                  className="bg-white text-white font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center text-sm sm:text-base"
                  style={{color: 'rgb(28, 110, 164)'}}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.95)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
                >
                  <FaEnvelope className="mr-1.5 sm:mr-2 text-sm sm:text-base" />
                  Contact Us
                </a>
                <a 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center text-sm sm:text-base"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  <FaGlobe className="mr-1.5 sm:mr-2 text-sm sm:text-base" />
                  Visit Contact Page
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
}
