import { useState, useEffect, useCallback } from 'react';

interface UnlockedContent {
  [contentId: string]: boolean;
}

export type ContentType = 'franchise' | 'plot';

export function useGatedContent(contentType: ContentType = 'franchise') {
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent>({});
  
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

  // Load unlocked content from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        setUnlockedContent(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading unlocked content:', error);
    }
  }, [getStorageKey]);

  // Save to localStorage whenever unlockedContent changes
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(unlockedContent));
    } catch (error) {
      console.error('Error saving unlocked content:', error);
    }
  }, [unlockedContent, getStorageKey]);

  // Check if content is unlocked for a specific content ID
  const isContentUnlocked = useCallback((contentId: string): boolean => {
    return unlockedContent[contentId] || false;
  }, [unlockedContent]);

  // Unlock content for a specific content ID
  const unlockContent = useCallback((contentId: string) => {
    setUnlockedContent(prev => ({
      ...prev,
      [contentId]: true
    }));
  }, []);

  // Reset all unlocked content (for testing purposes)
  const resetUnlockedContent = useCallback(() => {
    setUnlockedContent({});
    localStorage.removeItem(getStorageKey());
  }, [getStorageKey]);

  return {
    isContentUnlocked,
    unlockContent,
    resetUnlockedContent
  };
}