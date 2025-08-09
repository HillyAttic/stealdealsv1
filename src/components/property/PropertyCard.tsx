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
  superArea?: number;
  carpetArea?: number;
  length?: number;
  width?: number;
  height?: number;
}

interface PropertyCardProps {
  property: Property;
  linkPath?: string;
  className?: string;
  showWishlist?: boolean;
}

export function PropertyCard({ 
  property, 
  linkPath,
  className = '',
  showWishlist = true
}: PropertyCardProps) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Memoized callback to prevent unnecessary re-renders
  const handleAuthRequired = useCallback(() => {
    setShowAuthPrompt(true);
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
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 h-full ${className}`}>
      <div className="relative">
        <div className="h-64 relative overflow-hidden">
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
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
          {property.location || property.title || 'Property'}
        </h3>
        
        {/* Location Details */}
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">Location Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <span className="text-blue-900 font-medium mr-1">State:</span>
              <span className="text-gray-800">{property.state || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-900 font-medium mr-1">City:</span>
              <span className="text-gray-800">{property.city || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-900 font-medium mr-1">District:</span>
              <span className="text-gray-800">{property.district || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-900 font-medium mr-1">Sub-District:</span>
              <span className="text-gray-800">{property.subDistrict || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Unit Details */}
        <div className="bg-yellow-50 p-3 rounded-md mb-3">
          <h4 className="font-semibold text-yellow-800 mb-2 border-b border-yellow-200 pb-1">Unit Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Category:</span>
              <span className="text-gray-800">{property.category || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Floor:</span>
              <span className="text-gray-800">{property.floor || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Facing:</span>
              <span className="text-gray-800">{property.facing || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Property Type:</span>
              <span className="text-gray-800">{property.propertyType || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Ref:</span>
              <span className="text-gray-800">{property.reference || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-800 font-medium mr-1">Contact:</span>
              <span className="text-gray-800">{property.contactName || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Area Details */}
        <div className="bg-green-50 p-3 rounded-md mb-3">
          <h4 className="font-semibold text-green-800 mb-2 border-b border-green-200 pb-1">Area Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <span className="text-green-800 font-medium mr-1">Super Area:</span>
              <span className="text-gray-800">{property.superArea ? `${property.superArea} sq.ft.` : 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-800 font-medium mr-1">Carpet Area:</span>
              <span className="text-gray-800">{property.carpetArea ? `${property.carpetArea} sq.ft.` : 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-800 font-medium mr-1">Length:</span>
              <span className="text-gray-800">{property.length ? `${property.length} ft` : 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-800 font-medium mr-1">Width:</span>
              <span className="text-gray-800">{property.width ? `${property.width} ft` : 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-800 font-medium mr-1">Height:</span>
              <span className="text-gray-800">{property.height ? `${property.height} ft` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-red-50 p-3 rounded-md">
          <h4 className="font-semibold text-red-800 mb-2 border-b border-red-200 pb-1">Financial Details</h4>
          <div className="flex items-center text-lg font-bold">
            <span className="text-red-800 mr-2">
              {property.rent ? 'Rent:' : 'Price:'}
            </span>
            <span className="text-gray-800">
              {getDisplayPrice() ? `${formatCurrency(getDisplayPrice())}${getPriceLabel()}` : 'Not available'}
            </span>
          </div>
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

      {/* Auth Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in to save properties"
        feature="wishlist"
      />
    </>
  );
}