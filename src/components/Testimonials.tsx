"use client";

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

// Trusted partners data
const partners = [
  { id: 1, name: 'Fabindia' },
  { id: 2, name: 'McDonald\'s' },
  { id: 3, name: 'Burger King' },
  { id: 4, name: 'Bikanervala' },
  { id: 5, name: 'Haldiram\'s' },
  { id: 6, name: 'Cafe Coffee Day' }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our happy customers.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
          {/* Statistics */}
          <div className="w-full lg:w-1/3 mb-10 lg:mb-0 text-center lg:text-left">
            <div className="mb-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            
            <div>
              <div className="mb-2">Overall Rating:</div>
              <div className="flex items-center justify-center lg:justify-start">
                <div className="text-3xl font-bold text-blue-600 mr-2">4.88</div>
                <div className="text-gray-600 mr-2">/5</div>
                <div className="flex text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="w-full lg:w-2/3 lg:pl-12">
            <div className="bg-white p-8 rounded-lg shadow-md relative">
              <div className="text-5xl text-blue-200 absolute top-4 left-4">"</div>
              <div className="relative z-10">
                <p className="text-gray-700 text-lg mb-6 italic">
                  Stealdeals helped me find the perfect home. The property comparisons and loan estimator tools are fantastic!
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Photo</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Ramesh Kumar</div>
                    <div className="text-gray-600">Designer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trusted By */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">Trusted By:</h3>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <div key={partner.id} className="text-gray-500 font-medium text-lg">
                {partner.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 