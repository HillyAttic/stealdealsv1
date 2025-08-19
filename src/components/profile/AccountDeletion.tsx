'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AccountDeletion() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Account deleted successfully, logout and redirect
      await logout();
      router.push('/');

    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ password: '', confirmation: '' });
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ password: '', confirmation: '' });
    setError('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Deletion</h2>
      
      {/* Warning Section */}
      <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Danger Zone
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">
                Once you delete your account, there is no going back. This action cannot be undone.
              </p>
              <p className="font-medium">The following data will be permanently deleted:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information and settings</li>
                <li>Your wishlist and saved properties</li>
                <li>Your property viewing history</li>
                <li>Your search history and preferences</li>
                <li>All activity logs and analytics data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          <p><span className="font-medium">Account Type:</span> {(user as any)?.provider === 'google' ? 'Google Account' : 'Email Account'}</p>
          <p><span className="font-medium">Member Since:</span> {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>

      {/* Delete Button */}
      <div className="flex justify-start">
        <button
          onClick={openModal}
          className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Delete My Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Account Deletion
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-4">
                  This action cannot be undone. Please confirm that you want to permanently delete your account.
                </p>

                {/* Password Field (only for email accounts) */}
                {(user as any)?.provider === 'email' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your password"
                    />
                  </div>
                )}

                {/* Confirmation Text */}
                <div>
                  <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Type "DELETE_MY_ACCOUNT" to confirm
                  </label>
                  <input
                    type="text"
                    id="confirmation"
                    name="confirmation"
                    value={formData.confirmation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="DELETE_MY_ACCOUNT"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || formData.confirmation !== 'DELETE_MY_ACCOUNT'}
                    className={`
                      px-4 py-2 rounded-md font-medium text-white transition-colors
                      ${isLoading || formData.confirmation !== 'DELETE_MY_ACCOUNT'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                      }
                    `}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}