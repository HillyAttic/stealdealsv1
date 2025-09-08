"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaCheckCircle } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';
import { useAuthPrompt } from '@/hooks/useAuthPrompt';
import { AuthPrompt } from '@/components/auth';

export default function ContactPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { showAuthPrompt, promptOptions, requireAuth, closePrompt, handleAuthSuccess } = useAuthPrompt();

  // Check for success message from FormSubmit
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Remove the success parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);



  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />

        {/* Page Header */}
        <section className="py-16 md:py-20 relative overflow-hidden" style={{background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164), rgb(51, 161, 224))'}}>
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(21,77,113)]/50 via-transparent to-[rgb(51,161,224)]/50 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Enhanced Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">Contact Us</span>
              </h1>
              
              {/* Animated Divider */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-6 h-0.5 bg-white/30 rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-white/60 via-[#8CCDEB] to-white/60 rounded-full mx-3 shadow-lg"></div>
                <div className="w-6 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              
              {/* Enhanced Description */}
              <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
                <span className="text-[#8CCDEB] font-bold">Steal Deals</span> - Your trusted partner for
                <span className="bg-gradient-to-r from-white to-[#8CCDEB] bg-clip-text text-transparent font-semibold"> real estate investment</span>, 
                leasing, and development
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-lg shadow-md h-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="p-3 rounded-full mr-4" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaMapMarkerAlt className="text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Office Address</h3>
                        <p className="text-gray-600">2nd Floor, Block A, Ofis Square,<br/>The Iconic Corenthum,<br/>Sector 62, Noida, Uttar Pradesh 201301</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="p-3 rounded-full mr-4" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaPhone className="text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                        <p className="text-gray-600">+91 96 3040 3080</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="p-3 rounded-full mr-4" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaEnvelope className="text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                        <p className="text-gray-600">hello@stealdeals.com</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="p-3 rounded-full mr-4" style={{backgroundColor: 'rgba(28, 110, 164, 0.1)'}}>
                        <FaClock className="text-xl" style={{color: 'rgb(28, 110, 164)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                        <p className="text-gray-600">Mon - Sat: 9:00AM - 7:00PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a 
                        href="https://www.facebook.com/stealdeals.co.in/" 
                        className="text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                        style={{backgroundColor: 'rgb(28, 110, 164)'}}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                      >
                        <FaFacebookF />
                      </a>
                      <a 
                        href="#" 
                        className="text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                        style={{backgroundColor: 'rgb(28, 110, 164)'}}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                      >
                        <FaTwitter />
                      </a>
                      <a 
                        href="http://instagram.com/stealdeals.co.in/" 
                        className="text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                        style={{backgroundColor: 'rgb(28, 110, 164)'}}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                      >
                        <FaInstagram />
                      </a>
                      <a 
                        href="https://www.linkedin.com/company/steal-deals/posts/?feedView=all" 
                        className="text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
                        style={{backgroundColor: 'rgb(28, 110, 164)'}}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                      >
                        <FaLinkedinIn />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                  

                  {showSuccessMessage && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <FaCheckCircle className="text-3xl" style={{color: 'rgb(28, 110, 164)'}} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                        <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                        <button
                          onClick={() => setShowSuccessMessage(false)}
                          className="text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                          style={{backgroundColor: 'rgb(28, 110, 164)'}}
                          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                        >
                          Great, Thanks!
                        </button>
                      </div>
                    </div>
                  )}

                  {!showSuccessMessage && (
                    <form
                      action="https://formsubmit.co/ishank@stealdeals.co.in"
                      method="POST"
                      className="space-y-6"
                    >
                      {/* Hidden fields for FormSubmit configuration */}
                      <input type="hidden" name="_subject" value="Contact Form Inquiry - Stealdeals" />
                      <input type="hidden" name="_next" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/contact?success=true`} />
                      <input type="hidden" name="_captcha" value="false" />
                      <input type="hidden" name="form_type" value="General Contact Form" />


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="name">Full Name *</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all duration-300"
                            style={{
                              '--focus-ring-color': 'rgba(28, 110, 164, 0.3)'
                            } as React.CSSProperties & { '--focus-ring-color': string }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(28, 110, 164)';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 110, 164, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="email">Email Address *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all duration-300"
                            style={{
                              '--focus-ring-color': 'rgba(28, 110, 164, 0.3)'
                            } as React.CSSProperties & { '--focus-ring-color': string }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(28, 110, 164)';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 110, 164, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="Your email address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="phone">Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all duration-300"
                            style={{
                              '--focus-ring-color': 'rgba(28, 110, 164, 0.3)'
                            } as React.CSSProperties & { '--focus-ring-color': string }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(28, 110, 164)';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 110, 164, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="message">Message *</label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all duration-300"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgb(28, 110, 164)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 110, 164, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Your message"
                          required
                        ></textarea>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full text-white font-medium py-3 px-6 rounded-md transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{backgroundColor: 'rgb(28, 110, 164)'}}
                          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                          onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 110, 164, 0.3)'}
                          onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Location */}
        <section className="py-16" style={{backgroundColor: 'rgba(28, 110, 164, 0.05)'}}>
          <div className="container mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Location</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Come visit us at our office - we're easy to find and conveniently located
            </p>
          </div>

          <div className="container mx-auto px-4">
            {/* Map Container */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
              {/* Google Maps Embed - The Iconic Corenthum */}
              <div className="relative mb-6 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4169.938493360939!2d77.36819861870913!3d28.626499409506337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5447d350e9f%3A0x4beba507fa3f455b!2sThe%20Iconic%20Corenthum!5e0!3m2!1sen!2sin!4v1756268388800!5m2!1sen!2sin"
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="StealDeals Office - The Iconic Corenthum, Sector 62, Noida"
                  className="w-full"
                ></iframe>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Google Maps */}
                <a 
                  href="https://www.google.com/maps/place/The+Iconic+Corenthum,+Sector+62,+Noida,+Uttar+Pradesh+201301/@28.580499,77.364616,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  style={{backgroundColor: 'rgb(28, 110, 164)'}}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Open in Google Maps
                </a>
                
                {/* Apple Maps */}
                <a 
                  href="https://maps.apple.com/?address=The%20Iconic%20Corenthum,%20Sector%2062,%20Noida,%20Uttar%20Pradesh%20201301,%20India&ll=28.580499,77.364616&q=The%20Iconic%20Corenthum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  style={{backgroundColor: 'rgb(51, 161, 224)'}}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(51, 161, 224)'}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Open in Apple Maps
                </a>
                
                {/* Get Directions */}
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=The+Iconic+Corenthum,+Sector+62,+Noida,+Uttar+Pradesh+201301&destination_place_id=ChIJ_Y_HwqblYzkROjQE8ctbGn8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  style={{backgroundColor: 'rgb(21, 77, 113)'}}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(28, 110, 164)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(21, 77, 113)'}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </ClientOnly>

      {/* Auth Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={closePrompt}
        title={promptOptions.title}
        message={promptOptions.message}
        feature={promptOptions.feature}
        redirectPath={promptOptions.redirectPath}
        onAuthSuccess={handleAuthSuccess}
      />
    </main>
  );
} 