'use client';

import { useState } from 'react';
import { UserPreferences, UserProfile } from '@/types/auth';

interface PreferencesSettingsProps {
  preferences: UserPreferences;
  onPreferencesUpdate: (updatedProfile: UserProfile) => void;
}

const propertyTypeOptions = [
  'Apartment',
  'House',
  'Condo',
  'Townhouse',
  'Studio',
  'Loft',
  'Villa',
  'Duplex'
];

const locationOptions = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC'
];

export function PreferencesSettings({ preferences, onPreferencesUpdate }: PreferencesSettingsProps) {
  const [formData, setFormData] = useState({
    propertyTypes: preferences.propertyTypes || [],
    priceRange: preferences.priceRange || { min: 0, max: 1000000 },
    locations: preferences.locations || []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: formData
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      onPreferencesUpdate(data.user);
      setSuccessMessage('Preferences updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error updating preferences:', error);
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: checked
        ? [...prev.propertyTypes, type]
        : prev.propertyTypes.filter(t => t !== type)
    }));
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      locations: checked
        ? [...prev.locations, location]
        : prev.locations.filter(l => l !== location)
    }));
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: numValue
      }
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Preferences</h2>
      <p className="text-gray-600 mb-6">
        Set your preferences to get personalized property recommendations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Property Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Property Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {propertyTypeOptions.map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.propertyTypes.includes(type)}
                  onChange={(e) => handlePropertyTypeChange(type, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Price Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-xs text-gray-500 mb-1">
                Minimum Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="minPrice"
                  value={formData.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-xs text-gray-500 mb-1">
                Maximum Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={formData.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000000"
                  min="0"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Current range: ${formData.priceRange.min.toLocaleString()} - ${formData.priceRange.max.toLocaleString()}
          </p>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Locations
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {locationOptions.map((location) => (
                <label key={location} className="flex items-center space-x-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={formData.locations.includes(location)}
                    onChange={(e) => handleLocationChange(location, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formData.locations.length} location{formData.locations.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              px-6 py-2 rounded-md font-medium text-white transition-colors
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            `}
          >
            {isLoading ? 'Updating...' : 'Update Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}