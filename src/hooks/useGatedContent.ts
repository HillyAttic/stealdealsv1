import { useState, useEffect, useCallback } from 'react';

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
      console.log('[GatedContent] Loading from localStorage with key:', getStorageKey());
      const stored = localStorage.getItem(getStorageKey());
      console.log('[GatedContent] Stored data:', stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[GatedContent] Parsed data:', parsed);
        setUnlockedContent(parsed);
      } else {
        console.log('[GatedContent] No stored data found, starting with empty state');
        setUnlockedContent({});
      }
    } catch (error) {
      console.error('[GatedContent] Error loading unlocked content:', error);
      setUnlockedContent({});
    } finally {
      setIsLoaded(true);
      console.log('[GatedContent] Loading complete');
    }
  }, [getStorageKey, isClient]);

  // Save to localStorage whenever unlockedContent changes (client-side only)
  useEffect(() => {
    if (!isClient || !isLoaded) return;
    
    try {
      console.log('[GatedContent] Saving to localStorage:', unlockedContent);
      localStorage.setItem(getStorageKey(), JSON.stringify(unlockedContent));
      console.log('[GatedContent] Save successful');
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
    console.log(`[GatedContent] Content state for ${contentId}:`, isUnlocked ? 'unlocked' : 'locked');
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
    console.log(`[GatedContent] Unlocking content: ${contentId}`);
    setUnlockedContent(prev => {
      const newState = {
        ...prev,
        [contentId]: true
      };
      console.log('[GatedContent] New unlocked content state:', newState);
      return newState;
    });
  }, []);

  // Reset all unlocked content (for testing purposes)
  const resetUnlockedContent = useCallback(() => {
    console.log('[GatedContent] Resetting all unlocked content');
    setUnlockedContent({});
    if (isClient) {
      try {
        localStorage.removeItem(getStorageKey());
        console.log('[GatedContent] localStorage cleared');
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