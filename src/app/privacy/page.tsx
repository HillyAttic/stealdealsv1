"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaShieldAlt, FaEnvelope, FaMapMarkerAlt, FaUserShield, FaFileContract, FaGlobe } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

export default function PrivacyPolicyPage() {
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
              <FaShieldAlt className="text-3xl sm:text-4xl md:text-5xl mx-auto mb-4 sm:mb-6 text-[#8CCDEB]" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">
                  Privacy Policy
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
                Your privacy is important to us. Learn how we collect, use, and protect your personal information.
              </p>
              <p className="text-xs sm:text-sm text-gray-300 px-2">
                Last Updated: April 01, 2025
              </p>
            </div>
          </div>
        </div>
        
        {/* Privacy Policy Content */}
        <section className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            
            {/* Introduction */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <FaShieldAlt className="text-sm sm:text-lg md:text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                </div>
                Introduction
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6">
                This Privacy Policy explains how <span className="font-semibold" style={{color: 'rgb(28, 110, 164)'}}>Steal Deals</span> ("we," "our," or "us") collects, uses, stores, and protects your personal information when you use our website <a href="https://stealdeals.co.in" className="hover:underline break-all font-semibold" style={{ color: 'rgb(28, 110, 164)' }}>https://stealdeals.co.in</a> and related services. By using our Services, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of our Services.
              </p>
              <div className="border-l-4 p-2 sm:p-3 md:p-6 rounded-r-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgb(28, 110, 164)'}}>
                <p className="text-gray-700 font-medium flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-base">
                  <FaEnvelope className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit" style={{color: 'rgb(28, 110, 164)'}} />
                  For any questions or concerns, you can contact us at <a href="mailto:ishank@stealdeals.co.in" className="hover:underline font-semibold break-all" style={{ color: 'rgb(28, 110, 164)' }}>ishank@stealdeals.co.in</a>.
                </p>
              </div>
            </div>

            {/* Section 1: Information We Collect */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>1</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Information We Collect</h2>
              </div>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  We collect personal information that you voluntarily provide when you:
                </p>
                <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs sm:text-sm md:text-lg">
                  <li>Register on our website</li>
                  <li>Show interest in our products or services</li>
                  <li>Participate in activities on our Services</li>
                  <li>Contact us directly</li>
                </ul>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                  <div className="p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)'}}>
                    <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-lg">Personal Information You Provide:</h4>
                    <ul className="text-gray-600 space-y-0.5 sm:space-y-1 text-xs md:text-base">
                      <li>• Phone numbers</li>
                      <li>• Email addresses</li>
                      <li>• Usernames</li>
                    </ul>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)'}}>
                    <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-lg">Sensitive Information:</h4>
                    <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                      We do not collect or process sensitive personal information (such as race, religion, or sexual orientation).
                    </p>
                  </div>
                </div>

                <div className="border border-yellow-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(255, 193, 7, 0.05)'}}>
                  <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-lg">
                    <FaUserShield className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    Social Media Login Data:
                  </h4>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                    If you choose to register using your social media accounts (e.g., Facebook, X), we may collect certain profile details such as your name, email, friends list, and profile picture.
                  </p>
                </div>

                <div className="border border-green-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                  <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-lg">
                    <FaGlobe className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    Google API Data:
                  </h4>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                    Our use of Google API information complies with the Google API Services User Data Policy, including Limited Use requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: How We Process Your Information */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>2</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">How We Process Your Information</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  We process your personal information to:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                  <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs md:text-base">
                    <li>Facilitate account creation, authentication, and management</li>
                    <li>Respond to inquiries and provide customer support</li>
                    <li>Improve and administer our Services</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                  <ul className="list-disc pl-3 sm:pl-4 md:pl-6 text-gray-600 space-y-0.5 sm:space-y-1 md:space-y-2 text-xs md:text-base">
                    <li>Comply with legal obligations</li>
                    <li>Communicate with you regarding updates, offers, or events</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Sharing of Information */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>3</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Sharing of Information</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                  We may share your personal information in specific cases, such as:
                </p>
                <div className="border border-red-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.05)'}}>
                  <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm md:text-lg">
                    <FaFileContract className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    Business Transfers:
                  </h4>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">
                    During mergers, acquisitions, financing, or sale of company assets.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections 4-12: Combined Card Layout */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                {/* Section 4: Social Logins */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>4</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Social Logins</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    If you log in using a social media account, we may access certain profile details provided by that platform. The information received depends on your privacy settings with the provider. Please review their privacy policies for more details.
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Section 5: Data Retention */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>5</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Data Retention</h2>
                  </div>
                  <div className="ml-0 md:ml-16 space-y-2 sm:space-y-3 md:space-y-4">
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                      We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law (e.g., tax or accounting obligations).
                    </p>
                    <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                      When no longer needed, we will delete or anonymize your data. If deletion is not possible (e.g., stored in backups), we will securely store and isolate it until deletion is possible.
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 6: Data Security */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>6</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Data Security</h2>
                  </div>
                  <div className="ml-0 md:ml-16">
                    <div className="border p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgba(28, 110, 164, 0.2)'}}>
                      <div className="flex flex-col sm:flex-row sm:items-start">
                        <FaShieldAlt className="mr-0 sm:mr-3 mb-1.5 sm:mb-0 sm:mt-1 flex-shrink-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                        <div>
                          <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs md:text-base">
                            We implement reasonable technical and organizational measures to protect your personal information. However, no system is 100% secure, and we cannot guarantee complete protection against unauthorized access, hacking, or data breaches.
                          </p>
                          <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                            You should only access our Services in a secure environment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 7: Children's Privacy */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>7</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Children's Privacy</h2>
                  </div>
                  <div className="ml-0 md:ml-16">
                    <div className="border border-orange-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(251, 146, 60, 0.05)'}}>
                      <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs md:text-base">
                        We do not knowingly collect or market to children under 18 years of age. If we discover that we have collected personal data from a minor, we will delete it promptly.
                      </p>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                        Parents or guardians who believe their child has provided data should contact us immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 8: Your Privacy Rights */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>8</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Your Privacy Rights</h2>
                  </div>
                  <div className="ml-0 md:ml-16 space-y-3 sm:space-y-4 md:space-y-6">
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg">
                      Depending on your location, you may have the right to:
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 md:gap-4">
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">Access & Update</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Review, update, or delete your personal information</p>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">Withdraw Consent</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Withdraw consent at any time</p>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">Data Access</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Request access to the data we hold about you</p>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.05)'}}>
                        <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-base">Data Portability</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Request a copy of your data in a structured format</p>
                      </div>
                    </div>
                    <div className="border-l-4 p-2 sm:p-3 md:p-6 rounded-r-lg" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)', borderColor: 'rgb(28, 110, 164)'}}>
                      <p className="text-gray-700 text-xs md:text-base flex flex-col sm:flex-row sm:items-center leading-relaxed">
                        <FaEnvelope className="mr-0 sm:mr-3 mb-1 sm:mb-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                        To exercise these rights, contact us at <a href="mailto:ishank@stealdeals.co.in" className="hover:underline font-semibold break-all" style={{ color: 'rgb(28, 110, 164)' }}>ishank@stealdeals.co.in</a>.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Section 9: Do-Not-Track */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>9</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Do-Not-Track (DNT)</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    Currently, we do not respond to browser-based Do-Not-Track signals, as no standard has been universally adopted. If such a standard emerges, we will update this policy accordingly.
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Section 10: Policy Updates */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                      <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>10</span>
                    </div>
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Policy Updates</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-lg ml-0 md:ml-16">
                    We may update this Privacy Policy from time to time to remain compliant with laws and industry practices. Updates will be reflected by the "Last Updated" date at the top. In case of significant changes, we may notify you via email or a notice on our website.
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
                  If you have questions or concerns about this Privacy Policy, you may contact us at:
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
                        <a href="mailto:ishank@stealdeals.co.in" className="hover:underline font-semibold break-all text-xs sm:text-sm md:text-lg" style={{ color: 'rgb(28, 110, 164)' }}>
                          ishank@stealdeals.co.in
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 12: Data Subject Access Requests */}
            <div className="bg-white p-3 sm:p-4 md:p-8 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 w-fit" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                  <span className="font-bold text-sm sm:text-lg md:text-xl" style={{ color: 'rgb(28, 110, 164)' }}>12</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Review, Update, or Delete Your Data</h2>
              </div>
              <div className="ml-0 md:ml-16">
                <div className="border border-purple-200 p-3 sm:p-4 md:p-6 rounded-lg" style={{backgroundColor: 'rgba(147, 51, 234, 0.05)'}}>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <FaUserShield className="mr-0 sm:mr-3 mb-1.5 sm:mb-0 sm:mt-1 flex-shrink-0 w-fit text-sm sm:text-base" style={{color: 'rgb(28, 110, 164)'}} />
                    <div>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-base">
                        You may request to review, update, or delete the personal information we hold about you by submitting a Data Subject Access Request (DSAR) or contacting us directly at <a href="mailto:ishank@stealdeals.co.in" className="hover:underline font-semibold break-all" style={{ color: 'rgb(28, 110, 164)' }}>ishank@stealdeals.co.in</a>.
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
                <FaShieldAlt className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight px-2">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">Questions About Our Privacy Policy?</span>
              </h2>
              
              {/* Animated Divider - Mobile optimized */}
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-4 sm:w-6 h-0.5 bg-white/30 rounded-full"></div>
                <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-white/60 via-[#8CCDEB] to-white/60 rounded-full mx-2 sm:mx-3 shadow-lg"></div>
                <div className="w-4 sm:w-6 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              
              <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg md:text-xl leading-relaxed font-medium px-3 sm:px-4">
                We're committed to protecting your privacy and being transparent about our
                <span className="bg-gradient-to-r from-white to-[#8CCDEB] bg-clip-text text-transparent font-semibold"> data practices</span>. 
                If you have any questions or concerns, don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <a 
                  href="mailto:ishank@stealdeals.co.in" 
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