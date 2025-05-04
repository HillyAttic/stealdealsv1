"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';
import { submitContactForm } from '../actions/contact-actions';

// Define form data interface
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name]; // Remove the error for this field
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setFormErrors({});
    
    try {
      // Call the server action
      const result = await submitContactForm(formData);
      
      if (result.success) {
        setFormStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setFormStatus('error');
        setFormErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Get in touch with our team for any inquiries or assistance
            </p>
          </div>
        </div>
        
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
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FaMapMarkerAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Office Address</h3>
                        <p className="text-gray-600">Nirman Vihar, New Delhi</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FaPhone className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                        <p className="text-gray-600">(+91) 9630403080</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FaEnvelope className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                        <p className="text-gray-600">hello@stealdeals.co.in</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FaClock className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                        <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                        <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                        <p className="text-gray-600">Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                        <FaFacebookF />
                      </a>
                      <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                        <FaTwitter />
                      </a>
                      <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                        <FaInstagram />
                      </a>
                      <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                        <FaLinkedinIn />
                      </a>
                      <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                        <FaYoutube />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                  
                  {formStatus === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaCheckCircle className="text-green-500 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-600 mb-4">Thank you for reaching out. We'll get back to you shortly.</p>
                      <button
                        onClick={() => setFormStatus('idle')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-500 transition-colors"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {formStatus === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <FaExclamationTriangle className="text-red-500 mr-2" />
                            <p className="text-red-600">There was an error submitting your message. Please check the form and try again.</p>
                          </div>
                        </div>
                      )}
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
                          <input 
                            type="text" 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Your full name"
                            required
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                          <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Your email address"
                            required
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.email[0]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="phone">Phone Number</label>
                          <input 
                            type="tel" 
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>
                     
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
                        <textarea 
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Your message"
                          required
                        ></textarea>
                        {formErrors.message && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.message[0]}</p>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <button 
                          type="submit" 
                          disabled={formStatus === 'submitting'}
                          className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                          {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
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
        <section className="bg-blue-50 py-16">
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
    </main>
  );
} 