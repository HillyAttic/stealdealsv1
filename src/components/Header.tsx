"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaWarehouse, FaLandmark, FaHandshake, FaUtensils, FaImages, FaPhoneAlt } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { WishlistNavButton } from '@/components/wishlist/WishlistNavButton';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Add custom scrollbar styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Navigation items
  const navItems = [
    { name: "HOME", path: "/", icon: <FaHome className="mr-1" /> },
    { name: "ABOUT US", path: "/about", icon: <FaInfoCircle className="mr-1" /> },
    // { name: "PRELEASED INVENTORY", path: "/inventory", icon: <FaWarehouse className="mr-1" /> },
    { name: "VACANT", path: "/vacant", icon: <FaImages className="mr-1" /> },
    { name: "PLOTS", path: "/plots", icon: <FaLandmark className="mr-1" /> },
    { name: "BE A FRANCHISE", path: "/franchise", icon: <FaHandshake className="mr-1" /> },
    // { name: "HORECA", path: "/horeca", icon: <FaUtensils className="mr-1" /> },
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
      <header className="sticky top-0 z-[1000] premium-header w-full border-b border-gray-100" style={{ position: 'sticky', top: 0 }}>
        <div className="container mx-auto px-6 w-full">
          <div className="flex items-center py-3">
            {/* Logo - Left aligned */}
            <div className="flex-shrink-0 mr-auto">
              <Link href="/" className="text-xl sm:text-2xl font-bold transition-all duration-300 flex items-start hover:opacity-80" style={{ color: 'rgb(28, 110, 164)' }}>
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
                <FaTimes className="transition-colors duration-300" style={{ color: 'rgb(28, 110, 164)' }} /> :
                <FaBars className="transition-colors duration-300" style={{ color: 'rgb(28, 110, 164)' }} />
              }
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:block mx-auto overflow-x-auto no-scrollbar">
              <ul className="flex items-center text-center whitespace-nowrap min-w-max">
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
                            font-['cooper black'] tracking-wide
                            transition-all duration-300 ${pathname === item.path ? 'font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:transform after:scale-x-100 after:transition-transform after:duration-300' : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:transform after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100'}`}
                          style={{
                            color: pathname === item.path ? 'rgb(21, 77, 113)' : 'rgb(28, 110, 164)'
                          }}
                          onMouseEnter={(e) => {
                            if (pathname !== item.path) {
                              e.currentTarget.style.color = 'rgb(21, 77, 113)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (pathname !== item.path) {
                              e.currentTarget.style.color = 'rgb(28, 110, 164)';
                            }
                          }}
                        >
                          {item.name}
                        </Link>
                      </li>
                    </React.Fragment>
                  );
                })}
              </ul>
            </nav>

            {/* Right side buttons - Wishlist and Clerk Authentication */}
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0 ml-4">
              {/* Wishlist Button - Always visible */}
              <WishlistNavButton className="bg-white" />
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{ backgroundColor: 'rgb(28, 110, 164)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)'; }}>
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/17468/17468741.png"
                      alt="User"
                      width={20}
                      height={20}
                      className="filter brightness-0 invert"
                    />
                    <span className="hidden md:block text-sm font-medium">Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full",
                      userButtonTrigger: "focus:shadow-none"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Separate from both navigations */}
      <div
        className={`md:hidden fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleMobileMenu}
      >
        <div
          className={`fixed inset-y-0 right-0 max-w-xs w-full shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          style={{ background: 'linear-gradient(to bottom, rgb(21, 77, 113), rgb(18, 65, 96))' }}
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
                    className={`flex items-center py-2 px-4 rounded-md ${item.path === pathname
                      ? 'text-white font-medium'
                      : 'text-blue-100'
                      } transition-colors duration-200`}
                    style={{
                      backgroundColor: item.path === pathname ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (item.path !== pathname) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.path !== pathname) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={toggleMobileMenu}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Wishlist and Authentication */}
            <div className="px-4 py-4 border-t border-white/20 mt-4 space-y-3">
              {/* Mobile Wishlist Button */}
              <div className="flex justify-center">
                <WishlistNavButton className="bg-white/10 text-white border-white/20 hover:bg-white/20" showText />
              </div>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: 'rgb(28, 110, 164)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
                    }}
                  >
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/17468/17468741.png"
                      alt="User"
                      width={20}
                      height={20}
                      className="filter brightness-0 invert"
                    />
                    <span className="text-sm font-medium">Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-center">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full",
                        userButtonTrigger: "focus:shadow-none"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header; 