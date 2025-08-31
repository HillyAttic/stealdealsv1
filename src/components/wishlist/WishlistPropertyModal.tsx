'use client';

import { useState, useEffect } from 'react';
import { WishlistProperty } from '@/types/auth';
import { VacantWishlistModal } from './VacantWishlistModal';
import { PlotWishlistModal } from './PlotWishlistModal';
import { FranchiseWishlistModal } from './FranchiseWishlistModal';

interface WishlistPropertyModalProps {
  property: WishlistProperty | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistPropertyModal({ property, isOpen, onClose }: WishlistPropertyModalProps) {
  // Handle escape key press and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  // Determine property type and render appropriate modal
  const propertyType = property.type?.toLowerCase();

  if (propertyType === 'vacant') {
    return <VacantWishlistModal property={property} isOpen={isOpen} onClose={onClose} />;
  } else if (propertyType === 'plot') {
    return <PlotWishlistModal property={property} isOpen={isOpen} onClose={onClose} />;
  } else if (propertyType === 'franchise') {
    return <FranchiseWishlistModal property={property} isOpen={isOpen} onClose={onClose} />;
  }

  // Fallback for unknown property types
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Property type "{propertyType}" is not supported for detailed view.
          </p>
          <p className="text-sm text-gray-500">
            Please contact us for more information about this property.
          </p>
        </div>
      </div>
    </div>
  );
}