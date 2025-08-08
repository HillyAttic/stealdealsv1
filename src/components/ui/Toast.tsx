"use client";

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 transform";
    const visibilityStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 mt-0.5 flex-shrink-0";
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <FaExclamationCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <FaExclamationTriangle className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <FaInfoCircle className={`${iconClass} text-blue-500`} />;
      default:
        return <FaInfoCircle className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="ml-3 flex-1">
        <div className="font-medium text-sm">
          {toast.title}
        </div>
        {toast.message && (
          <div className="mt-1 text-sm opacity-90">
            {toast.message}
          </div>
        )}
        {toast.action && (
          <div className="mt-2">
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium underline hover:no-underline transition-all duration-200"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
        aria-label="Close notification"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;