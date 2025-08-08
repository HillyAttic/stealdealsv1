'use client';

import { useState, useRef } from 'react';
import { UserProfile } from '@/types/auth';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate: (updatedProfile: UserProfile) => void;
}

export function AvatarUpload({ currentAvatar, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image file.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Fetch updated profile
      const profileResponse = await fetch('/api/user/profile');
      const profileData = await profileResponse.json();

      if (profileResponse.ok && profileData.success) {
        onAvatarUpdate(profileData.user);
        setSuccessMessage('Avatar updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = async () => {
    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove avatar');
      }

      // Fetch updated profile
      const profileResponse = await fetch('/api/user/profile');
      const profileData = await profileResponse.json();

      if (profileResponse.ok && profileData.success) {
        onAvatarUpdate(profileData.user);
        setSuccessMessage('Avatar removed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (error) {
      console.error('Error removing avatar:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
      
      <div className="flex items-start space-x-6">
        {/* Avatar Display */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Upload Instructions */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Upload a new profile picture. Recommended size: 200x200px or larger.
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP. Maximum file size: 5MB.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={triggerFileSelect}
                disabled={isUploading}
                className={`
                  px-4 py-2 rounded-md font-medium text-sm transition-colors
                  ${isUploading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }
                `}
              >
                {isUploading ? 'Uploading...' : 'Upload New Picture'}
              </button>

              {currentAvatar && (
                <button
                  onClick={removeAvatar}
                  disabled={isUploading}
                  className={`
                    px-4 py-2 rounded-md font-medium text-sm transition-colors
                    ${isUploading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    }
                  `}
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}