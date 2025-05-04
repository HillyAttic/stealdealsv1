"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPhone, FaUserAlt, FaHeart, FaSearch, FaBars, FaTimes, FaEnvelope, FaMapMarkerAlt, FaHome, FaInfoCircle, FaWarehouse, FaLandmark, FaHandshake, FaUtensils, FaImages, FaPhoneAlt, FaPlus, FaStore, FaMoneyBillWave, FaBuilding, FaAd, FaFileContract, FaChevronDown } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Navigation items
  const navItems = [
    { name: "HOME", path: "/", icon: <FaHome className="mr-1" /> },
    { name: "ABOUT US", path: "/about", icon: <FaInfoCircle className="mr-1" /> },
    { name: "PRELEASED INVENTORY", path: "/inventory", icon: <FaWarehouse className="mr-1" /> },
    { name: "PLOTS", path: "/plots", icon: <FaLandmark className="mr-1" /> },
    { name: "BE A FRANCHISE", path: "/franchise", icon: <FaHandshake className="mr-1" /> },
    { name: "HORECA", path: "/horeca", icon: <FaUtensils className="mr-1" /> },
    { name: "GALLARY", path: "/gallery", icon: <FaImages className="mr-1" /> },
    { name: "CONTACT", path: "/contact", icon: <FaPhoneAlt className="mr-1" /> }
  ];

  return (
    <>
      {/* Top Bar - Completely separate from main navigation */}
      <div className="bg-black text-white py-3 hidden md:block w-full border-b border-gray-800">
        <div className="container mx-auto px-6 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/brand-license" className="text-sm hover:text-gray-300 transition-colors">
                Buy a Brand License
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/sell-business" className="text-sm hover:text-gray-300 transition-colors">
                Sell your Business
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/expand-franchise" className="text-sm hover:text-gray-300 transition-colors">
                Expand Your Franchise
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/advertise" className="text-sm hover:text-gray-300 transition-colors">
                Advertise
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/restaurant-india" className="text-sm hover:text-gray-300 transition-colors">
                Restaurant India
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/loan-property" className="text-sm hover:text-gray-300 transition-colors">
                Loan Against Property
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation - Independent sticky header */}
      <header className="sticky top-0 z-[1000] premium-header w-full border-b border-gray-100" style={{position: 'sticky', top: 0}}>
        <div className="container mx-auto px-6 w-full">
          <div className="flex items-center py-3">
            {/* Logo - Left aligned */}
            <div className="flex-shrink-0 mr-auto">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-900 transition-all duration-300 flex items-start hover:opacity-80">
                <div className="overflow-hidden transition-all duration-500 transform hover:scale-105 flex items-center justify-start">
                  <Image 
                    src="/logo.svg" 
                    alt="Stealdeals Logo" 
                    width={280} 
                    height={60}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-3xl focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? 
                <FaTimes className="text-blue-900 transition-colors duration-300" /> : 
                <FaBars className="text-blue-900 transition-colors duration-300" />
              }
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:block mx-auto">
              <ul className="flex flex-wrap items-center text-center">
                {navItems.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <li className="mx-2">
                          <span className="text-blue-300 text-lg">|</span>
                        </li>
                      )}
                      <li className="nav-item-animation" style={{ animationDelay: `${index * 0.05}s` }}>
                        <Link 
                          href={item.path} 
                          className={`relative font-medium text-lg px-2 py-1 flex items-center justify-center whitespace-nowrap
                            text-blue-900 hover:text-blue-700 font-['cooper black'] tracking-wide
                            transition-all duration-300 ${pathname === item.path ? 'text-blue-700 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:transform after:scale-x-100 after:transition-transform after:duration-300' : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:transform after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100'}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    </React.Fragment>
                  );
                })}
              </ul>
            </nav>
            
            {/* Add Listing Button - Right aligned */}
            <div className="hidden md:block ml-auto">
              <Link 
                href="/add-property" 
                className="premium-button group relative overflow-hidden flex items-center bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span className="relative z-10">Add Listing</span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Separate from both navigations */}
      <div 
        className={`md:hidden fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      >
        <div 
          className={`fixed inset-y-0 right-0 max-w-xs w-full bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4">
            <button 
              className="text-white text-2xl focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
          <nav className="px-4 py-2">
            <ul className="space-y-3">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center py-2 px-4 rounded-md ${
                      item.path === pathname
                        ? 'bg-blue-700/50 text-white font-medium' 
                        : 'text-blue-100 hover:bg-blue-700/30'
                    } transition-colors duration-200`}
                    onClick={toggleMobileMenu}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-4 mt-4 border-t border-blue-700/50">
                <Link 
                  href="/add-property" 
                  className="flex items-center justify-center py-3 px-4 bg-white text-blue-900 rounded-md font-medium shadow-md hover:bg-blue-50 transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  <FaPlus className="mr-2" />
                  <span>Add Listing</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header; 