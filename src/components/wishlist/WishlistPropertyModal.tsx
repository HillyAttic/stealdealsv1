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

  // Fallback for other property types - show complete details structure
  return <VacantWishlistModal property={property} isOpen={isOpen} onClose={onClose} />;
}