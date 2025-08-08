'use client';

import { UserAnalytics } from '@/types/auth';

interface PropertyPreferencesProps {
  analytics: UserAnalytics;
}

export function PropertyPreferences({ analytics }: PropertyPreferencesProps) {
  const hasPropertyTypes = analytics.favoritePropertyTypes.length > 0;
  const hasLocations = analytics.preferredLocations.length > 0;

  if (!hasPropertyTypes && !hasLocations) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🔍</div>
        <div className="text-gray-500 mb-2">No preferences data yet</div>
        <p className="text-sm text-gray-400">
          Start browsing properties to discover your preferences
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Property Types */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Property Type Preferences</h4>
        {hasPropertyTypes ? (
          <div className="space-y-3">
            {analytics.favoritePropertyTypes.slice(0, 5).map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">{type.count} views</div>
                  <div className="text-sm font-medium text-blue-600">
                    {type.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-sm">No property type preferences yet</div>
          </div>
        )}
      </div>

      {/* Location Preferences */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Location Preferences</h4>
        {hasLocations ? (
          <div className="space-y-3">
            {analytics.preferredLocations.slice(0, 5).map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {location.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">{location.count} views</div>
                  <div className="text-sm font-medium text-green-600">
                    {location.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <div className="text-2xl mb-2">📍</div>
            <div className="text-sm">No location preferences yet</div>
          </div>
        )}
      </div>
    </div>
  );
}