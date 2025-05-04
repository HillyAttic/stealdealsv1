"use client";

import { FaArrowRight } from 'react-icons/fa';

const BecomeAgent = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Become a Real Estate Agent with Stealdeals
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Partner with the best in the industry.
          </p>
          
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <form className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Send
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
            <p className="text-gray-500 text-sm">
              Subscribe to our newsletter for weekly updates.
            </p>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <a 
              href="/agent-signup" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign Up as Agent
            </a>
            <a 
              href="/agent-benefits" 
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              Learn About Benefits
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeAgent; 