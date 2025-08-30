import { useState, useEffect, useCallback, useRef } from 'react';

interface UnlockedContent {
  [contentId: string]: boolean;
}

export type ContentType = 'franchise' | 'plot';

// Define content states more explicitly
export type ContentState = 'loading' | 'locked' | 'unlocked';

export function useGatedContent(contentType: ContentType = 'franchise') {
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent>({});
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastSavedRef = useRef<string>('{}'); // Track last saved state to prevent unnecessary saves
  
  // Get storage key based on content type
  const getStorageKey = useCallback(() => {
    switch (contentType) {
      case 'plot':
        return 'stealdeals-unlocked-plot-investor-kits';
      case 'franchise':
      default:
        return 'stealdeals-unlocked-investor-kits';
    }
  }, [contentType]);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load unlocked content from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setUnlockedContent(parsed);
        lastSavedRef.current = stored; // Track the loaded state
      } else {
        setUnlockedContent({});
        lastSavedRef.current = '{}';
      }
    } catch (error) {
      console.error('[GatedContent] Error loading unlocked content:', error);
      setUnlockedContent({});
      lastSavedRef.current = '{}';
    } finally {
      setIsLoaded(true);
    }
  }, [getStorageKey, isClient]);

  // Save to localStorage whenever unlockedContent changes (client-side only)
  useEffect(() => {
    if (!isClient || !isLoaded) return;
    
    try {
      const currentState = JSON.stringify(unlockedContent);
      
      // Only save if the state actually changed
      if (currentState !== lastSavedRef.current) {
        localStorage.setItem(getStorageKey(), currentState);
        lastSavedRef.current = currentState;
      }
    } catch (error) {
      console.error('[GatedContent] Error saving unlocked content:', error);
    }
  }, [unlockedContent, getStorageKey, isClient, isLoaded]);

  // Get content state for a specific content ID
  const getContentState = useCallback((contentId: string): ContentState => {
    if (!isClient || !isLoaded) {
      return 'loading';
    }
    
    const isUnlocked = unlockedContent[contentId] === true;
    return isUnlocked ? 'unlocked' : 'locked';
  }, [unlockedContent, isClient, isLoaded]);

  // Check if content is unlocked for a specific content ID
  const isContentUnlocked = useCallback((contentId: string): boolean => {
    const state = getContentState(contentId);
    return state === 'unlocked';
  }, [getContentState]);

  // Check if content is in loading state
  const isContentLoading = useCallback((contentId: string): boolean => {
    const state = getContentState(contentId);
    return state === 'loading';
  }, [getContentState]);

  // Unlock content for a specific content ID
  const unlockContent = useCallback((contentId: string) => {
    setUnlockedContent(prev => {
      // Don't update if already unlocked
      if (prev[contentId] === true) {
        return prev;
      }
      
      return {
        ...prev,
        [contentId]: true
      };
    });
  }, []);

  // Reset all unlocked content (for testing purposes)
  const resetUnlockedContent = useCallback(() => {
    setUnlockedContent({});
    if (isClient) {
      try {
        localStorage.removeItem(getStorageKey());
        lastSavedRef.current = '{}';
      } catch (error) {
        console.error('[GatedContent] Error removing unlocked content:', error);
      }
    }
  }, [getStorageKey, isClient]);

  return {
    isContentUnlocked,
    isContentLoading,
    getContentState,
    unlockContent,
    resetUnlockedContent,
    isClient,
    isLoaded
  };
}