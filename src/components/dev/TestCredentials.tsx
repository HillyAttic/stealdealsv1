'use client';

import { useState } from 'react';

/**
 * Development helper component to show test credentials
 * Only shows in development mode
 */
export default function TestCredentials() {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testCredentials = [
    {
      role: 'Admin',
      email: 'admin@stealdeals.com',
      password: 'admin123',
      description: 'Full admin access'
    },
    {
      role: 'User',
      email: 'john.doe@example.com',
      password: 'admin123',
      description: 'Regular user account'
    },
    {
      role: 'User (Google)',
      email: 'jane.smith@gmail.com',
      password: 'N/A',
      description: 'Google OAuth user (use Google sign-in)'
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Test Credentials
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Test Credentials</h3>
          <div className="space-y-3">
            {testCredentials.map((cred, index) => (
              <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-blue-600">{cred.role}</span>
                </div>
                <div className="text-sm">
                  <div className="text-gray-700">
                    <strong>Email:</strong> {cred.email}
                  </div>
                  <div className="text-gray-700">
                    <strong>Password:</strong> {cred.password}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cred.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 These credentials only work in development mode
          </div>
        </div>
      )}
    </div>
  );
}