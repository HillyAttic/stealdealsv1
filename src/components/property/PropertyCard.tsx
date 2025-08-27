'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaMapMarkerAlt, FaBuilding, FaRulerCombined } from 'react-icons/fa';
import { WishlistButton } from '@/components/wishlist';
import { AuthPrompt } from '@/components/auth';
import PropertyImage from '@/components/PropertyImage';

interface Property {
  id: string;
  title?: string;
  location?: string;
  image?: string;
  price?: number;
  rent?: number;
  askingPrice?: number;
  category?: string;
  city?: string;
  state?: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  facing?: string;
  propertyType?: string;
  reference?: string;
  contactName?: string;
  superArea?: string;
  carpetArea?: string;
  length?: string;
  width?: string;
  height?: string;
}

interface PropertyCardProps {
  property: Property;
  linkPath?: string | null;
  className?: string;
  showWishlist?: boolean;
  onClick?: () => void;
}

export function PropertyCard({ 
  property, 
  linkPath,
  className = '',
  showWishlist = true,
  onClick
}: PropertyCardProps) {
  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    // No longer needed - auth prompts are disabled
  }, []);

  // Format currency using Indian format
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '-';
    const numValue = typeof value === 'string' ? Number(value) : value;
    return `₹${numValue.toLocaleString('en-IN')}`;
  };

  // Get the main price to display
  const getDisplayPrice = () => {
    return property.rent || property.price || property.askingPrice || 0;
  };

  // Get price label
  const getPriceLabel = () => {
    if (property.rent) return '/month';
    return '';
  };

  // Determine the link path
  const getHref = () => {
    if (linkPath) return linkPath;
    
    // Default routing based on property type or category
    if (property.category?.toLowerCase().includes('vacant')) {
      return `/vacant/${property.id}`;
    }
    if (property.category?.toLowerCase().includes('franchise')) {
      return `/franchise/${property.id}`;
    }
    return `/property/${property.id}`;
  };

  const CardContent = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 h-full flex flex-col ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="h-40 relative overflow-hidden">
          <PropertyImage 
            src={property.image} 
            alt={property.location || property.title || 'Property'}
            className="transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Status badges */}
          {property.reference === 'Ready to Move-In' && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              Ready
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            For Rent
          </div>

          {/* Wishlist Button */}
          {showWishlist && (
            <div className="absolute top-4 right-4">
              <WishlistButton
                propertyId={property.id}
                size="md"
                onAuthRequired={handleAuthRequired}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-gray-800 mb-2 transition-colors hover:text-blue-600 flex-shrink-0 h-10 overflow-hidden line-clamp-2 leading-tight">
          {property.location || property.title || 'Property'}
        </h3>
        
        {/* Content container that grows to fill space */}
        <div className="flex-grow space-y-2">
          {/* Location Details */}
          <div className="bg-blue-50 p-2 rounded-md">
            <h4 className="font-semibold mb-1 border-b border-blue-200 pb-1 text-xs" style={{ color: 'rgb(28, 110, 164)' }}>Location Details</h4>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>State:</span>
                <span className="text-gray-800 truncate">{property.state || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>City:</span>
                <span className="text-gray-800 truncate">{property.city || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>District:</span>
                <span className="text-gray-800 truncate">{property.district || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1" style={{ color: 'rgb(28, 110, 164)' }}>Status:</span>
                <span className="text-gray-800 truncate">{property.subDistrict || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Unit Details */}
          <div className="bg-yellow-50 p-2 rounded-md">
            <h4 className="font-semibold text-yellow-800 mb-1 border-b border-yellow-200 pb-1 text-xs">Unit Details</h4>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center text-xs">
                <span className="text-yellow-800 font-medium mr-1">Category:</span>
                <span className="text-gray-800 truncate">{property.category || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-yellow-800 font-medium mr-1">Floor:</span>
                <span className="text-gray-800 truncate">{property.floor || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-yellow-800 font-medium mr-1">Facing:</span>
                <span className="text-gray-800 truncate">{property.facing || 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-yellow-800 font-medium mr-1">Property Type:</span>
                <span className="text-gray-800 truncate">{property.propertyType || 'N/A'}</span>
              </div>

            </div>
          </div>

          {/* Area Details */}
          <div className="bg-green-50 p-2 rounded-md">
            <h4 className="font-semibold text-green-800 mb-1 border-b border-green-200 pb-1 text-xs">Area Details</h4>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center text-xs">
                <span className="text-green-800 font-medium mr-1">Super Area:</span>
                <span className="text-gray-800 truncate">{property.superArea ? `${property.superArea} sq.ft.` : 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-800 font-medium mr-1">Carpet Area:</span>
                <span className="text-gray-800 truncate">{property.carpetArea ? `${property.carpetArea} sq.ft.` : 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-800 font-medium mr-1">Length:</span>
                <span className="text-gray-800 truncate">{property.length ? `${property.length} ft` : 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-800 font-medium mr-1">Width:</span>
                <span className="text-gray-800 truncate">{property.width ? `${property.width} ft` : 'N/A'}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-800 font-medium mr-1">Height:</span>
                <span className="text-gray-800 truncate">{property.height ? `${property.height} ft` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-red-50 p-2 rounded-md">
            <h4 className="font-semibold text-red-800 mb-1 border-b border-red-200 pb-1 text-xs">Financial Details</h4>
            <div className="flex items-center text-sm font-bold">
              <span className="text-red-800 mr-2">
                {property.rent ? 'Rent:' : 'Price:'}
              </span>
              <span className="text-gray-800">
                {getDisplayPrice() ? `${formatCurrency(getDisplayPrice())}${getPriceLabel()}` : 'Not available'}
              </span>
            </div>
          </div>
        </div>

        {/* View More Button - Always at bottom */}
        <div className="mt-3 flex-shrink-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center text-xs"
            style={{
              backgroundColor: 'rgb(28, 110, 164)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
            }}
          >
            View More Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {linkPath !== null ? (
        <Link href={getHref()}>
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </>
  );
}