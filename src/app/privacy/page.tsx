"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaShieldAlt, FaEnvelope, FaMapMarkerAlt, FaUserShield, FaFileContract, FaGlobe } from 'react-icons/fa';
import ClientOnly from '../../components/ClientOnly';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-12 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="bg-blue-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
              <FaShieldAlt className="text-white text-lg md:text-2xl" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">Privacy Policy</h1>
            <div className="w-16 md:w-24 h-1 bg-yellow-500 mx-auto mb-4 md:mb-6"></div>
            <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg px-2">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <p className="text-blue-200 mt-3 md:mt-4 text-xs md:text-sm">
              Last Updated: April 01, 2025
            </p>
          </div>
        </div>
        
        {/* Privacy Policy Content */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            
            {/* Introduction */}
            <div className="mb-8 md:mb-12">
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
                This Privacy Policy explains how Steal Deals ("we," "our," or "us") collects, uses, stores, and protects your personal information when you use our website <a href="https://stealdeals.co.in" className="text-blue-900 hover:underline break-all">https://stealdeals.co.in</a> and related services. By using our Services, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of our Services.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-900 p-4 md:p-6 rounded-r-lg">
                <p className="text-gray-700 font-medium text-sm md:text-base">
                  For any questions or concerns, you can contact us at <a href="mailto:hello@stealdeals.co.in" className="text-blue-900 hover:underline font-semibold break-all">hello@stealdeals.co.in</a>.
                </p>
              </div>
            </div>

            {/* Section 1: Information We Collect */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">1</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Information We Collect</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  We collect personal information that you voluntarily provide when you:
                </p>
                <ul className="list-disc pl-4 md:pl-6 text-gray-600 mb-4 md:mb-6 space-y-1 md:space-y-2 text-sm md:text-base">
                  <li>Register on our website</li>
                  <li>Show interest in our products or services</li>
                  <li>Participate in activities on our Services</li>
                  <li>Contact us directly</li>
                </ul>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Personal Information You Provide:</h4>
                    <ul className="text-gray-600 space-y-1 text-sm md:text-base">
                      <li>• Phone numbers</li>
                      <li>• Email addresses</li>
                      <li>• Usernames</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Sensitive Information:</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      We do not collect or process sensitive personal information (such as race, religion, or sexual orientation).
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 md:p-6 rounded-lg mb-4 md:mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Social Media Login Data:</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    If you choose to register using your social media accounts (e.g., Facebook, X), we may collect certain profile details such as your name, email, friends list, and profile picture.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Google API Data:</h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Our use of Google API information complies with the Google API Services User Data Policy, including Limited Use requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: How We Process Your Information */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">2</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">How We Process Your Information</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                  We process your personal information to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <ul className="list-disc pl-4 md:pl-6 text-gray-600 space-y-1 md:space-y-2 text-sm md:text-base">
                    <li>Facilitate account creation, authentication, and management</li>
                    <li>Respond to inquiries and provide customer support</li>
                    <li>Improve and administer our Services</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                  <ul className="list-disc pl-4 md:pl-6 text-gray-600 space-y-1 md:space-y-2 text-sm md:text-base">
                    <li>Comply with legal obligations</li>
                    <li>Communicate with you regarding updates, offers, or events</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Sharing of Information */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">3</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Sharing of Information</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                  We may share your personal information in specific cases, such as:
                </p>
                <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                    <FaFileContract className="text-red-600 mr-2 flex-shrink-0" />
                    Business Transfers:
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    During mergers, acquisitions, financing, or sale of company assets.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Social Logins */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">4</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Social Logins</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  If you log in using a social media account, we may access certain profile details provided by that platform. The information received depends on your privacy settings with the provider. Please review their privacy policies for more details.
                </p>
              </div>
            </div>

            {/* Section 5: Data Retention */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">5</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Data Retention</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law (e.g., tax or accounting obligations).
                </p>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  When no longer needed, we will delete or anonymize your data. If deletion is not possible (e.g., stored in backups), we will securely store and isolate it until deletion is possible.
                </p>
              </div>
            </div>

            {/* Section 6: Data Security */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">6</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Data Security</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-lg">
                  <div className="flex items-start">
                    <FaShieldAlt className="text-blue-600 mr-2 md:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                        We implement reasonable technical and organizational measures to protect your personal information. However, no system is 100% secure, and we cannot guarantee complete protection against unauthorized access, hacking, or data breaches.
                      </p>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        You should only access our Services in a secure environment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Children's Privacy */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">7</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Children's Privacy</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-orange-50 border border-orange-200 p-4 md:p-6 rounded-lg">
                  <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                    We do not knowingly collect or market to children under 18 years of age. If we discover that we have collected personal data from a minor, we will delete it promptly.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Parents or guardians who believe their child has provided data should contact us immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 8: Your Privacy Rights */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">8</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Your Privacy Rights</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  Depending on your location, you may have the right to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Access & Update</h4>
                    <p className="text-gray-600 text-xs md:text-sm">Review, update, or delete your personal information</p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Withdraw Consent</h4>
                    <p className="text-gray-600 text-xs md:text-sm">Withdraw consent at any time</p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Data Access</h4>
                    <p className="text-gray-600 text-xs md:text-sm">Request access to the data we hold about you</p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Data Portability</h4>
                    <p className="text-gray-600 text-xs md:text-sm">Request a copy of your data in a structured format</p>
                  </div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-900 p-4 md:p-6 rounded-r-lg">
                  <p className="text-gray-700 text-sm md:text-base">
                    To exercise these rights, contact us at <a href="mailto:hello@stealdeals.co.in" className="text-blue-900 hover:underline font-semibold break-all">hello@stealdeals.co.in</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 9: Do-Not-Track */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">9</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Do-Not-Track (DNT)</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Currently, we do not respond to browser-based Do-Not-Track signals, as no standard has been universally adopted. If such a standard emerges, we will update this policy accordingly.
                </p>
              </div>
            </div>

            {/* Section 10: Policy Updates */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">10</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Policy Updates</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  We may update this Privacy Policy from time to time to remain compliant with laws and industry practices. Updates will be reflected by the "Last Updated" date at the top. In case of significant changes, we may notify you via email or a notice on our website.
                </p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-8 rounded-xl border border-blue-200 mb-8 md:mb-12">
              <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">11</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Contact Information</h2>
              </div>
              <div className="text-center md:text-left md:ml-14">
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  If you have questions or concerns about this Privacy Policy, you may contact us at:
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

            {/* Section 12: Data Subject Access Requests */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-blue-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <span className="text-blue-900 font-bold text-sm md:text-base">12</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Review, Update, or Delete Your Data</h2>
              </div>
              <div className="ml-11 md:ml-14">
                <div className="bg-purple-50 border border-purple-200 p-4 md:p-6 rounded-lg">
                  <div className="flex items-start">
                    <FaUserShield className="text-purple-600 mr-2 md:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        You may request to review, update, or delete the personal information we hold about you by submitting a Data Subject Access Request (DSAR) or contacting us directly at <a href="mailto:hello@stealdeals.co.in" className="text-blue-900 hover:underline font-semibold break-all">hello@stealdeals.co.in</a>.
                      </p>
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
                <FaShieldAlt className="text-white text-lg md:text-2xl" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Questions About Our Privacy Policy?</h2>
              <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-lg px-2">
                We're committed to protecting your privacy and being transparent about our data practices. If you have any questions or concerns, don't hesitate to reach out.
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