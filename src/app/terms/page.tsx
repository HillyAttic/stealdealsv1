"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaFileContract, FaGavel, FaEnvelope, FaMapMarkerAlt, FaUserShield, FaShieldAlt, FaGlobe, FaExclamationTriangle } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-12 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="bg-blue-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
              <FaFileContract className="text-white text-lg md:text-2xl" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">Terms and Conditions</h1>
            <div className="w-16 md:w-24 h-1 bg-yellow-500 mx-auto mb-4 md:mb-6"></div>
            <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg px-2">
              Please read these terms and conditions carefully before using our services. By using Steal Deals, you agree to these terms.
            </p>
            <p className="text-blue-200 mt-3 md:mt-4 text-xs md:text-sm">
              Last Updated: April 01, 2025
            </p>
          </div>
        </div>
        
        {/* Terms Content */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            
            {/* Introduction */}
            <div className="mb-8 md:mb-12">
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
                Welcome to Steal Deals ("we," "us," "our," "Steal Deals"). By accessing or using our website located at <a href="https://stealdeals.co.in" className="text-blue-900 hover:underline break-all">https://stealdeals.co.in</a> (the "Site") and any related services (collectively, the "Services"), you ("you," "your," "user") agree to be bound by these Terms and Conditions ("Terms").
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-6 rounded-r-lg">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mr-2 md:mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 font-medium text-sm md:text-base">
                    If you do not agree to all of these Terms, you are expressly prohibited from using the Site and Services and must discontinue use immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">1</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Acceptance of Terms</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  These Terms constitute a legally binding agreement between you and Steal Deals. We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon posting on the Site.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 md:p-6 rounded-lg">
                  <p className="text-gray-700 text-sm md:text-base font-medium">
                    Your continued use of the Services after changes are posted constitutes your acceptance of the modified Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Definitions */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">2</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Definitions</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">"Content"</h4>
                    <p className="text-gray-600 text-sm md:text-base">All text, graphics, interfaces, photographs, trademarks, logos, sounds, music, artwork, product descriptions, and deal information.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">"User Account"</h4>
                    <p className="text-gray-600 text-sm md:text-base">The account you create to access certain features of our Services.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">"User Content"</h4>
                    <p className="text-gray-600 text-sm md:text-base">Content that you submit or post to the Site, such as comments, reviews, or deal submissions.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">"Third-Party Links"</h4>
                    <p className="text-gray-600 text-sm md:text-base">Links on our Site that direct you to external websites, including online retailers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: User Accounts */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">3</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">User Accounts</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  To access certain features, you may be required to register for an account. You agree to:
                </p>
                <ul className="list-disc pl-4 md:pl-6 text-gray-600 mb-4 md:mb-6 space-y-1 md:space-y-2 text-sm md:text-base">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information to keep it accurate</li>
                  <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                </ul>
                <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg">
                  <p className="text-gray-700 text-sm md:text-base">
                    <strong>Important:</strong> We reserve the right to suspend or terminate your account, refuse service, or remove/edit content at our sole discretion for any reason, including if we believe you have violated these Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Intellectual Property Rights */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">4</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Intellectual Property Rights</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  Unless otherwise indicated, the Site and all Content are our proprietary property and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                
                <div className="bg-green-50 border border-green-200 p-4 md:p-6 rounded-lg mb-4 md:mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Our License to You:</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site and Content for your personal, non-commercial use.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Prohibited Use - You may not:</h4>
                  <ul className="text-gray-600 text-sm md:text-base space-y-1">
                    <li>• Republish, sell, rent, or sub-license material from the Site</li>
                    <li>• Reproduce, duplicate, copy, or exploit Content for commercial purpose</li>
                    <li>• Modify, create derivative works of, or reverse engineer any part of the Site</li>
                    <li>• Use our trademarks, logos, or branding without prior written consent</li>
                    <li>• Use data mining, robots, or similar data gathering tools on the Site</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5: User Conduct and Responsibilities */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">5</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">User Conduct and Responsibilities</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  You agree to use the Site and Services only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Site.
                </p>
                
                <div className="bg-orange-50 border border-orange-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Prohibited behavior includes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <ul className="text-gray-600 text-sm md:text-base space-y-1">
                      <li>• Harassing, insulting, or causing distress to any other user</li>
                      <li>• Posting unlawful, defamatory, obscene, or offensive content</li>
                      <li>• Uploading content with viruses or malicious code</li>
                    </ul>
                    <ul className="text-gray-600 text-sm md:text-base space-y-1">
                      <li>• Disrupting or interfering with our Services or servers</li>
                      <li>• Impersonating any person or entity</li>
                      <li>• Attempting unauthorized access to accounts or systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: User-Generated Content */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">6</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">User-Generated Content</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  The Site may include features that allow you to post comments, reviews, or submit deals.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Ownership:</h4>
                    <p className="text-gray-600 text-sm md:text-base">You retain ownership of any intellectual property rights in the User Content you submit.</p>
                  </div>
                  <div className="bg-purple-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">License to Us:</h4>
                    <p className="text-gray-600 text-sm md:text-base">You grant us a worldwide, perpetual, irrevocable, royalty-free license to use, reproduce, modify, and distribute such content.</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Your Warranties - You represent and warrant that:</h4>
                  <ul className="text-gray-600 text-sm md:text-base space-y-1">
                    <li>• You own or control all rights to the User Content</li>
                    <li>• The User Content is accurate and not misleading</li>
                    <li>• The User Content does not violate these Terms or any third-party rights</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 7: Third-Party Links and Deal Information */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">7</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Third-Party Links and Deal Information</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  Our Service primarily functions as a deal aggregator.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">No Endorsement:</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      The inclusion of any link to a third-party website (e.g., Amazon, Flipkart, etc.) does not imply endorsement by Steal Deals. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Deal Accuracy:</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      We strive to provide accurate and current deal information. However, we do not guarantee the accuracy, completeness, or availability of any deal, coupon code, or price listed. Prices and availability are set by the retailers and are subject to change without notice.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Your Responsibility:</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      You acknowledge that any transactions you enter into with a third-party retailer are solely between you and that retailer. Steal Deals is not a party to such transactions and shall have no liability whatsoever in relation to such transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Disclaimer of Warranties; Limitation of Liability */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">8</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Disclaimer of Warranties; Limitation of Liability</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-6 rounded-r-lg mb-4 md:mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">"As Is" Basis:</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    YOUR USE OF THE SITE AND SERVICES IS AT YOUR SOLE RISK. THE SITE AND ALL CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 md:p-6 rounded-lg mb-4 md:mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">No Guarantees:</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    We do not guarantee that the Site will be uninterrupted, secure, or error-free; that defects will be corrected; or that the Site is free of viruses or other harmful components.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Limitation of Liability:</h4>
                  <p className="text-gray-600 text-sm md:text-base mb-3">
                    TO THE FULLEST EXTENT PERMITTED BY LAW, STEAL DEALS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="text-gray-600 text-sm md:text-base space-y-1">
                    <li>• Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>• Your access to or use of or inability to access or use the Services</li>
                    <li>• Any conduct or content of any third party on the Services</li>
                    <li>• Any unauthorized access to or use of our servers and/or personal information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 9: Indemnification */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">9</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Indemnification</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-purple-50 border border-purple-200 p-4 md:p-6 rounded-lg">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    You agree to defend, indemnify, and hold harmless Steal Deals and its licensors, suppliers, officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Site.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 10: Termination */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">10</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Termination</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
                    We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including a breach of the Terms.
                  </p>
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    Upon termination, your right to use the Services will cease immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 11: Governing Law and Dispute Resolution */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">11</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Governing Law and Dispute Resolution</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-lg">
                    <div className="flex items-start">
                      <FaGavel className="text-blue-600 mr-2 md:mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Governing Law:</h4>
                        <p className="text-gray-600 text-sm md:text-base">
                          These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Dispute Resolution:</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Any dispute shall be first attempted to be resolved amicably through negotiation. If the dispute cannot be resolved within thirty (30) days, it shall be referred to arbitration in Noida, Uttar Pradesh, India, in accordance with the Arbitration and Conciliation Act, 1996.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 12: Miscellaneous */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">12</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Miscellaneous</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Severability:</h4>
                    <p className="text-gray-600 text-sm md:text-base">If any provision is held invalid, the remaining provisions will remain in effect.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Entire Agreement:</h4>
                    <p className="text-gray-600 text-sm md:text-base">These Terms constitute the entire agreement between you and Steal Deals.</p>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">No Waiver:</h4>
                    <p className="text-gray-600 text-sm md:text-base">Our failure to enforce any right will not be considered a waiver of those rights.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-8 rounded-xl border border-blue-200 mb-8 md:mb-12">
              <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">13</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Contact Information</h2>
              </div>
              <div className="text-center md:text-left md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                  <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4 md:mb-6">Steal Deals</h3>
                  <div className="space-y-4 md:space-y-6 max-w-sm mx-auto">
                    <div className="flex flex-col items-center md:flex-row md:items-start md:text-left text-center">
                      <FaMapMarkerAlt className="text-blue-600 mb-2 md:mb-0 md:mr-3 md:mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 font-medium text-sm md:text-base mb-1">Address:</p>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                          Ofis Square, The Iconic Corenthum<br/>
                          Noida Sector - 62<br/>
                          Noida, Uttar Pradesh 201301<br/>
                          India
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:flex-row md:items-center md:text-left text-center">
                      <FaEnvelope className="text-blue-600 mb-2 md:mb-0 md:mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 font-medium text-sm md:text-base mb-1">Email:</p>
                        <a href="mailto:hello@stealdeals.co.in" className="text-blue-900 hover:underline font-semibold text-sm md:text-base break-all">
                          hello@stealdeals.co.in
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-8 md:py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-blue-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FaFileContract className="text-white text-lg md:text-2xl" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Questions About Our Terms?</h2>
              <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-lg px-2">
                We're here to help clarify any aspect of our Terms and Conditions. Feel free to reach out if you have any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                <a 
                  href="mailto:hello@stealdeals.co.in" 
                  className="bg-white text-blue-900 hover:bg-blue-50 py-2 md:py-3 px-6 md:px-8 rounded-md font-semibold transition-colors inline-flex items-center justify-center text-sm md:text-base"
                >
                  <FaEnvelope className="mr-2" />
                  Contact Us
                </a>
                <a 
                  href="/contact" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-2 md:py-3 px-6 md:px-8 rounded-md font-semibold transition-colors inline-flex items-center justify-center text-sm md:text-base"
                >
                  <FaGlobe className="mr-2" />
                  Visit Contact Page
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
}