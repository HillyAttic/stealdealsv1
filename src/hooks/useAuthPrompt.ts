'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface AuthPromptOptions {
  feature?: string;
  title?: string;
  message?: string;
  redirectPath?: string;
  onAuthSuccess?: () => void;
}

export function useAuthPrompt() {
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [promptOptions, setPromptOptions] = useState<AuthPromptOptions>({});

  const requireAuth = useCallback((
    callback: () => void,
    options: AuthPromptOptions = {}
  ) => {
    if (isAuthenticated) {
      callback();
    } else {
      setPromptOptions(options);
      setShowAuthPrompt(true);
    }
  }, [isAuthenticated]);

  const closePrompt = useCallback(() => {
    setShowAuthPrompt(false);
    setPromptOptions({});
  }, []);

  const handleAuthSuccess = useCallback(() => {
    promptOptions.onAuthSuccess?.();
    closePrompt();
  }, [promptOptions, closePrompt]);

  return {
    showAuthPrompt,
    promptOptions,
    requireAuth,
    closePrompt,
    handleAuthSuccess,
    isAuthenticated
  };
}