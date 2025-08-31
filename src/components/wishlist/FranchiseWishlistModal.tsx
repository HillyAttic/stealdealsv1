'use client';

import { useState } from 'react';
import { WishlistProperty } from '@/types/auth';
import { useSecureGatedContent } from '@/hooks/useSecureGatedContent';

interface FranchiseWishlistModalProps {
  property: WishlistProperty;
  isOpen: boolean;
  onClose: () => void;
}

export function FranchiseWishlistModal({ property, isOpen, onClose }: FranchiseWishlistModalProps) {
  const [showGatedModal, setShowGatedModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Secure gated content state
  const { isContentUnlocked, unlockContent } = useSecureGatedContent('franchise');
  const franchiseId = property.id || `franchise-${property.title?.replace(/\s+/g, '-').toLowerCase()}`;
  const isUnlocked = isContentUnlocked(franchiseId);

  if (!isOpen || !property) return null;

  // Check if property has investor discovery kit
  const hasInvestorKit = property.investorDiscoveryKitUrl || (property as any).investorDiscoveryKit?.url;

  const handleInvestorKitClick = () => {
    const kitUrl = property.investorDiscoveryKitUrl || (property as any).investorDiscoveryKit?.url;
    if (isUnlocked && kitUrl) {
      // Open download link if available
      window.open(kitUrl, '_blank');
    } else {
      setShowGatedModal(true);
    }
  };

  const handleGatedSuccess = async () => {
    setShowGatedModal(false);
    try {
      await unlockContent(franchiseId);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to unlock content:', error);
      // Could show error message to user here
    }
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
              <p className="text-primary/20 text-sm">{property.category || 'Education'} • {property.segment || 'Play Schools'}</p>
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
                    <div className="relative w-full h-full">
                      <img 
                        alt={`${property.title} - Image 1`}
                        loading="lazy"
                        decoding="async" 
                        data-nimg="fill"
                        className="rounded-lg"
                        src={property.images[0] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSijDpOt1YPeD97-C2VoUhfcXn2J2f_Bkh4olrS9tQXe88B4mgbbp3ifK7mJxWxXW5TY_E&usqp=CAU'} 
                        style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', objectFit: 'cover', color: 'transparent' }}
                      />
                    </div>
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
                  <p className="text-sm text-secondary mt-1">Category: {property.segment || 'Play Schools'}</p>
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
                        <p className="text-gray-700">FOFO, COCO</p>
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
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex-1 flex flex-col justify-between">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
                            </svg>
                            ROI Expected
                          </h4>
                          <p className="text-xl font-bold text-secondary">Contact for details</p>
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
                          <p className="text-lg font-semibold text-accent">12-18 (months)</p>
                        </div>
                        <div className="bg-highlight/20 p-4 rounded-lg border border-highlight/40 flex-1 flex flex-col justify-between">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4zM544 128.2v223.9c0 17.7 14.3 32 32 32h64V128.2h-96zm48 223.9c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM0 384h64c17.7 0 32-14.3 32-32V128.2H0V384zm48-63.9c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16c0-8.9 7.2-16 16-16zm435.9 18.6L334.6 217.5l-30 27.5c-29.7 27.1-75.2 24.5-101.7-4.4-26.9-29.4-24.8-74.9 4.4-101.7L289.1 64h-83.8c-8.5 0-16.6 3.4-22.6 9.4L128 128v223.9h18.3l90.5 81.9c27.4 22.3 67.7 18.1 90-9.3l.2-.2 17.9 15.5c15.9 13 39.4 10.5 52.3-5.4l31.4-38.6 5.4 4.4c13.7 11.1 33.9 9.1 45-4.7l9.5-11.7c11.2-13.8 9.1-33.9-4.6-45.1z"></path>
                            </svg>
                            Royalty Fee
                          </h4>
                          <p className="text-lg font-semibold text-primary">NO ROYALTY</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Requirements */}
                <div className="bg-white rounded-xl shadow-lg border border-secondary/10">
                  <div className="bg-secondary px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path>
                      </svg>
                      Operational Requirements
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path>
                          </svg>
                          Space Required
                        </h4>
                        <p className="text-gray-700">2500 - 3000 sq.ft.</p>
                      </div>
                      <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="mr-2 text-secondary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                          </svg>
                          Location
                        </h4>
                        <p className="text-gray-700">{property.location || 'GHAZIABAD'}</p>
                      </div>
                      <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="mr-2 text-accent" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M320 384H128V224H64v256c0 17.7 14.3 32 32 32h256c17.7 0 32-14.3 32-32V224h-64v160zm314.6-241.8l-85.3-128c-6-8.9-16-14.2-26.7-14.2H117.4c-10.7 0-20.7 5.3-26.6 14.2l-85.3 128c-14.2 21.3 1 49.8 26.6 49.8H608c25.5 0 40.7-28.5 26.6-49.8zM512 496c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V224h-64v272z"></path>
                          </svg>
                          Current Outlets
                        </h4>
                        <p className="text-gray-700">50+</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Timeline */}
                <div className="bg-white rounded-xl shadow-lg border border-highlight/20">
                  <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="mr-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path>
                      </svg>
                      Company Timeline
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="mr-2 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"></path>
                          </svg>
                          Company Established
                        </h4>
                        <p className="text-xl font-bold text-secondary">2012</p>
                      </div>
                      <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 text-accent" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z"></path>
                          </svg>
                          Franchising Started
                        </h4>
                        <p className="text-xl font-bold text-primary">2012</p>
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
                      onClick={() => setShowContactModal(true)}
                      className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path>
                      </svg>
                      Request Information
                    </button>
                    <a href="tel:+919630403080" className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path>
                      </svg>
                      Call Now
                    </a>
                    {hasInvestorKit && (
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
                    )}
                    <button className="w-full bg-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"></path>
                      </svg>
                      Share Franchise
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-semibold text-primary">{property.category || 'Education'}</span>
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
      
      {/* Contact Information Modal */}
      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="bg-primary px-4 md:px-6 py-3 md:py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-white">Request Information</h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-white hover:text-primary/20 transition-colors p-1 hover:bg-white/10 rounded-lg">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" className="text-lg md:text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
                  </svg>
                </button>
              </div>
              <p className="text-primary/20 text-xs md:text-sm mt-1">Get detailed information about {property.title}</p>
            </div>
            
            <div className="p-4 md:p-6">
              <form action="https://formsubmit.co/stealdeals.co.in@gmail.com" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input type="hidden" value={`Franchise Inquiry - ${property.title} (Contact Modal)`} name="_subject" />
                <input type="hidden" value="https://stealdeals.co.in/franchise?success=true" name="_next" />
                <input type="hidden" value="false" name="_captcha" />
                <input type="hidden" value={property.title} name="franchise_name" />
                <input type="hidden" value={property.category || 'Education'} name="franchise_industry" />
                <input type="hidden" value={getInvestmentDisplay()} name="franchise_investment" />
                <input type="hidden" value={property.location || 'GHAZIABAD'} name="franchise_location" />
                <input type="hidden" value="NO ROYALTY" name="franchise_roi" />
                <input type="hidden" value="Separate Contact Modal" name="form_type" />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Franchise Name</label>
                  <input 
                    readOnly 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-primary/5 text-gray-700 cursor-not-allowed" 
                    type="text" 
                    value={property.title} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="Enter your full name" 
                      type="text" 
                      name="name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="Enter your email" 
                      type="email" 
                      name="email" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="Enter your phone number" 
                      type="tel" 
                      name="phone" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Investment Budget</label>
                    <select 
                      name="investment_budget" 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select your budget range</option>
                      <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                      <option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                      <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                      <option value="₹50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                      <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                    </select>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea 
                    name="message" 
                    rows={3} 
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="Tell us about your franchise requirements..."
                  ></textarea>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6 md:col-span-2">
                  <button 
                    type="button" 
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-primary text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base">
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Gated Content Modal */}
      {showGatedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div 
              className="px-4 md:px-6 py-3 md:py-4 rounded-t-2xl" 
              style={{background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164), rgb(51, 161, 224))'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-white mr-3 text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path>
                  </svg>
                  <h3 className="text-lg md:text-xl font-bold text-white">Unlock Investor Discovery Kit</h3>
                </div>
                <button 
                  onClick={() => setShowGatedModal(false)}
                  className="text-white hover:text-white/70 transition-colors p-1 hover:bg-white/10 rounded-lg">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" className="text-lg md:text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
                  </svg>
                </button>
              </div>
              <p className="text-white/80 text-xs md:text-sm mt-1">Please provide your details to access the investor discovery kit for {property.title}</p>
            </div>
            
            <div className="p-4 md:p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input type="hidden" value={`Investor Discovery Kit Request - ${property.title} (Gated Content)`} name="_subject" />
                <input type="hidden" value="http://localhost:3002/franchise?kit_unlocked=true" name="_next" />
                <input type="hidden" value="false" name="_captcha" />
                <input type="hidden" value={property.title} name="franchise_name" />
                <input type="hidden" value={property.category || 'Education'} name="franchise_industry" />
                <input type="hidden" value={getInvestmentDisplay()} name="franchise_investment" />
                <input type="hidden" value={property.location || 'GHAZIABAD'} name="franchise_location" />
                <input type="hidden" value="NO ROYALTY" name="franchise_roi" />
                <input type="hidden" value="Gated Content - Investor Discovery Kit" name="form_type" />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Franchise Name</label>
                  <input 
                    readOnly 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed" 
                    type="text" 
                    value={property.title}
                    style={{backgroundColor: 'rgba(21, 77, 113, 0.05)'}} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" 
                      placeholder="Enter your full name" 
                      type="text" 
                      name="name"
                      style={{'--tw-ring-color': '#154D71'} as React.CSSProperties} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" 
                      placeholder="Enter your email" 
                      type="email" 
                      name="email" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:col-span-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      required 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" 
                      placeholder="Enter your phone number" 
                      type="tel" 
                      name="phone" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Investment Budget</label>
                    <select 
                      name="investment_budget" 
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                      <option value="">Select your budget range</option>
                      <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                      <option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                      <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                      <option value="₹50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                      <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                    </select>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea 
                    name="message" 
                    rows={3} 
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" 
                    placeholder="Tell us about your franchise requirements..."
                  ></textarea>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6 md:col-span-2">
                  <button 
                    type="button" 
                    onClick={() => setShowGatedModal(false)}
                    className="flex-1 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base disabled:opacity-50">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    onClick={handleGatedSuccess}
                    className="flex-1 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base disabled:opacity-50 flex items-center justify-center"
                    style={{background: 'linear-gradient(to right, rgb(21, 77, 113), rgb(28, 110, 164))'}}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                    </svg>
                    Unlock Discovery Kit
                  </button>
                </div>
              </form>
            </div>
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