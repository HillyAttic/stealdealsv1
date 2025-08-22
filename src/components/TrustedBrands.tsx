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
    name: 'Brand Logo 1',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCvh-j7HsTHJ8ZckknAoiZMx9VcFmsFkv72g&s'
  },
  {
    id: 3,
    name: 'Brand Logo 2',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjp_mKFwzlqGsUav_itVOt0GCeIUJ8_e6ORQ&s'
  },
  {
    id: 4,
    name: 'Lakme',
    logoUrl: 'https://1000logos.net/wp-content/uploads/2020/04/Lakme-Logo-1996.jpg'
  },
  {
    id: 5,
    name: 'Brand Logo 3',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPwmIZ2xVzjld4x2hP10coyhiJUZMyHgG5D7QNPX2Zwy1CeSXTY_3HUSComJhGKhqMsro&usqp=CAU'
  },
  {
    id: 6,
    name: 'Brand Logo 4',
    logoUrl: 'https://i.pinimg.com/736x/de/40/70/de40705d30b98fb6838066664c4e6ca3.jpg'
  },
  {
    id: 7,
    name: 'Brand Logo 5',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCs98UThAN2wFccPiHbT2rJ3SGqst289rqdg&s'
  },
  {
    id: 8,
    name: 'Brand Logo 6',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBKNE9hcl210JFwqHDGooDNlGQOY9gUDNqRw&s'
  },
  {
    id: 9,
    name: 'ICICI Bank',
    logoUrl: 'https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/bltd43954aca6ba0c9b/67993a147787f41e28cea213/icici-bank.jpg?width=1280&auto=webp&quality=80&format=jpg&disable=upscale'
  },
  {
    id: 10,
    name: 'Patanjali',
    logoUrl: 'https://images.seeklogo.com/logo-png/27/1/patanjali-logo-png_seeklogo-271537.png'
  },
  {
    id: 11,
    name: 'Brand Logo 7',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVTVW9W-qznHR_Vo_nyQS3My-bPiAGRzJy-Q&s'
  },
  {
    id: 12,
    name: 'KFC',
    logoUrl: '/top-brands/reditkfc.png'
  },
  {
    id: 13,
    name: 'Burger King',
    logoUrl: '/top-brands/reditburgerking.png'
  },
  {
    id: 14,
    name: 'Starbucks',
    logoUrl: '/top-brands/reditstarbucks.png'
  },
  {
    id: 15,
    name: 'Haldiram\'s',
    logoUrl: '/top-brands/Haldiram\'s-Logo.wine.png'
  },
  {
    id: 16,
    name: 'Chicago Pizza',
    logoUrl: '/top-brands/chicago-pizza.png'
  },
  {
    id: 17,
    name: 'Nike',
    logoUrl: '/top-brands/reditnike.png'
  },
  {
    id: 18,
    name: 'Adidas',
    logoUrl: '/top-brands/edittadidas.png'
  },
  {
    id: 19,
    name: 'Zara',
    logoUrl: '/top-brands/reditzara.png'
  },
  {
    id: 20,
    name: 'Levi\'s',
    logoUrl: '/top-brands/reditlevi.png'
  },
  {
    id: 21,
    name: 'Raymond',
    logoUrl: '/top-brands/raymond.png'
  },
  {
    id: 22,
    name: 'Park Avenue',
    logoUrl: '/top-brands/park avenue.png'
  },
  {
    id: 23,
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
        
        {/* Marquee for all screen sizes */}
        <div className="w-full overflow-hidden">
          <div className="marquee">
            <div className="marquee-content">
              {brandLogos.map((brand) => (
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
            <div className="marquee-content">
              {brandLogos.map((brand) => (
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
          animation: marquee 60s linear infinite;
          min-width: 100%;
          flex-shrink: 0;
          align-items: center;
          will-change: transform;
          gap: 2rem;
        }
        
        @media (max-width: 768px) {
          .marquee-content {
            animation: marquee 45s linear infinite;
            min-width: 100%;
            gap: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .marquee-content {
            animation: marquee 35s linear infinite;
            min-width: 100%;
            gap: 1rem;
          }
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        /* Pause animation when reduced motion is preferred */
        @media (prefers-reduced-motion: reduce) {
          .marquee-content {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
};

export default TrustedBrands; 