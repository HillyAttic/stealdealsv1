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
        <section className="py-16 relative overflow-hidden" style={{background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164), rgb(51, 161, 224))'}}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 clip-path-diagonal"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
              <p className="text-blue-100 max-w-2xl mx-auto text-lg">
                Get in touch with our team for any inquiries or assistance
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
                      <div className="bg-primary-50 p-3 rounded-full mr-4">
                        <FaMapMarkerAlt className="text-primary text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Office Address</h3>
                        <p className="text-gray-600">2nd Floor, Block A, Ofis Square,<br/>The Iconic Corenthum, Noida Sector - 62,<br/>Uttar Pradesh - 201301</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-secondary-50 p-3 rounded-full mr-4">
                        <FaPhone className="text-secondary text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                        <p className="text-gray-600">+91 96 3040 3080</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-accent-50 p-3 rounded-full mr-4">
                        <FaEnvelope className="text-accent text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                        <p className="text-gray-600">hello@stealdeals.com</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-highlight/20 p-3 rounded-full mr-4">
                        <FaClock className="text-primary text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                        <p className="text-gray-600">Mon - Fri: 9:00AM - 7:00PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a href="https://www.facebook.com/stealdeals.co.in/" className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors">
                        <FaFacebookF />
                      </a>
                      <a href="#" className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors">
                        <FaTwitter />
                      </a>
                      <a href="http://instagram.com/stealdeals.co.in/" className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors">
                        <FaInstagram />
                      </a>
                      <a href="https://www.linkedin.com/company/steal-deals/posts/?feedView=all" className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors">
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
                          <FaCheckCircle className="text-secondary text-3xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                        <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                        <button
                          onClick={() => setShowSuccessMessage(false)}
                          className="bg-secondary hover:bg-accent text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Great, Thanks!
                        </button>
                      </div>
                    </div>
                  )}

                  {!showSuccessMessage && (
                    <form
                      action="https://formsubmit.co/stealdeals.co.in@gmail.com"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="Your message"
                          required
                        ></textarea>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full bg-primary text-white font-medium py-3 px-6 rounded-md hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
        <section className="bg-primary-50 py-16">
          <div className="container mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Location</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Come visit us at our office - we're easy to find and conveniently located
            </p>
          </div>

          <div className="container mx-auto px-4">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.8848371386!2d77.28720821451529!3d28.63322088241705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfbdda90e78d7%3A0x9e96b275a7af96af!2sNirman%20Vihar%2C%20Preet%20Vihar%2C%20New%20Delhi%2C%20Delhi%20110092!5e0!3m2!1sen!2sin!4v1654780912537!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
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