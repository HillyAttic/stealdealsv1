"use client";

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    category: "General",
    question: "What is Stealdeals?",
    answer: "Stealdeals is a comprehensive real estate platform that helps you discover, browse, and purchase properties with ease. We connect buyers with quality properties including residential homes, commercial spaces, plots, and franchise opportunities."
  },
  {
    id: 2,
    category: "General",
    question: "How does Stealdeals work?",
    answer: "Our platform allows you to search for properties based on your preferences, view detailed listings with photos and specifications, save properties to your wishlist, and connect directly with property owners or agents. We provide a seamless experience from browsing to purchasing."
  },
  {
    id: 3,
    category: "General",
    question: "Is Stealdeals free to use?",
    answer: "Yes, browsing properties and basic features on Stealdeals are completely free for buyers. We only charge listing fees to property owners and agents who want to showcase their properties on our platform."
  },
  
  // Account & Registration
  {
    id: 4,
    category: "Account",
    question: "Do I need to create an account to browse properties?",
    answer: "No, you can browse properties without creating an account. However, creating a free account allows you to save properties to your wishlist, receive personalized recommendations, and get priority support."
  },
  {
    id: 5,
    category: "Account",
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Sign In' button in the top navigation and selecting 'Create Account'. We support registration via email or through popular social media platforms like Google and Facebook."
  },
  {
    id: 6,
    category: "Account",
    question: "I forgot my password. How can I reset it?",
    answer: "Click on 'Sign In', then select 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
  },

  // Property Search & Listings
  {
    id: 7,
    category: "Properties",
    question: "How can I search for properties?",
    answer: "Use our search bar on the homepage to enter location, property type, or specific requirements. You can also use our advanced filters to narrow down results by price range, area, amenities, and more specific criteria."
  },
  {
    id: 8,
    category: "Properties",
    question: "What types of properties are available?",
    answer: "We offer various property types including residential apartments, houses, villas, commercial spaces, office buildings, retail shops, plots and land, pre-leased properties, and franchise opportunities across different sectors."
  },
  {
    id: 9,
    category: "Properties",
    question: "Are the property prices negotiable?",
    answer: "Property prices depend on individual sellers. Many listings allow for negotiation. You can contact the property owner or agent directly through our platform to discuss pricing and make offers."
  },
  {
    id: 10,
    category: "Properties",
    question: "How often are new properties added?",
    answer: "New properties are added daily. We work with a network of verified agents and property owners to ensure fresh listings. You can set up alerts to be notified when properties matching your criteria become available."
  },

  // Wishlist & Features
  {
    id: 11,
    category: "Features",
    question: "How does the wishlist feature work?",
    answer: "The wishlist allows you to save properties you're interested in for later viewing. Simply click the heart icon on any property listing. You can access your saved properties anytime from your dashboard."
  },
  {
    id: 12,
    category: "Features",
    question: "Can I compare properties?",
    answer: "Yes, you can add multiple properties to your wishlist and compare them side by side. This helps you evaluate different options based on price, location, amenities, and other important factors."
  },

  // Buying Process
  {
    id: 13,
    category: "Buying",
    question: "How do I contact a property owner or agent?",
    answer: "Each property listing includes contact information and a 'Contact Owner' or 'Contact Agent' button. You can call, email, or send a message directly through our platform to inquire about the property."
  },
  {
    id: 14,
    category: "Buying",
    question: "Can I schedule property visits?",
    answer: "Yes, you can request property visits by contacting the owner or agent through our platform. Many of our partners offer flexible viewing schedules including virtual tours for initial screening."
  },
  {
    id: 15,
    category: "Buying",
    question: "What documents do I need to buy a property?",
    answer: "Required documents typically include identity proof, address proof, income proof, bank statements, and loan pre-approval (if applicable). Specific requirements may vary by property type and location. We recommend consulting with our legal experts."
  },
  {
    id: 16,
    category: "Buying",
    question: "Do you provide assistance with property loans?",
    answer: "Yes, we have partnerships with leading banks and financial institutions. Our loan specialists can help you find competitive rates and guide you through the loan application process."
  },

  // Franchise Opportunities
  {
    id: 17,
    category: "Franchise",
    question: "What franchise opportunities are available?",
    answer: "We offer franchise opportunities in various sectors including food & beverage, retail, education, healthcare, and service industries. Each listing includes investment requirements, expected returns, and franchisor support details."
  },
  {
    id: 18,
    category: "Franchise",
    question: "How do I evaluate a franchise opportunity?",
    answer: "Consider factors like initial investment, ongoing fees, market potential, franchisor support, and your personal interests. We provide detailed franchise information and can connect you with current franchisees for insights."
  },

  // Technical Support
  {
    id: 19,
    category: "Support",
    question: "I'm having trouble with the website. What should I do?",
    answer: "Try refreshing the page or clearing your browser cache first. If the issue persists, contact our support team at hello@stealdeals.co.in or call +91 96 3040 3080. We're available Monday to Friday, 9:00 AM to 7:00 PM."
  },
  {
    id: 20,
    category: "Support",
    question: "How can I report a problem with a listing?",
    answer: "If you find incorrect information or suspect a fraudulent listing, please report it immediately using the 'Report Issue' link on the property page or contact our support team. We take all reports seriously and investigate promptly."
  },

  // Legal & Safety
  {
    id: 21,
    category: "Legal",
    question: "How do you verify property listings?",
    answer: "We have a multi-step verification process including document verification, property ownership confirmation, and agent credential checks. However, we always recommend independent legal verification before making any purchase decisions."
  },
  {
    id: 22,
    category: "Legal",
    question: "Is my personal information safe?",
    answer: "Yes, we take data privacy seriously. We use industry-standard encryption and follow strict privacy policies. Your personal information is never shared with third parties without your consent. Read our Privacy Policy for complete details."
  },
];

