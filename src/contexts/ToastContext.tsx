"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import ToastContainer from '@/components/ui/ToastContainer';
import { ToastData, ToastType } from '@/components/ui/Toast';

// Counter for generating unique IDs without Date.now() or Math.random()
let idCounter = 0;

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, options?: Partial<ToastData>) => void;
  showSuccess: (title: string, message?: string, options?: Partial<ToastData>) => void;
  showError: (title: string, message?: string, options?: Partial<ToastData>) => void;
  showWarning: (title: string, message?: string, options?: Partial<ToastData>) => void;
  showInfo: (title: string, message?: string, options?: Partial<ToastData>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateId = useCallback(() => {
    // Use a counter-based approach to avoid Date.now() and Math.random() hydration issues
    return `toast-${++idCounter}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType, 
    title: string, 
    message?: string, 
    options: Partial<ToastData> = {}
  ) => {
    const id = generateId();
    const toast: ToastData = {
      id,
      type,
      title,
      message,
      duration: options.duration ?? (type === 'error' ? 8000 : 5000), // Errors stay longer
      action: options.action,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Return the ID so callers can manually remove if needed
    return id;
  }, [generateId]);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return showToast('success', title, message, options);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return showToast('error', title, message, options);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return showToast('warning', title, message, options);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return showToast('info', title, message, options);
  }, [showToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isMounted && <ToastContainer toasts={toasts} onClose={removeToast} />}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};