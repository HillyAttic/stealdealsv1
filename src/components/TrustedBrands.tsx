"use client";

import React from 'react';
import Image from 'next/image';

const brandLogos = [
  {
    id: 1,
    name: 'McDonald\'s',
    logoUrl: 'https://blog.logomyway.com/wp-content/uploads/2017/01/mcdonalds-logo-1.jpg'
  },
  {
    id: 2,
    name: 'Lakme',
    logoUrl: 'https://1000logos.net/wp-content/uploads/2020/04/Lakme-Logo-1996.jpg'
  },
  {
    id: 3,
    name: 'ICICI Bank',
    logoUrl: 'https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/bltd43954aca6ba0c9b/67993a147787f41e28cea213/icici-bank.jpg?width=1280&auto=webp&quality=80&format=jpg&disable=upscale'
  },
  {
    id: 4,
    name: 'Patanjali',
    logoUrl: 'https://images.seeklogo.com/logo-png/27/1/patanjali-logo-png_seeklogo-271537.png'
  },
  {
    id: 5,
    name: 'KFC',
    logoUrl: 'https://play-lh.googleusercontent.com/Rc4lqcpq5_Qmk8f5VEcUA4oWaZWb9j4z5lKvM3MCXv7dSz5uvxebLK4b1v2JyCoTuw'
  },
  {
    id: 6,
    name: 'Starbucks',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/sco/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/2034px-Starbucks_Corporation_Logo_2011.svg.png'
  },
  {
    id: 7,
    name: 'Chicago Pizza',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwbR5QB__KoTPErc05YOWkljwe7Vqb95T_wA&s'
  },
  {
    id: 8,
    name: 'Adidas',
    logoUrl: 'https://static.vecteezy.com/system/resources/previews/010/994/239/non_2x/adidas-logo-black-symbol-clothes-design-icon-abstract-football-illustration-with-white-background-free-vector.jpg'
  },
  {
    id: 9,
    name: 'Zara',
    logoUrl: 'https://download.logo.wine/logo/Zara_(retailer)/Zara_(retailer)-Logo.wine.png'
  },
  {
    id: 10,
    name: 'Levi\'s',
    logoUrl: 'https://logos-world.net/wp-content/uploads/2020/05/Levis-Logo-1969.png'
  },
  {
    id: 11,
    name: 'Park Avenue',
    logoUrl: 'https://seekvectorlogo.net/wp-content/uploads/2019/03/park-avenue-vector-logo.png'
  },
  {
    id: 12,
    name: 'Haldiram\'s',
    logoUrl: 'https://i.logos-download.com/91849/22310-og-75979a4b2841b69363d0b97f6901bf17.png/Haldirams_Logo_og.png'
  },
  {
    id: 13,
    name: 'Nike',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbqjPqjigJwHu4VvBHRbIMuIO7TD9qgiE-kw&s'
  }
];

const TrustedBrands = () => {
  // Split logos into two halves
  const firstHalf = brandLogos.slice(0, Math.ceil(brandLogos.length / 2));
  const secondHalf = brandLogos.slice(Math.ceil(brandLogos.length / 2));

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-150">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'rgb(28, 110, 164)' }}>Trusted By Leading Brands</h2>
          <div className="w-32 h-1.5 mx-auto rounded-full" style={{ backgroundColor: 'rgb(28, 110, 164)' }}></div>
        </div>
        
        {/* First Row - Moving Right to Left */}
        <div className="w-full overflow-hidden mb-8">
          <div className="marquee">
            <div className="marquee-content marquee-rtl">
              {firstHalf.map((brand) => (
                <div key={brand.id} className="mx-3 sm:mx-4 md:mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto object-contain filter hover:drop-shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
            <div className="marquee-content marquee-rtl">
              {firstHalf.map((brand) => (
                <div key={`duplicate-${brand.id}`} className="mx-3 sm:mx-4 md:mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto object-contain filter hover:drop-shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row - Moving Left to Right */}
        <div className="w-full overflow-hidden">
          <div className="marquee">
            <div className="marquee-content marquee-ltr">
              {secondHalf.map((brand) => (
                <div key={brand.id} className="mx-3 sm:mx-4 md:mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto object-contain filter hover:drop-shadow-lg"
                    priority
                  />
                </div>
              ))}
            </div>
            <div className="marquee-content marquee-ltr">
              {secondHalf.map((brand) => (
                <div key={`duplicate-${brand.id}`} className="mx-3 sm:mx-4 md:mx-8 transform hover:scale-110 transition-all duration-300">
                  <Image 
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={280}
                    height={160}
                    className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto object-contain filter hover:drop-shadow-lg"
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
          position: relative;
        }
        
        .marquee-content {
          display: flex;
          min-width: 100%;
          flex-shrink: 0;
          align-items: center;
          will-change: transform;
          gap: 2rem;
        }
        
        /* Right to Left Animation */
        .marquee-rtl {
          animation: marquee-rtl 60s linear infinite;
        }
        
        /* Left to Right Animation */
        .marquee-ltr {
          animation: marquee-ltr 60s linear infinite;
        }
        
        @media (max-width: 768px) {
          .marquee-rtl {
            animation: marquee-rtl 45s linear infinite;
          }
          .marquee-ltr {
            animation: marquee-ltr 45s linear infinite;
          }
          .marquee-content {
            gap: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .marquee-rtl {
            animation: marquee-rtl 35s linear infinite;
          }
          .marquee-ltr {
            animation: marquee-ltr 35s linear infinite;
          }
          .marquee-content {
            gap: 1rem;
          }
        }
        
        /* Right to Left Keyframes */
        @keyframes marquee-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        /* Left to Right Keyframes */
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        /* Pause animation when reduced motion is preferred */
        @media (prefers-reduced-motion: reduce) {
          .marquee-rtl,
          .marquee-ltr {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
};

export default TrustedBrands; 