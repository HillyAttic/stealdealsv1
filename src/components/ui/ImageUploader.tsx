'use client';

import React, { useState, useRef, ChangeEvent } from 'react';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    display_url: string;
    delete_url: string;
  };
  error?: {
    message: string;
  };
}

interface ImageUploaderProps {
  onImageUrlGenerated?: (url: string) => void;
  className?: string;
  disabled?: boolean;
  hideUrlDisplay?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUrlGenerated, 
  className = '', 
  disabled = false,
  hideUrlDisplay = false
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '378ebef48fd44223416d6d0fa2580231';

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Uploading...');
    setUploadedUrl('');
    setIsCopied(false);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', API_KEY);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success && data.data) {
        setUploadedUrl(data.data.url);
        setStatusMessage('Upload successful!');
        
        // Call the callback function to update the parent component
        if (onImageUrlGenerated) {
          onImageUrlGenerated(data.data.url);
        }
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
      } else {
        setStatusMessage('Error uploading image');
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setStatusMessage('Failed to upload image');
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (!isUploading && !disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading || disabled}
          className={`flex items-center justify-center w-10 h-10 rounded-md border-2 border-dashed transition-all duration-200 ${
            isUploading || disabled
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
              : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer'
          }`}
          title="Upload Image"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg 
              className="w-5 h-5 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          )}
        </button>
        
        {statusMessage && (
          <span className={`text-sm ${
            statusMessage.includes('successful') || statusMessage.includes('Copied') 
              ? 'text-green-600' 
              : statusMessage.includes('Error') || statusMessage.includes('Failed')
              ? 'text-red-600'
              : 'text-blue-600'
          }`}>
            {statusMessage}
          </span>
        )}
      </div>

      {uploadedUrl && !hideUrlDisplay && (
        <div className="mt-2">
          <div
            onClick={() => copyToClipboard(uploadedUrl)}
            className="bg-gray-50 border border-gray-200 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            title="Click to copy URL"
          >
            <div className="text-xs text-gray-600 break-all">
              {isCopied ? (
                <span className="text-green-600 font-medium">✓ Copied to clipboard!</span>
              ) : (
                <>
                  <span className="font-medium">Generated URL:</span> {uploadedUrl}
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click the URL above to copy to clipboard</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;