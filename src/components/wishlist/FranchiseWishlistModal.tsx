'use client';

import { useState } from 'react';
import { WishlistProperty } from '@/types/auth';
import { useGatedContent } from '@/hooks/useGatedContent';

interface FranchiseWishlistModalProps {
  property: WishlistProperty;
  isOpen: boolean;
  onClose: () => void;
}

export function FranchiseWishlistModal({ property, isOpen, onClose }: FranchiseWishlistModalProps) {
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Gated content state
  const { isContentUnlocked, unlockContent } = useGatedContent('franchise');
  const franchiseId = property.id || `franchise-${property.title?.replace(/\s+/g, '-').toLowerCase()}`;
  const isUnlocked = isContentUnlocked(franchiseId);

  if (!isOpen || !property) return null;

  const handleInvestorKitClick = () => {
    if (isUnlocked) {
      // Open download link if available
      window.open('#', '_blank');
    } else {
      setShowGatedModal(true);
    }
  };

  const handleGatedSuccess = () => {
    setShowGatedModal(false);
    unlockContent(franchiseId);
    setShowSuccessMessage(true);
  };

  // Get investment display based on franchise type
  const getInvestmentDisplay = () => {
    const title = property.title?.toLowerCase() || '';
    if (title.includes('kidzee') || title.includes('little leaders')) {
      return '₹20 LACS - ₹25 LACS';
    } else if (title.includes('dominos') || title.includes('subway')) {
      return '₹25 LACS - ₹35 LACS';
    } else if (title.includes('cafe')) {
      return '₹15 LACS - ₹30 LACS';
    } else if (title.includes('salon') || title.includes('spa')) {
      return '₹10 LACS - ₹20 LACS';
    } else if (title.includes('gym')) {
      return '₹20 LACS - ₹40 LACS';
    }
    return 'Contact for details';
  };

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="bg-white/95 backdrop-blur-md md:rounded-lg max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-primary text-white">
            <div>
              <h2 className="text-2xl font-bold">{property.title}</h2>
              <p className="text-white/20 text-sm">{property.category} • {property.segment || 'Franchise'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/20 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Image Gallery */}
            {property.images && property.images.length > 0 && (
              <div className="mb-6">
                <div className="relative">
                  <div className="h-96 relative overflow-hidden rounded-lg">
                    <img 
                      alt={`${property.title} - Image 1`} 
                      className="rounded-lg object-cover w-full h-full" 
                      src={property.images[0] || 'https://images.jdmagicbox.com/v2/comp/jharsuguda/c3/9999p6645.6645.190404202359.x4c3/catalogue/kidzee-pre-school-brajarajnagar-brajarajnagar-pre-schools-d1qopj0edg.jpg'} 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Product/Brand Highlight */}
                <div className="bg-gradient-to-r from-highlight/20 to-accent/10 border-l-4 border-primary p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-primary mb-2 flex items-center">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M352 160v-32C352 57.42 294.579 0 224 0 153.42 0 96 57.42 96 128v32H0v272c0 44.183 35.817 80 80 80h288c44.183 0 80-35.817 80-80V160h-96zm-192-32c0-35.29 28.71-64 64-64s64 28.71 64 64v32H160v-32zm160 120c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm-192 0c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"></path>
                    </svg>
                    Product/Brand
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">{property.title}</p>
                  <p className="text-sm text-secondary mt-1">Category: {property.category || 'Education'}</p>
                </div>

                {/* Business Overview */}
                <div className="bg-white rounded-xl shadow-lg border border-primary/10">
                  <div className="bg-primary px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M436 480h-20V24c0-13.255-10.745-24-24-24H56C42.745 0 32 10.745 32 24v456H12c-6.627 0-12 5.373-12 12v20h448v-20c0-6.627-5.373-12-12-12zM128 76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76zm0 96c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40zm52 148h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12zm76 160h-64v-84c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v84zm64-172c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12v-40c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40zm0-96c0 6.627-5.373 12-12 12h-40c-6.627 0-12-5.373-12-12V76c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v40z"></path>
                      </svg>
                      Business Overview
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">{property.description || 'NA'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z"></path>
                          </svg>
                          Business Model
                        </h4>
                        <p className="text-gray-700">FOFO</p>
                      </div>
                      <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2 text-secondary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                          </svg>
                          Target Market
                        </h4>
                        <p className="text-gray-700">{property.category || 'Education'} Industry</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white rounded-xl shadow-lg border border-accent/10">
                  <div className="bg-accent px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="mr-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M621.16 54.46C582.37 38.19 543.55 32 504.75 32c-123.17-.01-246.33 62.34-369.5 62.34-30.89 0-61.76-3.92-92.65-13.72-3.47-1.1-6.95-1.62-10.35-1.62C15.04 79 0 92.32 0 110.81v317.26c0 12.63 7.23 24.6 18.84 29.46C57.63 473.81 96.45 480 135.25 480c123.17 0 246.34-62.35 369.51-62.35 30.89 0 61.76 3.92 92.65 13.72 3.47 1.1 6.95 1.62 10.35 1.62 17.21 0 32.25-13.32 32.25-31.81V83.93c-.01-12.64-7.24-24.6-18.85-29.47zM48 132.22c20.12 5.04 41.12 7.57 62.72 8.93C104.84 170.54 79 192.69 48 192.69v-60.47zm0 285v-47.78c34.37 0 62.18 27.27 63.71 61.4-22.53-1.81-43.59-6.31-63.71-13.62zM320 352c-44.19 0-80-42.99-80-96 0-53.02 35.82-96 80-96s80 42.98 80 96c0 53.03-35.83 96-80 96zm272 27.78c-17.52-4.39-35.71-6.85-54.32-8.44 5.87-26.08 27.5-45.88 54.32-49.28v57.72zm0-236.11c-30.89-3.91-54.86-29.7-55.81-61.55 19.54 2.17 38.09 6.23 55.81 12.66v48.89z"></path>
                      </svg>
                      Financial Details
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 flex flex-col">
                        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20 flex-1 flex flex-col justify-between">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 288 512" className="mr-2 text-accent" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M209.2 233.4l-108-31.6C88.7 198.2 80 186.5 80 173.5c0-16.3 13.2-29.5 29.5-29.5h66.3c12.2 0 24.2 3.7 34.2 10.5 6.1 4.1 14.3 3.1 19.5-2l34.8-34c7.1-6.9 6.1-18.4-1.8-24.5C238 74.8 207.4 64.1 176 64V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48h-2.5C45.8 64-5.4 118.7.5 183.6c4.2 46.1 39.4 83.6 83.8 96.6l102.5 30c12.5 3.7 21.2 15.3 21.2 28.3 0 16.3-13.2 29.5-29.5 29.5h-66.3C100 368 88 364.3 78 357.5c-6.1-4.1-14.3-3.1-19.5 2l-34.8 34c-7.1 6.9-6.1 18.4 1.8 24.5 24.5 19.2 55.1 29.9 86.5 30v48c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-48.2c46.6-.9 90.3-28.6 105.7-72.7 21.5-61.6-14.6-124.8-72.5-141.7z"></path>
                            </svg>
                            Total Investment
                          </h4>
                          <p className="text-2xl font-bold text-primary">{getInvestmentDisplay()}</p>
                        </div>
                      </div>
                      <div className="space-y-4 flex flex-col">
                        <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 flex-1 flex flex-col justify-between">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-secondary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path>
                            </svg>
                            Payback Period
                          </h4>
                          <p className="text-lg font-semibold text-accent">12 -18 (months)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-4 border border-primary/10">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path>
                    </svg>
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handleInvestorKitClick}
                      className={`w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                        isUnlocked 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                          : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                      }`}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path>
                      </svg>
                      {isUnlocked ? 'Investor Discovery Kit' : 'Unlock Discovery Kit'}
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-semibold text-primary">{property.category}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Investment</span>
                        <span className="font-semibold text-secondary text-sm">{getInvestmentDisplay()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">ROI</span>
                        <span className="font-semibold text-accent">Contact for details</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Status</span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gated Content Modal */}
      {showGatedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Unlock Discovery Kit</h3>
            <p className="mb-4">Submit your details to unlock the investor discovery kit for this franchise.</p>
            <form action="https://formsubmit.co/info@stealdeals.co.in" method="POST" className="space-y-4">
              <input type="hidden" name="_subject" value="Franchise Discovery Kit Request" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.href : ''} />
              <input type="hidden" name="property_title" value={property.title} />
              <input type="hidden" name="property_id" value={property.id} />
              <input type="hidden" name="property_type" value="Franchise" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 96 3040 3080"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGatedModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleGatedSuccess}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Submit & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-green-600">Success!</h3>
            <p className="mb-4">Discovery kit unlocked! You can now download the materials.</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}