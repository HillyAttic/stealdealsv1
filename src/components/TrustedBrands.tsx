"use client";

import React from 'react';
import Image from 'next/image';

const brandLogos = [
  {
    id: 1,
    name: 'KFC',
    logoUrl: '/top-brands/reditkfc.png'
  },
  {
    id: 2,
    name: 'Burger King',
    logoUrl: '/top-brands/reditburgerking.png'
  },
  {
    id: 3,
    name: 'Starbucks',
    logoUrl: '/top-brands/reditstarbucks.png'
  },
  {
    id: 4,
    name: 'Haldiram\'s',
    logoUrl: '/top-brands/Haldiram\'s-Logo.wine.png'
  },
  {
    id: 5,
    name: 'Chicago Pizza',
    logoUrl: '/top-brands/chicago-pizza.png'
  },
  {
    id: 6,
    name: 'Nike',
    logoUrl: '/top-brands/reditnike.png'
  },
  {
    id: 7,
    name: 'Adidas',
    logoUrl: '/top-brands/edittadidas.png'
    
  },
  {
    id: 8,
    name: 'Zara',
    logoUrl: '/top-brands/reditzara.png'
  },
  {
    id: 9,
    name: 'Levi\'s',
    logoUrl: '/top-brands/reditlevi.png'
    
  },
  {
    id: 10,
    name: 'Raymond',
    logoUrl: '/top-brands/raymond.png'
  },
  {
    id: 11,
    name: 'Park Avenue',
    logoUrl: '/top-brands/park avenue.png'
  },
  {
    id: 12,
    name: 'Peter England',
    logoUrl: '/top-brands/peter england.png'
  }
];

const TrustedBrands = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-150">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Trusted By Leading Brands</h2>
          <div className="w-32 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="w-full overflow-hidden">
          <div className="marquee">
            <div className="marquee-content">
              {brandLogos.map((brand) => (
                <div key={brand.id} className="mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-36 w-auto object-contain filter hover:drop-shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
            <div className="marquee-content">
              {brandLogos.map((brand) => (
                <div key={`duplicate-${brand.id}`} className="mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-36 w-auto object-contain filter hover:drop-shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee {
          display: flex;
          width: 100%;
          overflow: hidden;
        }
        
        .marquee-content {
          display: flex;
          animation: marquee 35s linear infinite;
          min-width: 180%;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default TrustedBrands; 