'use client';

import { useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaDownload } from 'react-icons/fa';

interface SuccessMessageProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  franchiseName: string;
}

export function SuccessMessage({ isOpen, onClose, onDownload, franchiseName }: SuccessMessageProps) {
  // Auto close after 10 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[1005] p-4" 
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 100%)'
      }}
    >
      <div 
        className="relative max-w-md w-full mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-white/20 rounded-lg"
          style={{ zIndex: 10 }}
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success icon with animation */}
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
            <FaCheckCircle className="text-white text-2xl" />
          </div>

          {/* Success message */}
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Success! 🎉
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for your interest in <span className="font-semibold" style={{ color: '#154D71' }}>{franchiseName}</span>. 
            Your request has been submitted successfully and the Investor Discovery Kit is now unlocked!
          </p>

          {/* Download button */}
          <button
            onClick={onDownload}
            className="w-full text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(to right, #154D71, #1C6EA4, #33A1E0)'
            }}
          >
            <FaDownload className="mr-3 text-xl" />
            Access Discovery Kit Now
          </button>

          {/* Additional info */}
          <p className="text-sm text-gray-500">
            You can now access the investor discovery kit anytime. Our team will also contact you shortly.
          </p>
        </div>

        {/* Decorative elements */}
        <div 
          className="absolute inset-0 rounded-[24px] opacity-30"
          style={{
            background: 'linear-gradient(45deg, rgba(21, 77, 113, 0.1) 0%, rgba(28, 110, 164, 0.1) 50%, rgba(51, 161, 224, 0.1) 100%)',
            pointerEvents: 'none'
          }}
        />
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 rounded-[24px] opacity-20"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}