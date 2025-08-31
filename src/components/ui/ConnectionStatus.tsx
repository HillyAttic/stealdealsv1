"use client";

import React, { useState, useEffect } from 'react';
import { FaWifi, FaClock, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { MdSignalWifiOff } from 'react-icons/md';
import { useEnhancedWishlistContext } from '@/contexts/EnhancedWishlistContext';
import { useToast } from '@/contexts/ToastContext';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function ConnectionStatus({ className = '', showDetails = false }: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetailedStatus, setShowDetailedStatus] = useState(showDetails);
  
  const wishlistContext = useEnhancedWishlistContext();
  const { showInfo } = useToast();
  
  const isOnline = wishlistContext.isOnline;
  const totalQueuedOperations = wishlistContext.queuedOperations;
  const hasErrors = wishlistContext.error;

  // Show status when offline or when there are queued operations
  useEffect(() => {
    setIsVisible(!isOnline || totalQueuedOperations > 0 || hasErrors);
  }, [isOnline, totalQueuedOperations, hasErrors]);

  // Auto-hide after being online for a while with no queued operations
  useEffect(() => {
    if (isOnline && totalQueuedOperations === 0 && !hasErrors) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, totalQueuedOperations, hasErrors]);

  const handleRetryOperations = async () => {
    try {
      await wishlistContext.retryFailedOperations();
      showInfo('Retry initiated', 'Attempting to sync pending operations...');
    } catch (error) {
      console.error('Error retrying operations:', error);
    }
  };

  const getStatusColor = () => {
    if (hasErrors) return 'bg-red-500';
    if (!isOnline) return 'bg-orange-500';
    if (totalQueuedOperations > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (hasErrors) return <FaExclamationTriangle className="w-4 h-4" />;
    if (!isOnline) return <MdSignalWifiOff className="w-4 h-4" />;
    if (totalQueuedOperations > 0) return <FaClock className="w-4 h-4" />;
    return <FaWifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (hasErrors) return 'Error';
    if (!isOnline) return 'Offline';
    if (totalQueuedOperations > 0) return `${totalQueuedOperations} pending`;
    return 'Online';
  };

  if (!isVisible && !showDetails) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div 
        className={`${getStatusColor()} text-white rounded-lg shadow-lg transition-all duration-300 ${
          showDetailedStatus ? 'p-4 min-w-64' : 'p-2'
        }`}
      >
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setShowDetailedStatus(!showDetailedStatus)}
        >
          {getStatusIcon()}
          <span className="ml-2 text-sm font-medium">
            {getStatusText()}
          </span>
          {!showDetailedStatus && totalQueuedOperations > 0 && (
            <div className="ml-2 bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs">
              {totalQueuedOperations}
            </div>
          )}
        </div>

        {showDetailedStatus && (
          <div className="mt-3 space-y-2">
            <div className="text-xs opacity-90">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              
              {wishlistContext.queuedOperations > 0 && (
                <div className="flex justify-between">
                  <span>Wishlist operations:</span>
                  <span>{wishlistContext.queuedOperations}</span>
                </div>
              )}
              
              {hasErrors && (
                <div className="text-red-200 mt-2">
                  {wishlistContext.error && (
                    <div>Wishlist: {wishlistContext.error}</div>
                  )}
                </div>
              )}
            </div>

            {(totalQueuedOperations > 0 || hasErrors) && (
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleRetryOperations}
                  className="flex items-center px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
                >
                  <FaSync className="w-3 h-3 mr-1" />
                  Retry
                </button>
                
                {hasErrors && (
                  <button
                    onClick={() => {
                      wishlistContext.clearError();
                    }}
                    className="px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
                  >
                    Clear Errors
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for header/navbar
export function ConnectionStatusIndicator({ className = '' }: { className?: string }) {
  const wishlistContext = useEnhancedWishlistContext();
  
  const isOnline = wishlistContext.isOnline;
  const totalQueuedOperations = wishlistContext.queuedOperations;
  const hasErrors = wishlistContext.error;

  if (isOnline && totalQueuedOperations === 0 && !hasErrors) {
    return null;
  }

  const getIndicatorColor = () => {
    if (hasErrors) return 'text-red-500';
    if (!isOnline) return 'text-orange-500';
    if (totalQueuedOperations > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${getIndicatorColor()} flex items-center`}>
        {hasErrors ? (
          <FaExclamationTriangle className="w-4 h-4" />
        ) : !isOnline ? (
          <MdSignalWifiOff className="w-4 h-4" />
        ) : (
          <FaClock className="w-4 h-4" />
        )}
        
        {totalQueuedOperations > 0 && (
          <span className="ml-1 text-xs bg-current text-white rounded-full px-1 min-w-4 h-4 flex items-center justify-center">
            {totalQueuedOperations}
          </span>
        )}
      </div>
    </div>
  );
}