const categories = ["All", "General", "Account", "Properties", "Features", "Buying", "Franchise", "Support", "Legal"];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[rgb(21,77,113)] via-[rgb(28,110,164)] to-[rgb(51,161,224)] text-white py-16 md:py-20">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(21,77,113)]/50 via-transparent to-[rgb(51,161,224)]/50 animate-pulse"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-16 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <FaQuestionCircle className="text-4xl md:text-5xl mx-auto mb-6 text-[#8CCDEB]" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-[#8CCDEB] to-white bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            
            {/* Animated Divider */}
            <div className="flex items-center justify-center mb-6 space-x-2">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[#8CCDEB] animate-pulse"></div>
              <div className="h-2 w-2 bg-[#8CCDEB] rounded-full animate-bounce"></div>
              <div className="h-1 w-24 bg-gradient-to-r from-[#8CCDEB] to-transparent animate-pulse"></div>
              <div className="h-2 w-2 bg-[#8CCDEB] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-1 w-12 bg-gradient-to-r from-[#8CCDEB] to-transparent animate-pulse"></div>
            </div>
            
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Find answers to common questions about our platform and services
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(28,110,164)] text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[rgb(28,110,164)] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-[rgb(28,110,164)]/10 text-[rgb(28,110,164)] text-xs rounded-full mr-3">
                        {faq.category}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-2">{faq.question}</h3>
                    </div>
                    <div className="ml-4">
                      {openItems.includes(faq.id) ? (
                        <FaChevronUp className="text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </button>
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No FAQs Found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-[rgb(28,110,164)] text-white px-6 py-3 rounded-lg hover:bg-[rgb(21,77,113)] transition-colors font-semibold"
              >
                Contact Support
              </Link>
              <a
                href="tel:+919630403080"
                className="bg-white text-[rgb(28,110,164)] border-2 border-[rgb(28,110,164)] px-6 py-3 rounded-lg hover:bg-[rgb(28,110,164)] hover:text-white transition-colors font-semibold"
              >
                Call: +91 96 3040 3080
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default FAQ;