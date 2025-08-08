'use client';

import { useState } from 'react';
import { UserProfile } from '@/types/auth';

interface NotificationSettingsProps {
  notifications: {
    email: boolean;
    push: boolean;
    newProperties: boolean;
    priceAlerts: boolean;
  };
  onNotificationsUpdate: (updatedProfile: UserProfile) => void;
}

export function NotificationSettings({ notifications, onNotificationsUpdate }: NotificationSettingsProps) {
  const [formData, setFormData] = useState(notifications);
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
          preferences: {
            notifications: formData
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update notification settings');
      }

      onNotificationsUpdate(data.user);
      setSuccessMessage('Notification settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationOptions = [
    {
      key: 'email' as const,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: '📧'
    },
    {
      key: 'push' as const,
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: '🔔'
    },
    {
      key: 'newProperties' as const,
      title: 'New Properties',
      description: 'Get notified when new properties matching your preferences are listed',
      icon: '🏠'
    },
    {
      key: 'priceAlerts' as const,
      title: 'Price Alerts',
      description: 'Get notified when properties in your wishlist change price',
      icon: '💰'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
      <p className="text-gray-600 mb-6">
        Choose how you want to be notified about property updates and alerts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Notification Options */}
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <span className="text-2xl">{option.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(option.key)}
                      className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${formData[option.key] ? 'bg-blue-600' : 'bg-gray-200'}
                      `}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                          ${formData[option.key] ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                About Notifications
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Email notifications are sent to your registered email address</li>
                  <li>Push notifications require browser permission</li>
                  <li>You can change these settings at any time</li>
                  <li>Some critical account notifications cannot be disabled</li>
                </ul>
              </div>
            </div>
          </div>
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
            {isLoading ? 'Updating...' : 'Update Notification Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}