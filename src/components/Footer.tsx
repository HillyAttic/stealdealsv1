"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaLock } from 'react-icons/fa';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-white text-gray-700">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="text-2xl font-bold text-blue-900 mb-6 block">
              Stealdeals
            </Link>
            <p className="text-gray-600 mb-6">
              Discover your dream property with Stealdeals. We make the process of finding and purchasing real estate simple and enjoyable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-blue-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-600 hover:text-blue-900 transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-600 hover:text-blue-900 transition-colors">
                  Our Agents
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-blue-900 transition-colors">
                  Blog & News
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-900 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="flex items-center text-gray-600 hover:text-blue-900 transition-colors">
                  <FaLock className="mr-2" size={14} />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-blue-900">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-900" />
                <span className="text-gray-600">
                  Nirman Vihar, New Delhi
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-blue-900" />
                <a href="tel:+919876543210" className="text-gray-600 hover:text-blue-900 transition-colors">
                  +91 98 7654 3210
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-blue-900" />
                <a href="mailto:info@stealdeals.com" className="text-gray-600 hover:text-blue-900 transition-colors">
                  info@stealdeals.com
                </a>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-3 text-blue-900" />
                <span className="text-gray-600">Mon - Fri: 9:00AM - 7:00PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-blue-900">Newsletter</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for the latest property updates.
            </p>
            <form className="mb-4">
              <div className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-900 text-white py-3 px-4 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} Stealdeals. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm">
                <li>
                  <a href="/privacy" className="text-gray-600 hover:text-blue-900 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-blue-900 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-blue-900 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/admin/login" className="text-gray-600 hover:text-blue-900 transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 